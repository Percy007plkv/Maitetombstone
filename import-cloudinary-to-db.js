import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MANIFEST_PATH = resolve('./public/cloudinary_manifest.json');

async function importCloudinaryImages() {
  console.log('📦 Reading Cloudinary manifest...');

  let manifest;
  try {
    const manifestData = readFileSync(MANIFEST_PATH, 'utf-8');
    manifest = JSON.parse(manifestData);
  } catch (error) {
    console.error('❌ Failed to read manifest file:', error.message);
    console.error('   Make sure to run: node cloudinary_upload_once.cjs first');
    process.exit(1);
  }

  if (!Array.isArray(manifest) || manifest.length === 0) {
    console.log('⚠️  No images found in manifest');
    process.exit(0);
  }

  console.log(`📸 Found ${manifest.length} images in manifest`);
  console.log('🔄 Importing to Supabase database...\n');

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const img of manifest) {
    try {
      const { data: existing } = await supabase
        .from('images')
        .select('id')
        .eq('public_id', img.public_id)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Skipped (exists): ${img.public_id}`);
        skipped++;
        continue;
      }

      const { error } = await supabase.from('images').insert({
        public_id: img.public_id,
        format: img.format,
        width: img.width,
        height: img.height,
        bytes: img.bytes,
        cloudinary_urls: img.urls,
        title: null,
        tags: [],
        created_at: img.created_at || new Date().toISOString(),
      });

      if (error) {
        console.error(`❌ Failed: ${img.public_id}`, error.message);
        failed++;
      } else {
        console.log(`✅ Imported: ${img.public_id}`);
        imported++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${img.public_id}:`, error.message);
      failed++;
    }
  }

  console.log('\n🎉 Import complete!');
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
}

importCloudinaryImages();
