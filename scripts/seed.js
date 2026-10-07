/**
 * Seed Script — run with: node scripts/seed.js
 * Creates default admin, site settings, hero, about, and DRGEM products.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import dns from 'node:dns/promises';
if (typeof window === 'undefined') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartx_web';

// ─── Inline schemas (avoid circular imports) ─────────────────────────────────

const AdminSchema = new mongoose.Schema({ username: String, password: String }, { timestamps: true });
AdminSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

const SettingsSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const HeroSchema     = new mongoose.Schema({}, { strict: false, timestamps: true });
const AboutSchema    = new mongoose.Schema({}, { strict: false, timestamps: true });
const ProductSchema  = new mongoose.Schema({ slug: { type: String, unique: true } }, { strict: false, timestamps: true });
ProductSchema.pre('save', function() {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  }
});

const Admin    = mongoose.models.Admin    || mongoose.model('Admin', AdminSchema);
const Settings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SettingsSchema);
const Hero     = mongoose.models.Hero     || mongoose.model('Hero', HeroSchema);
const About    = mongoose.models.About    || mongoose.model('About', AboutSchema);
const Product  = mongoose.models.Product  || mongoose.model('Product', ProductSchema);

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: 'DRGEM GXR-SD',
    slug: 'drgem-gxr-sd',
    category: 'X-Ray Systems',
    badge: 'Bestseller',
    tagline: 'High-frequency stationary X-ray generator with digital radiography for general radiography',
    description: `The DRGEM GXR-SD is a high-performance stationary digital radiography system designed for general radiographic examinations. It combines a powerful high-frequency generator with a flat panel detector to deliver exceptional image quality with low patient dose.\n\nThe system features automatic exposure control (AEC), real-time image processing, and seamless DICOM connectivity, making it ideal for hospitals and diagnostic centers requiring reliable, high-throughput radiography.`,
    order: 1,
    features: [
      { title: 'High-Frequency Generator', description: 'Advanced inverter technology for consistent, repeatable exposures' },
      { title: 'Flat Panel Detector (FPD)', description: 'Large amorphous silicon FPD for wide dynamic range imaging' },
      { title: 'Automatic Exposure Control', description: 'AEC system ensures optimal exposure regardless of patient anatomy' },
      { title: 'DICOM 3.0 Compliant', description: 'Full DICOM connectivity for seamless PACS integration' },
      { title: 'Low Patient Dose', description: 'Advanced filtration and high DQE detector minimize radiation exposure' },
      { title: 'CE & FDA Certified', description: 'International quality certifications for clinical confidence' },
    ],
    specifications: [
      { label: 'Generator Power',    value: '50 kW / 65 kW' },
      { label: 'kVp Range',          value: '40–150 kVp' },
      { label: 'mAs Range',          value: '0.4–600 mAs' },
      { label: 'Detector Size',      value: '43 × 43 cm (17" × 17")' },
      { label: 'Detector Type',      value: 'a-Si Flat Panel, CsI scintillator' },
      { label: 'Pixel Size',         value: '148 μm' },
      { label: 'Spatial Resolution', value: '3.4 lp/mm' },
      { label: 'DQE (at 0 lp/mm)',  value: '≥ 65%' },
      { label: 'Interface',          value: 'DICOM 3.0, HL7, PACS/RIS/HIS' },
      { label: 'Power Supply',       value: '220V ± 10%, 50/60 Hz' },
    ],
    published: true,
  },
  {
    name: 'DRGEM TOPAZ',
    slug: 'drgem-topaz',
    category: 'Mobile DR',
    badge: 'New',
    tagline: 'Wireless portable digital radiography system for bedside and ward examinations',
    description: `The DRGEM TOPAZ is a state-of-the-art mobile digital radiography solution designed for bedside examinations in ICUs, wards, emergency departments, and operating theaters. Its compact, lightweight design and wireless flat panel detector enable effortless maneuverability in constrained clinical environments.\n\nWith a lithium-ion battery providing extended operation and a high-resolution touchscreen interface, the TOPAZ delivers consistent image quality on the move — without sacrificing PACS connectivity.`,
    order: 2,
    features: [
      { title: 'Wireless Flat Panel Detector', description: 'Cordless FPD for maximum flexibility in tight spaces' },
      { title: 'Battery-Powered Operation', description: 'Li-ion battery for 200+ exposures on a single charge' },
      { title: 'Automatic Exposure Control', description: 'Built-in AEC for optimal image quality in all settings' },
      { title: 'Intuitive Touchscreen', description: '15.6" full HD touchscreen for streamlined workflow' },
      { title: 'Lightweight & Compact', description: 'Ergonomic design for easy navigation through corridors' },
      { title: 'Real-Time Image Preview', description: 'Images available within seconds for immediate clinical decisions' },
    ],
    specifications: [
      { label: 'Generator Power',  value: '32 kW' },
      { label: 'kVp Range',        value: '40–125 kVp' },
      { label: 'mAs Range',        value: '0.4–320 mAs' },
      { label: 'Detector Size',    value: '43 × 43 cm' },
      { label: 'Detector Type',    value: 'Wireless a-Si FPD, CsI' },
      { label: 'Battery Capacity', value: '200+ exposures per charge' },
      { label: 'Charging Time',    value: '< 2 hours' },
      { label: 'Display',          value: '15.6" Full HD touchscreen' },
      { label: 'Drive System',     value: 'Electric motorized drive' },
      { label: 'Weight',           value: '≈ 350 kg' },
    ],
    published: true,
  },
  {
    name: 'DRGEM DIAMOND',
    slug: 'drgem-diamond',
    category: 'X-Ray Systems',
    badge: 'Featured',
    tagline: 'Premium ceiling-mounted radiography system for advanced imaging workflows',
    description: `The DRGEM DIAMOND is a premium ceiling-mounted digital radiography system engineered for high-volume radiology departments and imaging centers. Featuring a motorized ceiling suspension with programmable positioning and a large-area flat panel detector, the DIAMOND streamlines complex radiographic protocols.\n\nIts ergonomic design minimizes patient repositioning, reducing exam times while maximizing throughput. Full DICOM 3.0 and HL7 integration ensures seamless connectivity to any HIS/RIS/PACS infrastructure.`,
    order: 3,
    features: [
      { title: 'Motorized Ceiling Suspension', description: 'Programmable tube positioning for rapid, reproducible setups' },
      { title: 'Large Area FPD', description: '43×43 cm detector for full-field anatomical coverage' },
      { title: 'Multi-Function Wall Bucky', description: 'Height-adjustable wall bucky for flexible patient positioning' },
      { title: 'Auto-Tracking Technology', description: 'Automatic SID and collimation adjustment to detector position' },
      { title: 'Dose Management', description: 'Real-time dose monitoring and RDSR reporting' },
      { title: 'DICOM Worklist', description: 'Modality worklist for streamlined RIS/PACS integration' },
    ],
    specifications: [
      { label: 'Generator Power',    value: '65 kW' },
      { label: 'kVp Range',          value: '40–150 kVp' },
      { label: 'mAs Range',          value: '0.4–800 mAs' },
      { label: 'Detector Size',      value: '43 × 43 cm' },
      { label: 'Pixel Matrix',       value: '2880 × 2880' },
      { label: 'Spatial Resolution', value: '3.4 lp/mm' },
      { label: 'Suspension Travel',  value: '240 cm (longitudinal), 300 cm (lateral)' },
      { label: 'SID Range',          value: '90–200 cm' },
    ],
    published: true,
  },
  {
    name: 'DRGEM DS30',
    slug: 'drgem-ds30',
    category: 'Ultrasound',
    badge: '',
    tagline: 'Premium color Doppler ultrasound system with AI-assisted diagnostics for general and women\'s health',
    description: `The DRGEM DS30 is a high-performance color Doppler ultrasound system built for a wide spectrum of clinical applications including abdominal, obstetric, gynecological, small parts, and vascular imaging.\n\nEquipped with a large high-resolution monitor and intelligent AI-assisted measurement tools, the DS30 delivers exceptional image quality and workflow efficiency. Its broad transducer compatibility and ergonomic design make it the preferred choice for busy diagnostic centers across Bangladesh.`,
    order: 4,
    features: [
      { title: 'AI-Assisted Measurements', description: 'Automated biometry and organ boundary detection for faster reporting' },
      { title: 'Broadband Transducer Support', description: 'Compatible with convex, linear, transvaginal, and phased-array probes' },
      { title: 'Color Power Doppler', description: 'High-sensitivity color and power Doppler for vascular assessment' },
      { title: 'Speckle Reduction Imaging', description: 'Advanced SRI for cleaner, higher-contrast images' },
      { title: '4D Imaging Ready', description: 'Optional 4D capability for real-time volumetric obstetric imaging' },
      { title: 'DICOM Export', description: 'Built-in DICOM 3.0 for direct PACS connectivity' },
    ],
    specifications: [
      { label: 'Display',            value: '21.5" Full HD LED monitor' },
      { label: 'Scanning Modes',     value: 'B, M, Color Doppler, Power Doppler, Spectral Doppler, CW, Panoramic' },
      { label: 'Frequency Range',    value: '2–15 MHz' },
      { label: 'Image Depth',        value: 'Up to 35 cm' },
      { label: 'Frame Rate',         value: 'Up to 400 fps (B-mode)' },
      { label: 'Storage',            value: 'HDD ≥ 320 GB, USB 3.0, DVD-RW' },
      { label: 'Probe Ports',        value: '3 active probe connectors' },
      { label: 'Connectivity',       value: 'DICOM 3.0, USB, LAN, Wi-Fi' },
    ],
    published: true,
  },
  {
    name: 'DRGEM DS20',
    slug: 'drgem-ds20',
    category: 'Ultrasound',
    badge: '',
    tagline: 'Compact portable ultrasound for point-of-care and field diagnostics',
    description: `The DRGEM DS20 is a lightweight, portable ultrasound system designed for point-of-care diagnostics in clinics, rural health centers, and field settings across Bangladesh. Despite its compact form, the DS20 delivers excellent image quality across abdominal, obstetric, gynecological, and small-parts examinations.\n\nWith an integrated battery, built-in storage, and intuitive interface, the DS20 empowers healthcare providers to deliver quality diagnostics wherever patients need it most.`,
    order: 5,
    features: [
      { title: 'Portable & Lightweight', description: 'Compact design weighing under 6 kg for easy transport' },
      { title: 'Battery Operation', description: 'Integrated battery for use in areas without stable power supply' },
      { title: 'Multi-Probe Compatibility', description: 'Supports convex, linear, and transvaginal transducers' },
      { title: 'Full Doppler Suite', description: 'Color, Power, and Pulsed-Wave Doppler modes included' },
      { title: 'Intuitive Interface', description: 'Simplified workflow for rapid training and deployment' },
    ],
    specifications: [
      { label: 'Display',        value: '12.1" high-brightness LCD' },
      { label: 'Scanning Modes', value: 'B, M, Color Doppler, Power Doppler, PW Doppler' },
      { label: 'Frequency Range', value: '2–12 MHz' },
      { label: 'Battery Life',   value: '≥ 60 minutes continuous scanning' },
      { label: 'Weight',         value: '< 6 kg' },
      { label: 'Storage',        value: 'Internal SSD + USB export' },
      { label: 'Connectivity',   value: 'DICOM 3.0, USB, Wi-Fi (optional)' },
    ],
    published: true,
  },
  {
    name: 'DRGEM GEM-R',
    slug: 'drgem-gem-r',
    category: 'Mobile DR',
    badge: '',
    tagline: 'Versatile fluoroscopy-ready mobile DR system with remote-controlled positioning',
    description: `The DRGEM GEM-R extends bedside radiography capabilities with remote-controlled motorized positioning, reducing radiation exposure to operators and improving workflow in isolation wards, ICUs, and trauma centers.\n\nIts robust build, extended battery life, and compatibility with all major flat panel detectors make it an indispensable tool for modern Bangladeshi healthcare facilities.`,
    order: 6,
    features: [
      { title: 'Remote-Controlled Operation', description: 'Wireless remote for operator dose minimization in isolation settings' },
      { title: 'Motorized All-Direction Drive', description: 'Powered front and rear wheels for effortless navigation' },
      { title: 'Multi-FPD Compatibility', description: 'Works with both wired and wireless flat panel detectors' },
      { title: 'Extended Battery Life', description: 'Li-ion pack for full-shift operation without recharging' },
      { title: 'Automatic Brightness Control', description: 'ABC for consistent image quality across patient sizes' },
    ],
    specifications: [
      { label: 'Generator Power',  value: '30 kW' },
      { label: 'kVp Range',        value: '40–125 kVp' },
      { label: 'mAs Range',        value: '0.4–200 mAs' },
      { label: 'Remote Range',     value: '≥ 10 m wireless remote' },
      { label: 'Battery',          value: 'Li-ion, 150+ exposures/charge' },
      { label: 'Display',          value: '12.1" touchscreen' },
      { label: 'Weight',           value: '≈ 320 kg' },
    ],
    published: true,
  },
];

const HERO_DATA = {
  headline: 'Precision Imaging for Better Healthcare',
  subheadline: 'SmartX Technology Limited is the exclusive authorized distributor of DRGEM medical imaging solutions in Bangladesh — X-ray systems, mobile DR, ultrasound, and more. Trusted by 500+ hospitals across all 64 districts.',
  ctaLabel: 'Explore Products',
  ctaHref: '#products',
  ctaSecondaryLabel: 'Request a Quote',
  ctaSecondaryHref: '#contact',
  bgImage: '',
  badge: 'Authorized DRGEM Distributor — Bangladesh',
  stats: [
    { value: '20+', label: 'Years Experience' },
    { value: '500+', label: 'Installations' },
    { value: '64', label: 'Districts Served' },
    { value: '24/7', label: 'After-Sales Support' },
  ],
};

const ABOUT_DATA = {
  heading: 'About SmartX Technology Limited',
  body: `SmartX Technology Limited (SmartX) is the exclusive authorized distributor of DRGEM medical imaging equipment in Bangladesh. Since our founding, we have delivered cutting-edge diagnostic imaging solutions to hospitals, clinics, and diagnostic centers across all 64 districts of Bangladesh.\n\nAs a trusted partner of DRGEM — one of Korea's leading medical imaging manufacturers — we bring world-class X-ray systems, digital radiography, and ultrasound equipment to the Bangladeshi healthcare market.\n\nOur commitment extends beyond equipment supply. We provide expert consultation, professional installation, comprehensive operator training, and round-the-clock after-sales service — ensuring that every facility achieves maximum diagnostic capability.`,
  image: '',
  mission: 'To make high-quality diagnostic imaging accessible to every healthcare facility in Bangladesh through reliable technology, expert support, and exceptional service.',
  vision: 'To be the most trusted medical imaging equipment partner in South Asia, advancing healthcare infrastructure one hospital at a time.',
  highlights: [
    { icon: '🏆', title: 'Exclusive Distributor', description: 'Official DRGEM authorized partner for Bangladesh' },
    { icon: '🔧', title: 'Expert Installation', description: 'Certified biomedical engineers for professional setup and calibration' },
    { icon: '📞', title: '24/7 Support', description: 'Round-the-clock after-sales service and technical assistance' },
    { icon: '🌍', title: 'Nationwide Coverage', description: 'Service network spanning all 64 districts of Bangladesh' },
  ],
};

const SETTINGS_DATA = {
  siteName: 'SmartX Technology Limited',
  siteTagline: 'Exclusive Distributor of DRGEM Medical Imaging Equipment in Bangladesh',
  logoText: 'SmartX',
  colorPrimary: '#0ea5e9',
  colorSecondary: '#6366f1',
  colorAccent: '#06b6d4',
  fontHeading: "'Cal Sans', 'Inter', sans-serif",
  fontBody: "'Inter', sans-serif",
  phone: '+880-2-XXXXXXX',
  email: 'info@smartxlimited.com',
  address: 'House XX, Road XX, Gulshan-2, Dhaka 1212, Bangladesh',
  whatsapp: '',
  facebook: '',
  linkedin: '',
  youtube: '',
  metaTitle: 'SmartX Technology Limited | DRGEM Medical Imaging Equipment',
  metaDescription: 'SmartX Technology Limited — exclusive authorized distributor of DRGEM X-ray, DR, and ultrasound solutions in Bangladesh. Expert installation and 24/7 support.',
  ctaLabel: 'Request a Quote',
  ctaHref: '#contact',
  navLinks: [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Products', href: '#products' },
    { label: 'Team', href: '#team' },
    { label: 'Contact', href: '#contact' },
  ],
};

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.\n');

  // Admin
  const adminExists = await Admin.findOne();
  if (!adminExists) {
    const admin = new Admin({ username: 'admin', password: 'admin123' });
    await admin.save();
    console.log('👤 Admin created — username: admin / password: admin123');
    console.log('   ⚠️  Change this password immediately after first login!\n');
  } else {
    console.log('👤 Admin already exists, skipping.\n');
  }

  // Settings
  const sExists = await Settings.findOne();
  if (!sExists) {
    await Settings.create(SETTINGS_DATA);
    console.log('⚙️  Site settings created.');
  } else {
    console.log('⚙️  Settings already exist, skipping.');
  }

  // Hero
  const hExists = await Hero.findOne();
  if (!hExists) {
    await Hero.create(HERO_DATA);
    console.log('🦸  Hero section created.');
  } else {
    console.log('🦸  Hero already exists, skipping.');
  }

  // About
  const aExists = await About.findOne();
  if (!aExists) {
    await About.create(ABOUT_DATA);
    console.log('ℹ️   About section created.');
  } else {
    console.log('ℹ️   About already exists, skipping.');
  }

  // Products
  let created = 0;
  for (const p of PRODUCTS) {
    const exists = await Product.findOne({ slug: p.slug });
    if (!exists) {
      await Product.create(p);
      created++;
    }
  }
  console.log(`📦  ${created} products created (${PRODUCTS.length - created} already existed).\n`);

  console.log('✨  Seed complete! Start the dev server: npm run dev');
  console.log('   Admin panel: http://localhost:3000/admin/login\n');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
