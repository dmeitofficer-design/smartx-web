import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
 slug: { 
  type: String, 
  unique: true, 
  sparse: true,     // Allows multiple documents with null/undefined slug
  index: true 
},
  name:        { type: String, required: true },
  category:    { type: String, required: true },
  tagline:     { type: String, default: '' },
  description: { type: String, default: '' },
  image:       { type: String, default: '' }, // base64 or URL — hero/card image
  gallery:     { type: [String], default: [] }, // additional images
  link:        { type:   String,    default:''},
  catalog: { type: String, default: '' },
  features: {
    type: [{ title: String, description: String }],
    default: [],
  },
  specifications: {
    type: [{ label: String, value: String }],
    default: [],
  },
  badge:       { type: String, default: '' }, // e.g. "New", "Bestseller"
  published:   { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate slug
// Auto-generate slug explicitly passing and resolving the next middleware token
// Auto-generate slug from name if not provided
ProductSchema.pre('save', async function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);