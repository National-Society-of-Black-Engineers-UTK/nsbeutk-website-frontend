-- Apply after 0001 and 0002, including on existing installations.
begin;

-- Avoid recursive evaluation of profiles policies when reading the caller's role.
create or replace function public.current_profile_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;
revoke all on function public.current_profile_role() from public;
grant execute on function public.current_profile_role() to authenticated;

drop policy "profiles are readable by authenticated users" on public.profiles;
create policy "users can read their profile and officers can read the roster"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.current_profile_role() = 'officer');

drop policy "users can insert their own profile" on public.profiles;
create policy "users can insert their own member profile"
  on public.profiles for insert to authenticated
  with check (
    id = (select auth.uid()) and role = 'member'
    and email = (select auth.jwt() ->> 'email')
    and email ~* '^[^[:space:]@]+@(vols[.])?utk[.]edu$'
  );

drop policy "users can update their own name" on public.profiles;
create policy "users can update their own name"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid()) and role = public.current_profile_role()
    and email = (select auth.jwt() ->> 'email')
  );

drop policy "officers can update any profile" on public.profiles;
create policy "officers can update any profile"
  on public.profiles for update to authenticated
  using (public.current_profile_role() = 'officer')
  with check (public.current_profile_role() = 'officer');

commit;
