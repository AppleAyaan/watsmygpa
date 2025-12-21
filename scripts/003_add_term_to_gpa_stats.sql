-- Add term column to gpa_stats table for term-based filtering

ALTER TABLE gpa_stats
ADD COLUMN IF NOT EXISTS term TEXT DEFAULT 'Overall';

-- Create index for faster term-based queries
CREATE INDEX IF NOT EXISTS idx_gpa_stats_term ON gpa_stats(term);
CREATE INDEX IF NOT EXISTS idx_gpa_stats_program_year_term ON gpa_stats(program, year, term);
