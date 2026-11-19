begin;

-- Freeze roster writes while initializing the counter and installing the trigger.
lock table public.profiles in share row exclusive mode;

create table public.officer_role_state (
  singleton boolean primary key default true check (singleton),
  officer_count bigint not null check (officer_count >= 0)
);

insert into public.officer_role_state (officer_count)
  select count(*) from public.profiles where role = 'officer';

create table public.officer_role_audit (
  id bigint generated always as identity primary key,
  profile_id uuid not null,
  actor_id uuid,
  old_role text,
  new_role text,
  changed_at timestamptz not null default now()
);

alter table public.officer_role_state enable row level security;
alter table public.officer_role_audit enable row level security;
revoke all on public.officer_role_state, public.officer_role_audit
  from public, anon, authenticated, service_role;
grant select on public.officer_role_audit to service_role;

create function public.record_profile_role_change()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  prior_role text;
  next_role text;
  target_id uuid;
begin
  if tg_op <> 'INSERT' then
    prior_role := old.role;
    target_id := old.id;
  end if;
  if tg_op <> 'DELETE' then
    next_role := new.role;
    target_id := new.id;
  end if;

  if prior_role is not distinct from next_role then
    return null;
  end if;

  -- Both demotions and deletes serialize on this write, including cascades
  -- from auth.users. At stricter isolation, conflicts fail with a retry error.
  if prior_role = 'officer' then
    update public.officer_role_state
      set officer_count = officer_count - 1
      where singleton and officer_count > 1;
    if not found then
      raise exception 'Cannot remove the last remaining officer' using errcode = '23514';
    end if;
  elsif next_role = 'officer' then
    update public.officer_role_state
      set officer_count = officer_count + 1 where singleton;
    if not found then
      raise exception 'Officer count is unavailable';
    end if;
  end if;

  insert into public.officer_role_audit (profile_id, actor_id, old_role, new_role)
    values (target_id, auth.uid(), prior_role, next_role);
  return null;
end;
$$;

revoke all on function public.record_profile_role_change() from public, anon, authenticated;
create trigger profile_role_changed
  after insert or update of role or delete on public.profiles
  for each row execute function public.record_profile_role_change();

-- Keep direct edits scoped to names. Role updates go through the officer RPC.
revoke update on public.profiles from public, anon, authenticated;
grant update (full_name) on public.profiles to authenticated;
drop policy "officers can update any profile" on public.profiles;

create function public.set_member_role(target_id uuid, target_role text)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  -- Lock the actor's profile so a concurrent demotion cannot invalidate the
  -- authorization decision before this change takes effect.
  perform 1 from public.profiles
    where id = (select auth.uid()) and role = 'officer' for update;
  if not found then
    raise exception 'Officer role required' using errcode = '42501';
  end if;
  if target_role is null or target_role not in ('member', 'officer') then
    raise exception 'Invalid member role' using errcode = '22023';
  end if;

  update public.profiles set role = target_role where id = target_id;
  if not found then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_member_role(uuid, text) from public, anon, authenticated;
grant execute on function public.set_member_role(uuid, text) to authenticated;

commit;
