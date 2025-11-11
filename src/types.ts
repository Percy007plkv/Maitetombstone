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
}
