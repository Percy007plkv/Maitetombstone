/*
  # Add Event Relationship to Images Table

  1. Changes
    - Add `event_id` column to `images` table
    - Add foreign key constraint to `events` table
    - Create index for faster event-based queries
    - Create a default event for existing images (Maite's ceremony)

  2. Notes
    - Existing images will be assigned to the Maite event
    - Each image can belong to only one event
    - Deleting an event will cascade delete its images (be careful!)
*/

-- Add event_id column to images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'images' AND column_name = 'event_id'
  ) THEN
    ALTER TABLE images ADD COLUMN event_id uuid;
  END IF;
END $$;

-- Create the default event for Maite
INSERT INTO events (slug, title, subtitle, event_date, is_active)
VALUES (
  'maite',
  'Maite Maria Raphasha',
  'Unveiling Tombstone Ceremony',
  '2025-09-27',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Assign all existing images to Maite's event
UPDATE images
SET event_id = (SELECT id FROM events WHERE slug = 'maite')
WHERE event_id IS NULL;

-- Make event_id required for new images
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'images' AND column_name = 'event_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE images ALTER COLUMN event_id SET NOT NULL;
  END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'images_event_id_fkey'
  ) THEN
    ALTER TABLE images
    ADD CONSTRAINT images_event_id_fkey
    FOREIGN KEY (event_id)
    REFERENCES events(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_images_event_id ON images(event_id);