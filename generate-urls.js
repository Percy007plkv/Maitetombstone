import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://wqyasyjvpsnwahpltlpx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeWFzeWp2cHNud2FocGx0bHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDcyNjMsImV4cCI6MjA3ODAyMzI2M30.dw1YUw9SPDAaAO1f9QNJKQ8fnWBeT5zB189ZEWbfrFQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateUrls() {
  console.log('Fetching images from Supabase Storage...');

  const { data, error } = await supabase.storage
    .from('gallery-images')
    .list('', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure you have:');
    console.log('1. Created the "gallery-images" bucket in Supabase');
    console.log('2. Set it as a PUBLIC bucket');
    console.log('3. Uploaded your images to it');
    return;
  }

  if (!data || data.length === 0) {
    console.log('No images found in the gallery-images bucket.');
    console.log('Please upload your images to Supabase Storage first.');
    return;
  }

  const urls = data
    .filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.png'))
    .map(file => {
      const { data: urlData } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(file.name);
      return urlData.publicUrl;
    });

  console.log(`Found ${urls.length} images`);

  const imageDataContent = `export const images = [\n  '${urls.join("',\\n  '")}'\n];\n`;
  fs.writeFileSync(path.join(__dirname, 'src', 'imageData.ts'), imageDataContent);

  console.log('✓ Updated imageData.ts successfully!');
  console.log('Your gallery is now ready to use.');
}

generateUrls().catch(console.error);
