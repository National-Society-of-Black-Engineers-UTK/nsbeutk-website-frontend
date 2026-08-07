-- supabase/migrations/0001_profiles.sql
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('member', 'officer')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Every authenticated user can read the full roster (needed for the officer
-- promotion table on /officer; the page itself is still gated to officers
-- only by the app's DAL, this policy just doesn't add a second gate at the
-- database layer for reads).
create policy "profiles are readable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

-- A user can create their own profile row (self-provisioning on first
-- login), but not anyone else's.
create policy "users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- A user can update their own row, but the check clause blocks them from
-- changing their own role in the same statement.
create policy "users can update their own name"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from profiles where id = auth.uid())
  );

-- An officer can update any profile, including changing role.
create policy "officers can update any profile"
  on profiles for update
  to authenticated
  using (
    exists (
      select 1 from profiles officer
      where officer.id = auth.uid() and officer.role = 'officer'
    )
  );
