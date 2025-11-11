/*
  # Create Events Table for Multi-Event Gallery System

  1. New Tables
    - `events`
      - `id` (uuid, primary key) - Unique identifier for each event
      - `slug` (text, unique) - URL-friendly identifier (e.g., 'maite', 'patrick')
      - `title` (text) - Full event title
      - `subtitle` (text) - Event subtitle/description
      - `event_date` (date) - Date of the event
      - `hero_image_id` (uuid) - Reference to the hero image
      - `is_active` (boolean) - Whether the event gallery is publicly visible
      - `created_at` (timestamptz) - When the event was created
      - `updated_at` (timestamptz) - When the event was last updated

  2. Security
    - Enable RLS on `events` table
    - Add policy for public read access to active events
    - Add policy for authenticated users to manage events

  3. Notes
    - The slug will be used in URLs: yourdomain.com/{slug}
    - Only active events will be visible to the public
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  event_date date NOT NULL,
  hero_image_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active events"
  ON events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage events"
  ON events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);