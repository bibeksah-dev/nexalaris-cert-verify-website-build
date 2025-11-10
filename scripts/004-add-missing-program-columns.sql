-- Add missing columns to programs table if they don't exist

-- Add description column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'description'
  ) THEN
    ALTER TABLE programs ADD COLUMN description TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add image_url column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE programs ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Add updated_at column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE programs ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Add created_at column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE programs ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;
