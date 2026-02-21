-- Fix upload table schemas to match application code
-- This script ensures the database columns match what the app is trying to insert

-- ============================================
-- FIX PAST PAPERS TABLE
-- ============================================
-- Ensure paper_type exists and paper_number doesn't exist

alter table if exists public.past_papers
drop column if exists paper_number;

-- Add paper_type if it doesn't exist (with default for existing rows)
alter table if exists public.past_papers
add column if not exists paper_type text check (paper_type in ('UCE', 'UACE', 'Mock', 'Terminal')) default 'Mock';

-- If paper_type column existed but was null, set a default
update public.past_papers set paper_type = 'Mock' where paper_type is null;

-- Make it NOT NULL
alter table if exists public.past_papers
alter column paper_type set not null;

-- ============================================
-- FIX RESOURCES TABLE
-- ============================================
-- Ensure teacher_id exists and uploaded_by doesn't exist

alter table if exists public.resources
drop column if exists uploaded_by;

-- Add teacher_id if it doesn't exist
alter table if exists public.resources
add column if not exists teacher_id uuid references public.profiles(id) on delete set null;

-- ============================================
-- VERIFY COLUMNS (informational queries)
-- ============================================
-- Run these to verify the schema is correct:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'past_papers' AND table_schema = 'public';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'resources' AND table_schema = 'public';
