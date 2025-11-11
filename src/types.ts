export interface CloudinaryUrls {
  original: string;
  w480: string;
  w960: string;
  w1280: string;
}

export interface ImageData {
  id: string;
  bucket: string | null;
  path: string | null;
  public_id: string | null;
  format: string | null;
  cloudinary_urls: CloudinaryUrls | null;
  title: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  bytes: number | null;
  created_at: string;
  event_id: string;
  display_order: number | null;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  event_date: string;
  hero_image_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
