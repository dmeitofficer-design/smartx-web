import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema({
  heading: { 
    type: String, 
    default: 'About SmartX Technology Limited' 
  },
  body: { 
    type: String, 
    default: 'SmartX Technology Limited is a sister concern of DME Group, supplying medical imaging equipment and healthcare technology to hospitals, clinics and diagnostic centres across Bangladesh.\n\nWe bring together trusted international brands, professional installation, user training and responsive after-sales support — so every facility we work with can deliver accurate, dependable diagnostics.' 
  },
  // MIGRATED: Storing plain string Cloudinary URLs instead of large binary media objects or base64 data URIs
  image: { 
    type: String, 
    default: '' 
  },
  mission: { 
    type: String, 
    default: 'To make high-quality diagnostic imaging accessible to every healthcare facility in Bangladesh through reliable technology and exceptional service.' 
  },
  vision: { 
    type: String, 
    default: 'To be the most trusted medical technology partner for healthcare providers in South Asia.' 
  },
  highlights: {
    type: [{ 
      icon: String, 
      title: String, 
      description: String 
    }],
    default: [
      { icon: 'building',           title: 'Backed by DME Group', description: 'Built on the experience, partnerships and service network of DME Group.' },
      { icon: 'screwdriver-wrench', title: 'Expert Installation', description: 'Certified engineers for professional setup, calibration and training.' },
      { icon: 'headset',            title: '24/7 Support',        description: 'Round-the-clock after-sales service and preventive maintenance.' },
      { icon: 'map-location-dot',   title: 'Nationwide Coverage', description: 'Service reach across all 64 districts of Bangladesh.' },
    ],
  },
}, { timestamps: true });

export default mongoose.models.About || mongoose.model('About', AboutSchema);