-- Add SRS fields to words table
ALTER TABLE words 
ADD COLUMN srs_level INTEGER DEFAULT 0,
ADD COLUMN next_review TIMESTAMP WITH TIME ZONE,
ADD COLUMN review_interval INTEGER DEFAULT 0;