/**
 * CLOUDINARY UPLOADER (Bolt-ready, one file)
 * ------------------------------------------
 * Usage:
 * 1) Create folder: ./import (drop images inside, subfolders OK)
 * 2) Add env vars in Bolt: CLOUDINARY_* + optional CLOUDINARY_FOLDER (default "Maite")
 * 3) npm i cloudinary fast-glob
 * 4) node cloudinary_upload_once.js
 *
 * It will:
 *  - Upload images from ./import to Cloudinary folder
 *  - Write ./public/cloudinary_manifest.json with public_id, width, height, urls
 *  - Print sample transformed URLs (f_auto,q_auto,w=...)
 */

const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");
const cloudinary = require("cloudinary").v2;

const CLOUD_NAME = process.env. decsamozj;
const API_KEY    = 497716188274956;
const API_SECRET = ImQGlf2O9Yb9aQZCCBakuIDQQX4;
const FOLDER     = cloudinary://< 497716188274956>:< ImQGlf2O9Yb9aQZCCBakuIDQQX4>@decsamozj;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error("❌ Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

const IMPORT_DIR = path.resolve("./import");
const MANIFEST_OUT = path.resolve("./public/cloudinary_manifest.json");
const VALID = ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.webp", "**/*.gif", "**/*.avif", "**/*.heic"];

(async () => {
  if (!fs.existsSync(IMPORT_DIR)) {
    console.log(`⚠️  Folder not found: ${IMPORT_DIR}`);
    console.log("➡️  Create it and drop your images inside, then run again.");
    process.exit(0);
  }

  const files = await fg(VALID, { cwd: IMPORT_DIR, absolute: true, dot: false });
  if (files.length === 0) {
    console.log("⚠️  No images found in ./import (jpg, jpeg, png, webp, gif, avif, heic).");
    process.exit(0);
  }

  console.log(`📦 Found ${files.length} image(s). Uploading to Cloudinary folder '${FOLDER}'...`);

  const manifest = [];
  let ok = 0, fail = 0;

  for (const abs of files) {
    const rel = path.relative(IMPORT_DIR, abs).replace(/\\/g, "/");
    const publicId = `${FOLDER}/${rel.replace(/\.[^.]+$/, "")}`; // keep subfolders; drop extension

    try {
      const res = await cloudinary.uploader.upload(abs, {
        public_id: publicId,
        folder: FOLDER, // ensures folder exists / created
        overwrite: true,
        resource_type: "image",
        use_filename: false,
        unique_filename: false,
      });

      // Build fast delivery URLs (auto format/quality, sized variants)
      const urlBase = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
      const original = `${urlBase}/${res.public_id}.${res.format}`;
      const thumb480 = `${urlBase}/f_auto,q_auto,w_480/${res.public_id}`;
      const mid960   = `${urlBase}/f_auto,q_auto,w_960/${res.public_id}`;
      const lg1280   = `${urlBase}/f_auto,q_auto,w_1280/${res.public_id}`;

      manifest.push({
        id: res.asset_id,
        public_id: res.public_id,
        format: res.format,
        width: res.width,
        height: res.height,
        bytes: res.bytes,
        created_at: res.created_at,
        urls: {
          original,
          w480: thumb480,
          w960: mid960,
          w1280: lg1280,
        }
      });

      ok++;
      console.log(`✅ ${rel}`);
      console.log(`   • ${thumb480}`);
    } catch (err) {
      fail++;
      console.error(`❌ ${rel}: ${err.message}`);
    }
  }

  // Ensure public dir exists
  const pubDir = path.resolve("./public");
  if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir);

  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2));
  console.log(`\n📝 Manifest written: ${MANIFEST_OUT}`);
  console.log(`🎉 Done. Success: ${ok}, Failed: ${fail}`);
})();
