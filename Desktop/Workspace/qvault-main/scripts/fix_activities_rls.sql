-- Fix RLS policies for activities table to allow learners to see all activities
-- Run this in Supabase SQL editor

-- Drop old restrictive policy
drop policy if exists "activities_select_published" on public.activities;

-- Create new policy that allows all users to select activities (learners can see teacher posts)
create policy "activities_select_all" on public.activities 
  for select 
  using (true);

-- Keep the update/delete policies restricted to teachers who own the activity
-- These policies should already exist, but verify they are in place:
-- create policy "activities_update_own" on public.activities for update using (teacher_id = auth.uid());
-- create policy "activities_delete_own" on public.activities for delete using (teacher_id = auth.uid());
