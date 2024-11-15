-- Add policies for admin access
create policy "Admins can do anything"
  on profiles
  using (role = 'admin'::user_role);

create policy "Admins have full access to events"
  on events
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'::user_role
    )
  );

create policy "Admins have full access to rooms"
  on rooms
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'::user_role
    )
  );

-- Grant admin role necessary permissions
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant all on all functions in schema public to authenticated;