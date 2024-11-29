-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types for status fields
create type event_status as enum ('live', 'upcoming', 'ended');
create type room_status as enum ('live', 'upcoming', 'ended', 'off');
create type user_role as enum ('admin', 'moderator', 'speaker', 'user');
create type message_status as enum ('sending', 'delivered');

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  role user_role default 'user'::user_role,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create events table
create table events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date date not null,
  venue text not null,
  rooms_count integer default 0,
  status event_status default 'upcoming'::event_status,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references profiles(id)
);

-- Create rooms table
create table rooms (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade,
  title text not null,
  status room_status default 'upcoming'::room_status,
  thumbnail text,
  participants integer default 0,
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create room_languages table (for room language support)
create table room_languages (
  room_id uuid references rooms(id) on delete cascade,
  language text not null,
  primary key (room_id, language)
);

-- Create chat_messages table
create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  status message_status default 'delivered'::message_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create room_moderators table
create table room_moderators (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references profiles(id),
  primary key (room_id, user_id)
);

-- Create RLS policies
alter table profiles enable row level security;
alter table events enable row level security;
alter table rooms enable row level security;
alter table chat_messages enable row level security;
alter table room_moderators enable row level security;
alter table room_languages enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Events policies
create policy "Events are viewable by everyone"
  on events for select
  using (true);

create policy "Admins can create events"
  on events for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'::user_role
    )
  );

-- Rooms policies
create policy "Rooms are viewable by everyone"
  on rooms for select
  using (true);

create policy "Moderators can update rooms"
  on rooms for update
  using (
    exists (
      select 1 from room_moderators
      where room_moderators.room_id = id
      and room_moderators.user_id = auth.uid()
    )
  );

-- Chat messages policies
create policy "Chat messages are viewable by everyone"
  on chat_messages for select
  using (true);

create policy "Authenticated users can insert chat messages"
  on chat_messages for insert
  with check (auth.uid() = user_id);

-- Create functions and triggers
create function update_rooms_count() returns trigger as $$
begin
  update events
  set rooms_count = (
    select count(*) from rooms
    where event_id = new.event_id
  )
  where id = new.event_id;
  return new;
end;
$$ language plpgsql;

create trigger rooms_count_trigger
after insert or delete on rooms
for each row execute function update_rooms_count();