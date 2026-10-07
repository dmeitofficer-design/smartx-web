import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// ⚡️ REMOVED THE "next" PARAMETER COMPLETELY
AdminSchema.pre('save', async function () {
  if (!this.isModified('password')) return; // No "next()" here
  
  this.password = await bcrypt.hash(this.password, 12);
  // No "next()" here either. Just let the async function resolve naturally.
});

AdminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
