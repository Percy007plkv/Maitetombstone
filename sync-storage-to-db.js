import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
const bucketName = process.env.SUPABASE_BUCKET || 'Maite';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncStorageToDb() {
  console.log(`📥 Syncing images from "${bucketName}" bucket to database...`);

  const { data: files, error } = await supabase.storage
    .from(bucketName)
    .list('', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (error) {
    console.error('❌ Error listing files:', error);
    process.exit(1);
  }

  if (!files || files.length === 0) {
    console.log('⚠️  No files found in bucket');
    return;
  }

  console.log(`Found ${files.length} files in storage`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    try {
      const { error: dbError } = await supabase
        .from('images')
        .upsert({
          bucket: bucketName,
          path: file.name,
          title: file.name.replace(/\.(jpg|jpeg|png)$/i, '').replace(/-/g, ' '),
          tags: ['maite-maria-raphasha', 'unveiling-ceremony'],
          bytes: file.metadata?.size || 0
        }, {
          onConflict: 'path'
        });

      if (dbError) {
        console.error(`Failed to save ${file.name}:`, dbError.message);
        failCount++;
      } else {
        successCount++;
        if (successCount % 50 === 0) {
          console.log(`Synced ${successCount}/${files.length} images...`);
        }
      }
    } catch (err) {
      console.error(`Error processing ${file.name}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n✅ Sync complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
}

syncStorageToDb().catch(console.error);
