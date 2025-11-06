/**
 * SUPABASE IMAGE UPLOADER (Bolt-ready, one file)
 * ---------------------------------------------
 * Usage:
 * 1. Put this file at project root: supabase_upload_once.js
 * 2. Create a folder: ./import (drop images inside)
 * 3. Paste your keys below from Supabase (bufdshaubdrbdokwcihz project)
 * 4. Run in Bolt terminal: node supabase_upload_once.js
 */

const SUPABASE_URL = "https://bufdshaubdrbdokwcihz.supabase.co"; // your project URL
const SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmRzaGF1YmRyYmRva3djaWh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ1NjQ4MSwiZXhwIjoyMDc4MDMyNDgxfQ.7k2wRgSk1HRNiV_6qMK1g0ODCXbKzmST6-Z9nc9MGIw;         // your Service Role key (secret)
const BUCKET = Maite;                                         // Supabase bucket name

//---------------------------------------------------------------//
const fs = require("fs");
const path = require("path");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const STORAGE_UPLOAD_ENDPOINT = `${SUPABASE_URL}/storage/v1/object`;
const DB_ENDPOINT = `${SUPABASE_URL}/rest/v1/images`;
const PROJECT_HOST = new URL(SUPABASE_URL).host;

const IMPORT_DIR = path.join(__dirname, "import");
const VALID_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

function walk(dir) {
  const files = [];
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) files.push(...walk(fullPath));
    else files.push(fullPath);
  });
  return files;
}

function isImage(file) {
  return VALID_EXTS.includes(path.extname(file).toLowerCase());
}

function objectUrl(bucket, key) {
  return `https://${PROJECT_HOST}/storage/v1/object/public/${bucket}/${encodeURIComponent(key)}`;
}
function renderUrl(bucket, key, w = 960, q = 75, format = "webp") {
  return `https://${PROJECT_HOST}/storage/v1/render/image/public/${bucket}/${encodeURIComponent(
    key
  )}?width=${w}&quality=${q}&format=${format}`;
}

async function uploadBinary(bucket, key, buff, contentType) {
  const url = `${STORAGE_UPLOAD_ENDPOINT}/${encodeURIComponent(bucket)}/${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "x-upsert": "true",
      "Content-Type": contentType,
      "Cache-Control": "31536000",
    },
    body: buff,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Storage upload failed (${res.status}): ${t}`);
  }
}

async function upsertRow(row) {
  const res = await fetch(DB_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`DB upsert failed (${res.status}): ${t}`);
  }
}

function contentTypeFor(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".avif") return "image/avif";
  return "application/octet-stream";
}

(async () => {
  if (!fs.existsSync(IMPORT_DIR)) {
    console.log(`⚠️ Folder not found: ${IMPORT_DIR}`);
    console.log("➡️ Create it and drop your images inside, then run again.");
    process.exit(0);
  }

  const files = walk(IMPORT_DIR).filter(isImage);
  if (files.length === 0) {
    console.log("⚠️ No images found in ./import (jpg, jpeg, png, webp, gif, avif).");
    process.exit(0);
  }

  console.log(`📦 Found ${files.length} image(s). Uploading to '${BUCKET}'...`);
  let ok = 0, fail = 0;

  for (const abs of files) {
    const rel = path.relative(IMPORT_DIR, abs).replace(/\\/g, "/");
    const key = rel;
    const buff = fs.readFileSync(abs);
    const ct = contentTypeFor(abs);

    try {
      await uploadBinary(BUCKET, key, buff, ct);
      const row = {
        bucket: BUCKET,
        path: key,
        title: path.basename(abs),
        width: null,
        height: null,
        bytes: buff.length,
      };
      await upsertRow(row);

      ok++;
      console.log(`✅ ${rel}`);
      console.log(`   • Original: ${objectUrl(BUCKET, key)}`);
      console.log(`   • Thumb:    ${renderUrl(BUCKET, key, 480, 75, "webp")}`);
    } catch (err) {
      fail++;
      console.error(`❌ ${rel}: ${err.message}`);
    }
  }

  console.log(`\n🎉 Done. Success: ${ok}, Failed: ${fail}`);
})();
