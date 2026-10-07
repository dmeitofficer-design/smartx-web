// components/ExpertModal.jsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpertModal({ isOpen, onClose }) {
  const expert = {
    name: "Eng. Rakib Hasan",
    title: "Senior Product Specialist",
    phone: "+880-1711-234567",
    whatsapp: "+8801711234567"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div
            className="modal-content expert-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <button className="modal-close" onClick={onClose}>×</button>

            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div className="expert-avatar">
                <i className="fa-solid fa-user-tie" style={{ fontSize: '4rem', color: 'var(--color-primary)' }} />
              </div>
              
              <h3>{expert.name}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{expert.title}</p>

              <div className="expert-contact">
                <a href={`tel:${expert.phone}`} className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '0.8rem' }}>
                  <i className="fa-solid fa-phone" /> Call Now: {expert.phone}
                </a>
                
                <a href={`https://wa.me/${expert.whatsapp}`} target="_blank" className="btn btn-outline" style={{ width: '100%' }}>
                  <i className="fa-brands fa-whatsapp" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}