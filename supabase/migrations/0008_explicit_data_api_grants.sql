begin;

-- Keep the app working when Supabase does not grant API access to new tables
-- automatically. Existing row policies still control which rows are accessible.
grant select, insert on public.profiles to authenticated, service_role;
grant select on public.opportunities to authenticated;
grant update (status) on public.opportunities to authenticated;

commit;
