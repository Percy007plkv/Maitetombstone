# Image Setup Instructions

Your gallery is ready, but the images need to be uploaded to Supabase Storage to work properly.

## Option 1: Upload via Supabase Dashboard (Recommended)

1. Go to https://wqyasyjvpsnwahpltlpx.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
   - Name: `gallery-images`
   - Public bucket: **Yes** (toggle on)
   - File size limit: 10MB
4. Click **Create bucket**
5. Click on the `gallery-images` bucket
6. Click **Upload files**
7. Select all your photos from the `public` folder
8. Wait for upload to complete
9. Run: `npm run generate-urls`

## Option 2: Automated Upload Script

If you have Node.js access to the original images:

```bash
npm run upload-images
```

This will:
- Create the Supabase Storage bucket
- Upload all images from your public folder
- Automatically update `imageData.ts` with the correct URLs
- Make your gallery work immediately

## What happens next?

Once images are uploaded to Supabase Storage, your gallery will:
- Load instantly
- Work reliably across all browsers
- Have proper CDN caching
- Support progressive image loading
- Enable batch downloads

The gallery is already built with all features ready to go!
