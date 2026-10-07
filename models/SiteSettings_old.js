import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
  // Branding
  siteName:        { type: String, default: 'SmartX Technology Limited' },
  siteTagline:     { type: String, default: 'Exclusive Distributor of DRGEM Medical Imaging Equipment in Bangladesh' },
  logoText:        { type: String, default: 'SmartX' },
  faviconUrl:      { type: String, default: '' },

  // Colors & Fonts (CSS variables)
  colorPrimary:    { type: String, default: '#0ea5e9' },
  colorSecondary:  { type: String, default: '#6366f1' },
  colorAccent:     { type: String, default: '#06b6d4' },
  colorBgLight:    { type: String, default: '#f8fafc' },
  colorBgDark:     { type: String, default: '#0c1524' },
  fontHeading:     { type: String, default: "'Cal Sans', sans-serif" },
  fontBody:        { type: String, default: "'Inter', sans-serif" },

  // Contact Info
  phone:           { type: String, default: '+880-XXX-XXXXX' },
  email:           { type: String, default: 'info@smartxbdlimited.com' },
  address:         { type: String, default: 'Dhaka, Bangladesh' },
  whatsapp:        { type: String, default: '' },

  // Social Media
  facebook:        { type: String, default: '' },
  linkedin:        { type: String, default: '' },
  youtube:         { type: String, default: '' },

  // SEO
  metaTitle:       { type: String, default: 'SmartX Technology Limited | DRGEM Medical Imaging Equipment' },
  metaDescription: { type: String, default: 'SmartX Technology Limited — exclusive distributor of DRGEM X-ray, DR systems, and ultrasound solutions in Bangladesh.' },

  // Navigation links (editable labels)
  navLinks: {
    type: [{
      label: String,
      href:  String,
    }],
    default: [
      { label: 'Home',     href: '#hero' },
      { label: 'About',    href: '#about' },
      { label: 'Products', href: '#products' },
      { label: 'Team',     href: '#team' },
      { label: 'Contact',  href: '#contact' },
    ],
  },

  // CTA Button
  ctaLabel:        { type: String, default: 'Request a Quote' },
  ctaHref:         { type: String, default: '#contact' },
}, { timestamps: true });

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
