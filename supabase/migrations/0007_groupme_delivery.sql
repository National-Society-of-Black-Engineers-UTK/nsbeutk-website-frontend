begin;

create table public.groupme_deliveries (
  opportunity_id uuid primary key references public.opportunities (id) on delete cascade,
  claim_id uuid not null,
  status text not null check (status in ('pending', 'sent', 'failed', 'uncertain')),
  updated_at timestamptz not null default now()
);

create index groupme_deliveries_claim_idx on public.groupme_deliveries (claim_id);

alter table public.groupme_deliveries enable row level security;
revoke all on public.groupme_deliveries from public, anon, authenticated;
grant select, insert, update on public.groupme_deliveries to service_role;

-- A single claim protocol serves both the approval action and the digest.
-- Existing successful sends still use the original posted timestamp.
create function public.claim_groupme_deliveries(batch_id uuid, target_id uuid default null)
returns table (id uuid, title text, company text, deadline timestamptz, url text)
language sql
set search_path = ''
as $$
  with candidates as (
    select o.id, o.title, o.company, o.deadline, o.url
    from public.opportunities o
    left join public.groupme_deliveries d on d.opportunity_id = o.id
    where o.status = 'approved'
      and o.posted_to_groupme_at is null
      and o.deadline >= (((now() at time zone 'America/New_York')::date)::timestamp at time zone 'UTC')
      and (target_id is null or o.id = target_id)
      and (d.opportunity_id is null or d.status = 'failed')
    order by o.deadline, o.id
    limit 50
    for update of o skip locked
  ), claimed as (
    insert into public.groupme_deliveries as delivery (opportunity_id, claim_id, status)
      select c.id, batch_id, 'pending' from candidates c
    on conflict (opportunity_id) do update
      set claim_id = excluded.claim_id, status = 'pending', updated_at = now()
      where delivery.status = 'failed'
    returning opportunity_id
  )
  select c.id, c.title, c.company, c.deadline, c.url
  from candidates c join claimed on claimed.opportunity_id = c.id
  order by c.deadline, c.id;
$$;

create function public.finish_groupme_deliveries(batch_id uuid, outcome text)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if outcome is null or outcome not in ('sent', 'failed', 'uncertain') then
    raise exception 'Invalid delivery outcome' using errcode = '22023';
  end if;

  if outcome = 'sent' then
    -- Take locks in the same order as claim (opportunities before deliveries).
    update public.opportunities o set posted_to_groupme_at = now()
      from public.groupme_deliveries d
      where o.id = d.opportunity_id and d.claim_id = batch_id and d.status = 'pending';
  end if;
  update public.groupme_deliveries
    set status = outcome, updated_at = now()
    where claim_id = batch_id and status = 'pending';
  if not found then
    raise exception 'No pending GroupMe deliveries for this claim';
  end if;
end;
$$;

revoke all on function public.claim_groupme_deliveries(uuid, uuid),
  public.finish_groupme_deliveries(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_groupme_deliveries(uuid, uuid),
  public.finish_groupme_deliveries(uuid, text) to service_role;
grant select, update on public.opportunities to service_role;

commit;
