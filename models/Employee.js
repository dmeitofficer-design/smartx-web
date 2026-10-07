import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  designation: { type: String, required: true, trim: true },
  profilePic: { type: String, default: '' },
  joiningDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  
  // Flexible structure allowing unlimited dynamic custom inputs
  additionalFields: [
    {
      label: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],

  // 🟢 NEW AUTOMATED TRACKING ATTRIBUTES
  scanCount: { 
    type: Number, 
    default: 0 
  },
  scanHistory: [
    {
      scannedAt: { type: Date, default: Date.now },
      ipAddress: { type: String, trim: true },
      browser: { type: String, trim: true },
      device: { type: String, trim: true },
      location: { type: String, default: 'Dhaka, Bangladesh' } // Default fallback or dynamically saved location
    }
  ]
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);