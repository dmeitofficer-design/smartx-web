import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  role:        { type: String, required: true },
  bio:         { type: String, default: '' },
  image:       { type: String, default: '' },
  email:       { type: String, default: '' },
  phone:       { type: String, default: '' },
  linkedin:    { type: String, default: '' },
  order:       { type: Number, default: 0 },
  published:   { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
