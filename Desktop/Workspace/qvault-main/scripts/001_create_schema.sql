-- Q'Vault Database Schema
-- Aligned with Uganda's New Lower Secondary Curriculum (NLSC)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  school text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- ============================================
-- SUBJECTS TABLE
-- ============================================
create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  category text not null check (category in ('sciences', 'humanities', 'languages', 'technology', 'arts')),
  description text,
  icon text,
  created_at timestamp with time zone default now()
);

alter table public.subjects enable row level security;
create policy "subjects_select_all" on public.subjects for select using (true);
create policy "subjects_insert_admin" on public.subjects for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

-- ============================================
-- TOPICS TABLE
-- ============================================
create table if not exists public.topics (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid references public.subjects(id) on delete cascade,
  name text not null,
  description text,
  competency_area text,
  created_at timestamp with time zone default now()
);

alter table public.topics enable row level security;
create policy "topics_select_all" on public.topics for select using (true);
create policy "topics_insert_admin" on public.topics for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

-- ============================================
-- ACTIVITIES OF INTEGRATION TABLE
-- ============================================
create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid references public.subjects(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  scenario text not null,
  learner_task text not null,
  knowledge_criteria text,
  skills_criteria text,
  attitudes_criteria text,
  expected_outcome text,
  file_url text,
  rubric_url text,
  is_published boolean default false,
  view_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.activities enable row level security;
create policy "activities_select_published" on public.activities for select using (is_published = true);
create policy "activities_select_own" on public.activities for select using (teacher_id = auth.uid());
create policy "activities_insert_teacher" on public.activities for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "activities_update_own" on public.activities for update using (teacher_id = auth.uid());
create policy "activities_delete_own" on public.activities for delete using (teacher_id = auth.uid());

-- ============================================
-- PAST PAPERS TABLE
-- ============================================
create table if not exists public.past_papers (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid references public.subjects(id) on delete cascade,
  year integer not null,
  paper_type text check (paper_type in ('UCE', 'UACE', 'Mock', 'Terminal')),
  title text not null,
  file_url text not null,
  marking_guide_url text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  download_count integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.past_papers enable row level security;
create policy "past_papers_select_all" on public.past_papers for select using (true);
create policy "past_papers_insert_teacher" on public.past_papers for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

-- ============================================
-- PROJECT WORK TABLE
-- ============================================
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid references public.subjects(id) on delete cascade,
  title text not null,
  description text not null,
  guidelines text,
  file_url text,
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.projects enable row level security;
create policy "projects_select_all" on public.projects for select using (true);
create policy "projects_insert_teacher" on public.projects for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

-- ============================================
-- RESOURCES (Audio/Video/Documents)
-- ============================================
create table if not exists public.resources (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid references public.subjects(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  title text not null,
  description text,
  resource_type text not null check (resource_type in ('video', 'audio', 'document', 'link')),
  file_url text not null,
  thumbnail_url text,
  duration_seconds integer,
  teacher_id uuid references public.profiles(id) on delete set null,
  view_count integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.resources enable row level security;
create policy "resources_select_all" on public.resources for select using (true);
create policy "resources_insert_teacher" on public.resources for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

-- ============================================
-- BOOKMARKS TABLE
-- ============================================
create table if not exists public.bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, activity_id)
);

alter table public.bookmarks enable row level security;
create policy "bookmarks_select_own" on public.bookmarks for select using (user_id = auth.uid());
create policy "bookmarks_insert_own" on public.bookmarks for insert with check (user_id = auth.uid());
create policy "bookmarks_delete_own" on public.bookmarks for delete using (user_id = auth.uid());

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.chat_messages enable row level security;
create policy "chat_select_own" on public.chat_messages for select using (
  sender_id = auth.uid() or receiver_id = auth.uid()
);
create policy "chat_insert_own" on public.chat_messages for insert with check (sender_id = auth.uid());

-- ============================================
-- DOWNLOAD TRACKING TABLE
-- ============================================
create table if not exists public.downloads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  resource_type text not null,
  resource_id uuid not null,
  created_at timestamp with time zone default now()
);

alter table public.downloads enable row level security;
create policy "downloads_select_own" on public.downloads for select using (user_id = auth.uid());
create policy "downloads_insert_own" on public.downloads for insert with check (user_id = auth.uid());

-- ============================================
-- MOTIVATIONAL QUOTES TABLE
-- ============================================
create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  author text not null,
  category text default 'education'
);

alter table public.quotes enable row level security;
create policy "quotes_select_all" on public.quotes for select using (true);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- SEED DATA: Subjects
-- ============================================
insert into public.subjects (name, category, description, icon) values
  ('Physics', 'sciences', 'Study of matter, energy, and their interactions', 'atom'),
  ('Chemistry', 'sciences', 'Study of substances and chemical reactions', 'flask'),
  ('Mathematics', 'sciences', 'Study of numbers, quantities, and shapes', 'calculator'),
  ('Biology', 'sciences', 'Study of living organisms', 'leaf'),
  ('Geography', 'humanities', 'Study of places and relationships between people and environments', 'globe'),
  ('History', 'humanities', 'Study of past events and human affairs', 'book'),
  ('Entrepreneurship', 'humanities', 'Business skills and enterprise development', 'briefcase'),
  ('English', 'languages', 'English language and communication skills', 'book-open'),
  ('Literature', 'languages', 'Study of written works and literary analysis', 'bookmark'),
  ('Kiswahili', 'languages', 'Kiswahili language and East African culture', 'message-circle'),
  ('ICT', 'technology', 'Information and Communication Technology', 'monitor'),
  ('Agriculture', 'sciences', 'Study of farming and food production', 'sprout')
on conflict (name) do nothing;

-- ============================================
-- SEED DATA: Motivational Quotes
-- ============================================
insert into public.quotes (text, author, category) values
  ('Education is the most powerful weapon which you can use to change the world.', 'Nelson Mandela', 'education'),
  ('The beautiful thing about learning is that nobody can take it away from you.', 'B.B. King', 'education'),
  ('Education is not preparation for life; education is life itself.', 'John Dewey', 'education'),
  ('The roots of education are bitter, but the fruit is sweet.', 'Aristotle', 'education'),
  ('An investment in knowledge pays the best interest.', 'Benjamin Franklin', 'education'),
  ('The only person who is educated is the one who has learned how to learn and change.', 'Carl Rogers', 'education'),
  ('Education is the passport to the future, for tomorrow belongs to those who prepare for it today.', 'Malcolm X', 'education'),
  ('If you think education is expensive, try ignorance.', 'Derek Bok', 'education')
on conflict do nothing;
