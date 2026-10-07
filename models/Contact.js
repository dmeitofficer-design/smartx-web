import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String, default: '' },
  linkedin:    { type: String, default: '' },
  organization:{ type: String, default: '' },
  product:     { type: String, default: '' },
  message:     { type: String, required: false },
  read:        { type: Boolean, default: false },
  replied:     { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
