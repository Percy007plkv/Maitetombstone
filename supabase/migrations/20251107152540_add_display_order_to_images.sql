/*
  # Add display_order column to images table

  1. Changes
    - Add `display_order` column (integer) to `images` table
    - Set default value to 0
    - Create index on display_order for faster sorting
  
  2. Purpose
    - Enable chronological ordering of images based on filename sequence
    - Images will be ordered from P1167523 to P1167914
*/

-- Add display_order column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'images' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE images ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_images_display_order ON images(display_order);