-- Create table for anonymous GPA statistics
create table if not exists public.gpa_stats (
  id uuid primary key default gen_random_uuid(),
  gpa numeric(3, 2) not null check (gpa >= 0 and gpa <= 4.0),
  percentage numeric(5, 2) not null check (percentage >= 0 and percentage <= 100),
  program text not null,
  year text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.gpa_stats enable row level security;

-- Allow anyone to read anonymized stats (no auth required)
create policy "gpa_stats_select_all"
  on public.gpa_stats for select
  to anon, authenticated
  using (true);

-- Allow anyone to insert their GPA (no auth required for privacy)
create policy "gpa_stats_insert_all"
  on public.gpa_stats for insert
  to anon, authenticated
  with check (true);

-- Create index for faster queries by program and year
create index if not exists idx_gpa_stats_program_year 
  on public.gpa_stats (program, year);
