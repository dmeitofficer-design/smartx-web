import mongoose from 'mongoose';

const HeroSchema = new mongoose.Schema({
  headline:    { type: String, default: 'Precision Imaging for Better Healthcare' },
  subheadline: { type: String, default: 'Exclusive distributor of DRGEM medical imaging solutions in Bangladesh — X-ray, DR systems, ultrasound, and more.' },
  ctaLabel:    { type: String, default: 'Explore Products' },
  ctaHref:     { type: String, default: '#products' },
  ctaSecondaryLabel: { type: String, default: 'Request a Quote' },
  ctaSecondaryHref:  { type: String, default: '#contact' },
  bgImage:     { type: String, default: '' }, // base64 or URL
  badge:       { type: String, default: 'Authorized DRGEM Distributor — Bangladesh' },
  stats: {
    type: [{
      value: String,
      label: String,
    }],
    default: [
      { value: '20+', label: 'Years Experience' },
      { value: '500+', label: 'Installations' },
      { value: '64', label: 'Districts Served' },
      { value: '24/7', label: 'After-Sales Support' },
    ],
  },
}, { timestamps: true });

export default mongoose.models.Hero || mongoose.model('Hero', HeroSchema);
