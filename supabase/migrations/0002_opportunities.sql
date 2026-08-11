-- supabase/migrations/0002_opportunities.sql
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  category text not null,
  deadline timestamptz not null,
  eligibility text not null,
  description text not null,
  url text not null,
  submitted_by_name text not null,
  submitted_by_email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  posted_to_groupme_at timestamptz,
  created_at timestamptz not null default now()
);

alter table opportunities enable row level security;

-- Anyone (including anonymous visitors -- sponsors, alumni, non-members) can submit an
-- opportunity. The check clause blocks setting any status other than 'pending' on insert, so a
-- submitter can't self-approve by crafting the request.
create policy "anyone can submit an opportunity"
  on opportunities for insert
  to anon, authenticated
  with check (status = 'pending');

-- Only officers can read the base table directly -- it holds submitter PII
-- (submitted_by_name / submitted_by_email) that the public should never see, even for
-- approved rows. Public browsing goes through the public_opportunities view below instead,
-- which never selects those columns.
create policy "officers can read all opportunities"
  on opportunities for select
  to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'officer'));

-- Officers can update status (approve/reject) and posted_to_groupme_at.
create policy "officers can update opportunities"
  on opportunities for update
  to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'officer'));

-- Public-safe view: approved rows only, no submitter PII columns. Views run with the
-- definer's privileges by default in Postgres, so granting SELECT on this view to
-- anon/authenticated exposes exactly these eight columns without granting any privileges on
-- the opportunities table itself.
create view public_opportunities as
  select id, title, company, category, deadline, eligibility, description, url
  from opportunities
  where status = 'approved';

grant select on public_opportunities to anon, authenticated;
