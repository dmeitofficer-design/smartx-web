// components/QuoteModal.jsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuoteModal({ isOpen, onClose, productName }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', organization: '', message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, product: productName }),
      });

      if (res.ok) {
        setStatus('ok');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <button className="modal-close" onClick={onClose}>×</button>

            <h2>Request a Quote</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              for <strong>{productName}</strong>
            </p>

            {status === 'ok' ? (
              <div className="success-message">
                <h3>Thank You!</h3>
                <p>Our team will contact you shortly with a personalized quote.</p>
                <button onClick={onClose} className="btn btn-primary">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Full Name *" required
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                
                <input type="email" placeholder="Email *" required
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                
                <input type="tel" placeholder="Phone Number *" required
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                
                <input type="text" placeholder="Organization / Hospital"
                  value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} />
                
                <textarea placeholder="Additional requirements (optional)" rows={4}
                  value={form.message} onChange={e => setForm({...form, message: e.target.value})} />

                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending...' : 'Submit Request'}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}