import { createClient } from '@supabase/supabase-js';
import type { ImageData, CloudinaryUrls } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PROJECT_REF = 'bufdshaubdrbdokwcihz';
const RENDER_BASE = `https://${PROJECT_REF}.supabase.co/storage/v1/render/image/public`;
const ORIGIN_BASE = `https://${PROJECT_REF}.supabase.co/storage/v1/object/public`;

export function getImageUrl(bucket: string, path: string, options?: {
  width?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
}): string {
  const { width, quality = 75, format = 'webp' } = options || {};

  if (format === 'origin' || !width) {
    return `${ORIGIN_BASE}/${bucket}/${path}`;
  }

  const params = new URLSearchParams();
  if (width) params.set('width', width.toString());
  params.set('quality', quality.toString());
  if (format !== 'origin') params.set('format', format);

  return `${RENDER_BASE}/${bucket}/${path}?${params.toString()}`;
}

export function getResponsiveUrls(image: ImageData): {
  thumb: string;
  medium: string;
  large: string;
  original: string;
} {
  if (image.cloudinary_urls) {
    return {
      thumb: image.cloudinary_urls.w480,
      medium: image.cloudinary_urls.w960,
      large: image.cloudinary_urls.w1280,
      original: image.cloudinary_urls.original,
    };
  }

  if (image.bucket && image.path) {
    return {
      thumb: getImageUrl(image.bucket, image.path, { width: 480, quality: 75 }),
      medium: getImageUrl(image.bucket, image.path, { width: 960, quality: 75 }),
      large: getImageUrl(image.bucket, image.path, { width: 1280, quality: 75 }),
      original: getImageUrl(image.bucket, image.path, { format: 'origin' }),
    };
  }

  throw new Error('Invalid image data: missing both cloudinary_urls and bucket/path');
}
