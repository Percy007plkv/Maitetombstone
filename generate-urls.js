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
  console.log('Fetching images from database...');

  const { data, error } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure you have:');
    console.log('1. Created the "gallery" bucket in Supabase (public)');
    console.log('2. Run: npm run upload-images');
    return;
  }

  if (!data || data.length === 0) {
    console.log('No images found in the database.');
    console.log('Run: npm run upload-images first');
    return;
  }

  console.log(`Found ${data.length} images`);

  const imageDataContent = `export const images = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, 'src', 'imageData.ts'), imageDataContent);

  console.log('✓ Updated imageData.ts successfully!');
  console.log('Your gallery is now ready to use.');
}

generateUrls().catch(console.error);
