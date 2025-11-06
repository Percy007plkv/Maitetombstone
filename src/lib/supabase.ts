import { createClient } from '@supabase/supabase-js';

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
