'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './QuoteModal.module.css';

export default function QuoteModal({ isOpen, onClose, defaultProduct = '' }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', organization: '',
    product: defaultProduct, message: '',
  });
  const [status, setStatus] = useState(''); // '' | 'sending' | 'ok' | 'error'
  const overlayRef = useRef();

  // Sync defaultProduct when it changes (e.g. modal opens for different product)
  useEffect(() => {
    setForm(f => ({ ...f, product: defaultProduct }));
  }, [defaultProduct]);

  // Fetch product list from DB
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('');
    setForm({ name: '', email: '', phone: '', organization: '', product: defaultProduct, message: '' });
  };

  const handleClose = () => {
    onClose();
    setTimeout(handleReset, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          ref={overlayRef}
          onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div>
                <div className={styles.headerEyebrow}>
                  <span className={styles.dot} />
                   Equipment Inquiry
                </div>
                <h2 className={styles.title}>Request a Quote</h2>
              </div>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {status === 'ok' ? (
                <motion.div
                  className={styles.success}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className={styles.successIcon}>
                    <i className="fa-solid fa-circle-check" />
                  </div>
                  <h3>Inquiry Sent!</h3>
                  <p>Thank you for your interest. Our team will get back to you within 24 business hours.</p>
                  <div className={styles.successActions}>
                    <button className="btn btn-outline" onClick={handleReset}>Send Another</button>
                    <button className="btn btn-primary" onClick={handleClose}>Close</button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  {/* Product selector — prominent at top */}
                  <div className={styles.productField}>
                    <label className={styles.label}>
                      <i className="fa-solid fa-box-open" style={{ color: 'var(--color-primary)', marginRight: 6 }} />
                      Product of Interest
                    </label>
                    <div className={styles.selectWrap}>
                      <select
                        className={styles.select}
                        value={form.product}
                        onChange={e => set('product', e.target.value)}
                      >
                        <option value="">— Select a product —</option>
                        {products.map(p => (
                          <option key={p._id} value={p.name}>{p.name} · {p.category}</option>
                        ))}
                        <option value="General Inquiry">General Inquiry / Multiple Products</option>
                      </select>
                      <i className="fa-solid fa-chevron-down" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                    </div>
                    {form.product && form.product !== 'General Inquiry' && (
                      <motion.div
                        className={styles.selectedBadge}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-success)', fontSize: '0.75rem' }} />
                        Selected: <strong>{form.product}</strong>
                      </motion.div>
                    )}
                  </div>

                  <div className={styles.divider} />

                  {/* Two-col grid */}
                  <div className={styles.grid2}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Full Name *</label>
                      <input
                        className={styles.input}
                        required
                        placeholder="Dr. Ahmed Rahman"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Email Address *</label>
                      <input
                        className={styles.input}
                        type="email"
                        required
                        placeholder="doctor@hospital.com"
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Phone Number</label>
                      <input
                        className={styles.input}
                        placeholder="+880-1XX-XXXXXXX"
                        value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Hospital / Organization</label>
                      <input
                        className={styles.input}
                        placeholder="e.g. Dhaka Medical College Hospital"
                        value={form.organization}
                        onChange={e => set('organization', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Message</label>
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      placeholder="Describe your requirement — quantity, installation timeline, budget range, etc."
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                    />
                  </div>

                  {status === 'error' && (
                    <div className={styles.errorMsg}>
                      <i className="fa-solid fa-triangle-exclamation" /> Something went wrong. Please try again.
                    </div>
                  )}

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <><span className={styles.spinner} /> Sending Inquiry…</>
                    ) : (
                      <><i className="fa-solid fa-paper-plane" /> Send Inquiry</>
                    )}
                  </button>

                  <p className={styles.disclaimer}>
                    <i className="fa-solid fa-lock" style={{ fontSize: '0.7rem' }} />
                    Your information is private and will only be used to respond to your inquiry.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
