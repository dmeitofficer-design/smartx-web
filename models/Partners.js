import mongoose from 'mongoose';

// Define a structured sub-schema for the logos
const LogoItemSchema = new mongoose.Schema({
  image: { type: String, default: '' },
  link: { type: String, default: '' }
}, { _id: false }); // _id: false prevents MongoDB from generating automatic sub-IDs for every single link

const PartnersSchema = new mongoose.Schema({
  title: { type: String, default: 'Our Trusted Partners & Clients' },
  partners: { type: [LogoItemSchema], default: [] },   // 🟢 Now safely handles an array of objects
  clients: { type: [LogoItemSchema], default: [] },    // 🟢 Now safely handles an array of objects
}, { timestamps: true });

// Ensure we delete any cached model compilation so it updates live without restarting Next.js
if (mongoose.models.Partners) {
  delete mongoose.models.Partners;
}

export default mongoose.model('Partners', PartnersSchema);