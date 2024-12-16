-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Update profiles table to include authentication fields
alter table profiles
  add column if not exists email text,
  add column if not exists last_sign_in_at timestamptz,
  add column if not exists is_email_verified boolean default false;

-- Create RLS policies for profiles
create policy "Users can read any profile"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Create function to handle new user registration
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, role)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data->>'username')::text,
      'user_' || substr(new.id::text, 1, 8)
    ),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Create function to handle user deletion
create or replace function handle_user_delete()
returns trigger as $$
begin
  delete from public.profiles where id = old.id;
  return old;
end;
$$ language plpgsql security definer;

-- Create trigger for user deletion
drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute procedure handle_user_delete();