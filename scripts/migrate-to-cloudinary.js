/**
 * migrate-to-cloudinary.js
 * 
 * Scans all image fields in MongoDB, finds any base64 data URIs,
 * uploads them to Cloudinary, and replaces them with CDN URLs.
 *
 * Run ONCE: node scripts/migrate-to-cloudinary.js
 *
 * Requires CLOUDINARY_* and MONGODB_URI in .env.local
 */
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import dns from 'node:dns/promises';
if (typeof window === 'undefined') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}
// Fallback to local if env is missing
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartx_web';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ── Inline schemas ──────────────────────────────────────────────────────
const HeroSchema     = new mongoose.Schema({}, { strict: false, timestamps: true });
const AboutSchema    = new mongoose.Schema({}, { strict: false, timestamps: true });
const ProductSchema  = new mongoose.Schema({}, { strict: false, timestamps: true });
const TeamSchema     = new mongoose.Schema({}, { strict: false, timestamps: true });
const SettingsSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const Hero     = mongoose.models.Hero         || mongoose.model('Hero',         HeroSchema);
const About    = mongoose.models.About        || mongoose.model('About',        AboutSchema);
const Product  = mongoose.models.Product      || mongoose.model('Product',      ProductSchema);
const Team     = mongoose.models.Team         || mongoose.model('Team',         TeamSchema);
const Settings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SettingsSchema);

// ── Helpers ──────────────────────────────────────────────────────────────

function isBase64(str) {
  return typeof str === 'string' && str.startsWith('data:image/');
}

async function uploadBase64(dataUri, folder, context) {
  try {
    const isSvg = dataUri.startsWith('data:image/svg');
    const opts = {
      folder,
      unique_filename: true,
      overwrite: false,
      resource_type: 'image',
      tags: ['smartx', 'migrated', context],
    };
    if (isSvg) {
      opts.format = 'svg';
    } else {
      opts.transformation = [
        { width: 1600, height: 1600, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' },
      ];
    }
    const result = await cloudinary.uploader.upload(dataUri, opts);
    return result.secure_url;
  } catch (err) {
    console.error(`  ✗ Upload failed: ${err.message}`);
    return null;
  }
}

let uploaded = 0;
let skipped  = 0;
let failed   = 0;

async function migrateField(doc, field, folder, context, Model) {
  const val = doc[field];
  if (!isBase64(val)) { skipped++; return; }

  process.stdout.write(`  ↑ Uploading ${field} for ${doc._id}… `);
  const url = await uploadBase64(val, folder, context);
  if (!url) { failed++; console.log('FAILED'); return; }

  // FIX: Perform the dynamic update directly via Mongoose model query
  await Model.findByIdAndUpdate(doc._id, { [field]: url });
  uploaded++;
  console.log(`✓ ${url.slice(0, 60)}…`);
}

// ── Migration tasks ──────────────────────────────────────────────────────

async function migrateHero() {
  console.log('\n🦸  Hero');
  // FIX: Removed .lean() so we are dealing with standard query iteration safely
  const docs = await Hero.find();
  for (const doc of docs) {
    await migrateField(doc, 'bgImage',     'smartx/hero',     'hero_bg', Hero);
    await migrateField(doc, 'heroImage',   'smartx/hero',     'hero',    Hero);
    await migrateField(doc, 'ceBadgeIcon', 'smartx/branding', 'ce_icon', Hero);
  }
}

async function migrateAbout() {
  console.log('\nℹ️   About');
  const docs = await About.find();
  for (const doc of docs) {
    await migrateField(doc, 'image', 'smartx/about', 'about', About);
  }
}

async function migrateProducts() {
  console.log('\n📦  Products');
  const docs = await Product.find();
  for (const doc of docs) {
    await migrateField(doc, 'image', 'smartx/products', 'product', Product);
    
    // gallery array processing
    if (Array.isArray(doc.gallery)) {
      const newGallery = [];
      let changed = false;
      for (const img of doc.gallery) {
        if (isBase64(img)) {
          const url = await uploadBase64(img, 'smartx/products', 'product');
          newGallery.push(url || img);
          if (url) { uploaded++; changed = true; }
          else failed++;
        } else {
          newGallery.push(img);
          skipped++;
        }
      }
      if (changed) {
        await Product.findByIdAndUpdate(doc._id, { gallery: newGallery });
      }
    }
  }
}

async function migrateTeam() {
  console.log('\n👥  Team');
  const docs = await Team.find();
  for (const doc of docs) {
    await migrateField(doc, 'image', 'smartx/team', 'team', Team);
  }
}

async function migrateSettings() {
  console.log('\n⚙️   Settings');
  const docs = await Settings.find();
  for (const doc of docs) {
    await migrateField(doc, 'logoImage', 'smartx/branding', 'logo', Settings);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.\n');

  console.log('☁️  Cloudinary config:');
  console.log(`   Cloud name: ${process.env.CLOUDINARY_CLOUD_NAME || '⚠️  NOT SET'}`);
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('\n❌ CLOUDINARY_CLOUD_NAME is not set in .env.local. Aborting.');
    await mongoose.disconnect();
    process.exit(1);
  }

  await migrateHero();
  await migrateAbout();
  await migrateProducts();
  await migrateTeam();
  await migrateSettings();

  console.log('\n─────────────────────────────');
  console.log(`✅ Done!`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Skipped (already URL or empty): ${skipped}`);
  console.log(`   Failed:   ${failed}`);
  if (failed > 0) console.log('   ⚠️  Some uploads failed — check logs above and re-run if needed.');
  console.log('─────────────────────────────\n');

  // FIX: Graceful disconnect
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('❌ Migration error:', err);
  try {
    await mongoose.disconnect();
  } catch (e) { /* ignore */ }
  process.exit(1);
});
