/*
  # Create images table for gallery metadata

  1. New Tables
    - `images`
      - `id` (uuid, primary key) - Unique identifier
      - `bucket` (text) - Storage bucket name (default: 'gallery')
      - `path` (text, unique) - File path in bucket
      - `title` (text, nullable) - Image title/caption
      - `tags` (text array) - Searchable tags
      - `width` (int, nullable) - Image width in pixels
      - `height` (int, nullable) - Image height in pixels
      - `bytes` (int, nullable) - File size in bytes
      - `created_at` (timestamptz) - Upload timestamp

  2. Indexes
    - `idx_images_created_at` - Fast sorting by date
    - `idx_images_tags` - Fast tag searches using GIN index

  3. Security
    - Enable RLS on `images` table
    - Add policy for public read access (anon users can view)
    - Storage bucket is public, no write policies needed for viewing
*/

CREATE TABLE IF NOT EXISTS public.images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL DEFAULT 'gallery',
  path text NOT NULL UNIQUE,
  title text,
  tags text[] DEFAULT '{}',
  width int,
  height int,
  bytes int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_tags ON public.images USING gin (tags);

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read images" ON public.images;

CREATE POLICY "Public can read images"
  ON public.images
  FOR SELECT
  TO public
  USING (true);
