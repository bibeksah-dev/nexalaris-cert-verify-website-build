-- Add description column to programs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'programs' AND column_name = 'description'
    ) THEN
        ALTER TABLE programs ADD COLUMN description TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Update the default constraint to allow proper descriptions
ALTER TABLE programs ALTER COLUMN description DROP DEFAULT;
