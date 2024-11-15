-- Create admin user function
create or replace function create_admin_user(
  email text,
  username text,
  password text
) returns void as $$
declare
  user_id uuid;
begin
  -- Create the user in auth.users
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    email,
    crypt(password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('username', username),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  returning id into user_id;

  -- Create profile with admin role
  insert into public.profiles (id, username, role)
  values (user_id, username, 'admin');
end;
$$ language plpgsql security definer;

-- Execute function to create admin user
select create_admin_user(
  'matthieu@ark.swiss',
  'Matthieu Schmid',
  '159753Yxc!'
);

-- Grant necessary permissions
grant usage on schema public to postgres;
grant all privileges on all tables in schema public to postgres;
grant all privileges on all sequences in schema public to postgres;
grant all privileges on all functions in schema public to postgres;