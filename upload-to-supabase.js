import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://wqyasyjvpsnwahpltlpx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeWFzeWp2cHNud2FocGx0bHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDcyNjMsImV4cCI6MjA3ODAyMzI2M30.dw1YUw9SPDAaAO1f9QNJKQ8fnWBeT5zB189ZEWbfrFQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImages() {
  const publicDir = path.join(__dirname, 'public');
  const imageFiles = fs.readdirSync(publicDir)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
    .sort();

  console.log(`Found ${imageFiles.length} images to upload`);

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const bucketExists = buckets.some(b => b.name === 'gallery-images');

  if (!bucketExists) {
    const { data, error } = await supabase.storage.createBucket('gallery-images', {
      public: true,
      fileSizeLimit: 10485760,
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return;
    }
    console.log('Created gallery-images bucket');
  }

  const uploadedUrls = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const filePath = path.join(publicDir, filename);

    try {
      const fileBuffer = fs.readFileSync(filePath);

      const { data, error } = await supabase.storage
        .from('gallery-images')
        .upload(filename, fileBuffer, {
          contentType: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error(`Failed to upload ${filename}:`, error.message);
        failCount++;
      } else {
        const { data: urlData } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(filename);

        uploadedUrls.push(urlData.publicUrl);
        successCount++;

        if (successCount % 10 === 0) {
          console.log(`Uploaded ${successCount}/${imageFiles.length} images...`);
        }
      }
    } catch (err) {
      console.error(`Error reading ${filename}:`, err.message);
      failCount++;
    }
  }

  console.log(`\nUpload complete!`);
  console.log(`Success: ${successCount}, Failed: ${failCount}`);

  const imageDataContent = `export const images = [\n  '${uploadedUrls.join("',\\n  '")}'\n];\n`;
  fs.writeFileSync(path.join(__dirname, 'src', 'imageData.ts'), imageDataContent);
  console.log('Updated imageData.ts with Supabase URLs');
}

uploadImages().catch(console.error);
