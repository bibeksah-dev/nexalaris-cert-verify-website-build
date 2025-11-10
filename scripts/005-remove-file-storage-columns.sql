-- Remove pdf_url and png_url columns from certificates table
-- This ensures the database only stores metadata, not file paths

DO $$ 
BEGIN
  -- Drop pdf_url column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificates' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE certificates DROP COLUMN pdf_url;
  END IF;

  -- Drop png_url column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certificates' AND column_name = 'png_url'
  ) THEN
    ALTER TABLE certificates DROP COLUMN png_url;
  END IF;
END $$;
