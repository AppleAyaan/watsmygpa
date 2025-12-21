-- Create table for individual course statistics
create table if not exists public.course_stats (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  course_name text not null,
  grade text not null,
  grade_point numeric(3, 2) not null check (grade_point >= 0 and grade_point <= 4.0),
  credits numeric(3, 1) not null,
  program text not null,
  year text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.course_stats enable row level security;

-- Allow anyone to read course stats (no auth required)
create policy "course_stats_select_all"
  on public.course_stats for select
  to anon, authenticated
  using (true);

-- Allow anyone to insert their course data (no auth required for privacy)
create policy "course_stats_insert_all"
  on public.course_stats for insert
  to anon, authenticated
  with check (true);

-- Create indexes for faster queries
create index if not exists idx_course_stats_code on public.course_stats (course_code);
create index if not exists idx_course_stats_program_year on public.course_stats (program, year);
