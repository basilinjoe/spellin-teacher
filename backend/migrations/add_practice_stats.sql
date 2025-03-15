-- Add practice statistics columns to words table
ALTER TABLE words 
ADD COLUMN practice_count INTEGER DEFAULT 0,
ADD COLUMN correct_count INTEGER DEFAULT 0,
ADD COLUMN incorrect_count INTEGER DEFAULT 0,
ADD COLUMN last_practiced TIMESTAMP WITH TIME ZONE,
ADD COLUMN familiar BOOLEAN DEFAULT FALSE;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_words_familiar ON words(familiar);
CREATE INDEX IF NOT EXISTS idx_words_practice_count ON words(practice_count);
CREATE INDEX IF NOT EXISTS idx_words_last_practiced ON words(last_practiced);