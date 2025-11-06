# Gallery Setup - Supabase Storage with CDN Transforms

Your gallery uses Supabase Storage with on-the-fly image transforms for optimal performance.

## Architecture

- **Database**: `images` table stores metadata (path, title, tags, size)
- **Storage**: `gallery` bucket (public) stores actual image files
- **CDN**: Supabase's render API creates optimized WebP versions on-demand
- **Performance**: Thumbnails ~20-70 KB, Medium ~60-150 KB, Full ~150-300 KB

## Quick Setup

### 1. Upload Images

```bash
npm run upload-images
```

This will:
- Create the `gallery` bucket (public)
- Upload all images from `public/` to `gallery/maite-maria/`
- Save metadata to the `images` database table

### 2. Generate Image Data

```bash
npm run generate-urls
```

This fetches metadata and creates `src/imageData.ts`.

### 3. Done!

Your gallery is production-ready with CDN-optimized WebP images.

## How It Works

The gallery uses Supabase's render API:
- **Thumbnails** (480px): Grid view
- **Medium** (960px): Default desktop view
- **Large** (1280px): High-res displays
- **Original**: Downloads only

All use WebP format with quality=75 for optimal performance.

## Manual Upload (Alternative)

1. Visit https://wqyasyjvpsnwahpltlpx.supabase.co
2. Storage → Create bucket → Name: `gallery` → Public: ON
3. Upload to `maite-maria/` folder
4. Run: `npm run generate-urls`
