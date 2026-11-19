begin;

drop policy "anyone can submit an opportunity" on public.opportunities;
revoke insert on public.opportunities from public, anon, authenticated;
grant insert on public.opportunities to service_role;

alter table public.opportunities
  add constraint opportunities_field_lengths check (
    char_length(btrim(title)) between 3 and 120
    and char_length(btrim(company)) between 2 and 120
    and char_length(category) between 1 and 32
    and char_length(btrim(eligibility)) between 2 and 500
    and char_length(btrim(description)) between 10 and 3000
    and char_length(url) between 1 and 2048
    and url ~* '^https?://[^[:space:]]+$'
    and char_length(btrim(submitted_by_name)) between 2 and 120
    and char_length(submitted_by_email) between 3 and 254
  ),
  add constraint opportunities_finite_deadline check (isfinite(deadline));

-- Existing listings may age normally. Enforce the current-date rule on writes
-- that introduce or change a deadline, using the public view's date convention.
create function public.check_opportunity_deadline()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.deadline is not distinct from old.deadline then
      return new;
    end if;
  end if;
  if not isfinite(new.deadline)
    or (new.deadline at time zone 'UTC')::date < (now() at time zone 'America/New_York')::date then
    raise exception 'Opportunity deadline must be today or later in Eastern Time'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger opportunity_deadline_on_write
  before insert or update of deadline on public.opportunities
  for each row execute function public.check_opportunity_deadline();

commit;
