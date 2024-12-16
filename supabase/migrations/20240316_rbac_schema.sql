-- Update user_role enum to include all roles
alter type user_role rename to user_role_old;
create type user_role as enum ('admin', 'event_moderator', 'room_moderator', 'speaker', 'user');
alter table profiles 
  alter column role type user_role using role::text::user_role;
drop type user_role_old;

-- Create event_access_type enum
create type event_access_type as enum ('public', 'private', 'paid');

-- Add access_type to events table
alter table events 
  add column access_type event_access_type default 'public'::event_access_type,
  add column price decimal(10,2);

-- Create event_moderators table
create table event_moderators (
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  assigned_by uuid references profiles(id),
  created_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- Create room_speakers table
create table room_speakers (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  assigned_by uuid references profiles(id),
  created_at timestamptz default now(),
  primary key (room_id, user_id)
);

-- Create event_access table for private/paid events
create table event_access (
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  access_type event_access_type not null,
  granted_by uuid references profiles(id),
  created_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- Add RLS policies
alter table event_moderators enable row level security;
alter table room_speakers enable row level security;
alter table event_access enable row level security;

-- Policies for event_moderators
create policy "Event moderators can be viewed by authenticated users"
  on event_moderators for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage event moderators"
  on event_moderators
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'::user_role
    )
  );

-- Policies for room_speakers
create policy "Room speakers can be viewed by authenticated users"
  on room_speakers for select
  using (auth.role() = 'authenticated');

create policy "Event moderators can manage room speakers"
  on room_speakers
  using (
    exists (
      select 1 from event_moderators em
      join rooms r on r.event_id = em.event_id
      where em.user_id = auth.uid()
      and r.id = room_speakers.room_id
    )
  );

-- Policies for event_access
create policy "Users can view their own event access"
  on event_access for select
  using (auth.uid() = user_id);

create policy "Event moderators can manage event access"
  on event_access
  using (
    exists (
      select 1 from event_moderators
      where event_moderators.event_id = event_access.event_id
      and event_moderators.user_id = auth.uid()
    )
  );

-- Functions for role management
create or replace function check_user_role(
  user_id uuid,
  required_role user_role
) returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where profiles.id = user_id
    and profiles.role = required_role
  );
end;
$$ language plpgsql security definer;

-- Function to assign event moderator
create or replace function assign_event_moderator(
  p_event_id uuid,
  p_user_id uuid
) returns void as $$
begin
  -- Check if the executing user is an admin
  if not check_user_role(auth.uid(), 'admin'::user_role) then
    raise exception 'Only admins can assign event moderators';
  end if;

  -- Update user's role to event_moderator if they're not already
  update profiles
  set role = 'event_moderator'::user_role
  where id = p_user_id
  and role = 'user'::user_role;

  -- Insert into event_moderators
  insert into event_moderators (event_id, user_id, assigned_by)
  values (p_event_id, p_user_id, auth.uid())
  on conflict do nothing;
end;
$$ language plpgsql security definer;

-- Function to assign room moderator
create or replace function assign_room_moderator(
  p_room_id uuid,
  p_user_id uuid
) returns void as $$
declare
  v_event_id uuid;
begin
  -- Get event_id for the room
  select event_id into v_event_id
  from rooms
  where id = p_room_id;

  -- Check if the executing user is an event moderator for this event
  if not exists (
    select 1 from event_moderators
    where event_id = v_event_id
    and user_id = auth.uid()
  ) then
    raise exception 'Only event moderators can assign room moderators';
  end if;

  -- Update user's role to room_moderator if they're not already
  update profiles
  set role = 'room_moderator'::user_role
  where id = p_user_id
  and role = 'user'::user_role;

  -- Insert into room_moderators
  insert into room_moderators (room_id, user_id, assigned_by)
  values (p_room_id, p_user_id, auth.uid())
  on conflict do nothing;
end;
$$ language plpgsql security definer;