-- Create tables for storing anonymized GPA data

-- User GPA submissions (by term)
CREATE TABLE IF NOT EXISTS user_gpas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program TEXT NOT NULL,
  term TEXT NOT NULL,
  gpa DECIMAL(3,2) NOT NULL CHECK (gpa >= 0 AND gpa <= 4.0),
  total_courses INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual course submissions
CREATE TABLE IF NOT EXISTS course_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_gpa_id UUID REFERENCES user_gpas(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  course_name TEXT,
  grade TEXT NOT NULL,
  grade_point DECIMAL(2,1) NOT NULL,
  credits DECIMAL(3,2) NOT NULL,
  term TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Faculty/program averages (computed periodically)
CREATE TABLE IF NOT EXISTS faculty_averages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program TEXT NOT NULL,
  term TEXT NOT NULL,
  avg_gpa DECIMAL(3,2) NOT NULL,
  sample_size INTEGER NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(program, term)
);

-- Course averages
CREATE TABLE IF NOT EXISTS course_averages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL,
  avg_gpa DECIMAL(3,2),
  avg_percentage INTEGER,
  sample_size INTEGER NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_code)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_gpas_program_term ON user_gpas(program, term);
CREATE INDEX IF NOT EXISTS idx_course_submissions_code ON course_submissions(course_code);
CREATE INDEX IF NOT EXISTS idx_faculty_averages_program_term ON faculty_averages(program, term);

-- Enable Row Level Security
ALTER TABLE user_gpas ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_averages ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_averages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow anonymous inserts (no auth required)
CREATE POLICY "Allow anonymous insert user_gpas"
  ON user_gpas FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert course_submissions"
  ON course_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies: Prevent individual record reads (only aggregated data)
CREATE POLICY "No individual reads user_gpas"
  ON user_gpas FOR SELECT
  TO anon
  USING (false);

CREATE POLICY "No individual reads course_submissions"
  ON course_submissions FOR SELECT
  TO anon
  USING (false);

-- RLS Policies: Allow reading aggregated averages
CREATE POLICY "Allow read faculty_averages"
  ON faculty_averages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow read course_averages"
  ON course_averages FOR SELECT
  TO anon
  USING (true);
