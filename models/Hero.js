import mongoose from 'mongoose';

const HeroSchema = new mongoose.Schema({
  headline:           { type: String, default: 'Precision Imaging for Better Healthcare' },
  subheadline:        { type: String, default: 'Exclusive distributor of DRGEM medical imaging solutions in Bangladesh — X-ray, DR systems, ultrasound, and more.' },
  ctaLabel:           { type: String, default: 'Explore Products' },
  ctaHref:            { type: String, default: '#products' },
  ctaSecondaryLabel:  { type: String, default: 'Request a Quote' },
  ctaSecondaryHref:   { type: String, default: '#contact' },

  // Background — separate from hero product image
  bgType:             { type: String, default: 'gradient', enum: ['gradient', 'color', 'image'] },
  bgColor:            { type: String, default: '#0c1524' },
  bgImage:            { type: String, default: '' },   // base64 or URL — full-bleed background

  // Hero product images with per-slide badge assignments and product details
  heroImages: {
    type: [{
      image:        { type: String, default: '' },
      model:        { type: String, default: '' },
      tagline:      { type: String, default: '' },
      link:         { type: String, default: '' },
      badgeIndices: { type: [Number], default: [] }
    }],
    default: []
  },

  // Floating badges — global pool (replaces single CE badge)
  badges: {
    type: [{
      label:   { type: String, default: 'CE Certified' },
      sub:     { type: String, default: 'DRGEM Equipment' },
      icon:    { type: String, default: '' },   // SVG/image base64
    }],
    default: [
      { label: 'CE Certified',   sub: 'DRGEM Equipment',    icon: '' },
      { label: 'ISO 13485',      sub: 'Quality Management', icon: '' },
    ],
  },

  // Legacy single-badge fields (kept for backward compat, not shown in UI)
  ceBadgeLabel:  { type: String, default: 'CE Certified' },
  ceBadgeSub:    { type: String, default: 'DRGEM Equipment' },
  ceBadgeIcon:   { type: String, default: '' },

  badge:  { type: String, default: 'Authorized DRGEM Distributor — Bangladesh' },
  stats: {
    type: [{ value: String, label: String }],
    default: [
      { value: '20+',  label: 'Years Experience' },
      { value: '500+', label: 'Installations' },
      { value: '64',   label: 'Districts Served' },
      { value: '24/7', label: 'After-Sales Support' },
    ],
  },
}, { timestamps: true });

export default mongoose.models.Hero || mongoose.model('Hero', HeroSchema);