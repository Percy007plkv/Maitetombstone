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
    .filter(file => (file.endsWith('.jpg') || file.endsWith('.png')) && file !== 'LOGO PLKV.png')
    .sort();

  console.log(`Found ${imageFiles.length} images to upload`);

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const bucketExists = buckets.some(b => b.name === 'gallery');

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket('gallery', {
      public: true,
      fileSizeLimit: 10485760,
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return;
    }
    console.log('✓ Created gallery bucket (public)');
  } else {
    console.log('✓ Gallery bucket exists');
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const filePath = path.join(publicDir, filename);
    const storagePath = `maite-maria/${filename}`;

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const stats = fs.statSync(filePath);

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(storagePath, fileBuffer, {
          contentType: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error(`Failed to upload ${filename}:`, uploadError.message);
        failCount++;
        continue;
      }

      const { error: dbError } = await supabase
        .from('images')
        .upsert({
          bucket: 'gallery',
          path: storagePath,
          title: filename.replace(/\.(jpg|png)$/i, '').replace(/-/g, ' '),
          tags: ['maite-maria-raphasha', 'unveiling-ceremony'],
          bytes: stats.size
        }, {
          onConflict: 'path'
        });

      if (dbError) {
        console.error(`Failed to save metadata for ${filename}:`, dbError.message);
      }

      successCount++;

      if (successCount % 10 === 0) {
        console.log(`Uploaded ${successCount}/${imageFiles.length} images...`);
      }
    } catch (err) {
      console.error(`Error processing ${filename}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n✓ Upload complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log('\nNext step: Run npm run generate-urls to update the gallery');
}

uploadImages().catch(console.error);
