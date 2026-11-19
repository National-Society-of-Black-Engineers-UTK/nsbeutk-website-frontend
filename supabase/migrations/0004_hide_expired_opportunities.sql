-- Date-only deadlines use midnight UTC as their storage representation.
-- Keep the full deadline day open according to the chapter's Eastern calendar.
create or replace view public.public_opportunities as
  select id, title, company, category, deadline, eligibility, description, url
  from public.opportunities
  where status = 'approved'
    and deadline >= (((now() at time zone 'America/New_York')::date)::timestamp at time zone 'UTC');
