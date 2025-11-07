/*
  # Update images table for Cloudinary support

  1. Schema Changes
    - Add `public_id` column to store Cloudinary public ID
    - Add `format` column to store image format (jpg, png, etc.)
    - Add `cloudinary_urls` JSONB column to store responsive URLs (w480, w960, w1280, original)
    - Make `bucket` nullable (NULL for Cloudinary images)
    - Make `path` nullable (NULL for Cloudinary images)
    - Update unique constraint to handle both storage types
    
  2. Notes
    - Existing Supabase Storage images will have bucket/path populated
    - New Cloudinary images will have public_id/format/cloudinary_urls populated
    - This allows migration between storage systems without data loss
*/

-- Add new columns for Cloudinary support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'images' AND column_name = 'public_id'
  ) THEN
    ALTER TABLE public.images ADD COLUMN public_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'images' AND column_name = 'format'
  ) THEN
    ALTER TABLE public.images ADD COLUMN format text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'images' AND column_name = 'cloudinary_urls'
  ) THEN
    ALTER TABLE public.images ADD COLUMN cloudinary_urls jsonb;
  END IF;
END $$;

-- Make bucket and path nullable to support Cloudinary
ALTER TABLE public.images ALTER COLUMN bucket DROP NOT NULL;
ALTER TABLE public.images ALTER COLUMN path DROP NOT NULL;

-- Drop the old unique constraint on path
ALTER TABLE public.images DROP CONSTRAINT IF EXISTS images_path_key;

-- Create a new unique index that handles both storage types
CREATE UNIQUE INDEX IF NOT EXISTS idx_images_path_unique 
  ON public.images(path) 
  WHERE path IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_images_public_id_unique 
  ON public.images(public_id) 
  WHERE public_id IS NOT NULL;