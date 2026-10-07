'use client';
import { useState } from 'react';
import styles from './ContactSection.module.css';

const EMPTY_FORM = { name: '', email: '', phone: '', organization: '', product: '', message: '' };

export default function ContactSection({ settings = {} }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(''); // '', 'sending', 'ok', 'error'

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
      setForm(EMPTY_FORM);
    } catch {
      setStatus('error');
    }
  };

  const email    = settings.email    || 'info@smartxlimited.com';
  const phone    = settings.phone    || '+880-XXX-XXXXX';
  const address  = settings.address  || 'Dhaka, Bangladesh';
  const whatsapp = settings.whatsapp || '';

  // Direct link to open the exact pin on Google Maps
  const mapDirectUrl = "https://maps.google.com/?q=DIGITAL+MACHINERY+EQUIPMENT";

  const contacts = [
    { icon: 'fa-solid fa-envelope',     label: 'Email',    value: email,   href: `mailto:${email}` },
    { icon: 'fa-solid fa-phone',        label: 'Phone',    value: phone,   href: `tel:${phone.replace(/[^\d+]/g, '')}` },
    ...(whatsapp ? [{ icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', value: whatsapp, href: `https://wa.me/${whatsapp.replace(/\D/g, '')}` }] : []),
    { icon: 'fa-solid fa-location-dot', label: 'Office',   value: address, href: mapDirectUrl },
  ];

  const socials = [
    settings.facebook && { icon: 'fa-facebook-f',  href: settings.facebook, label: 'Facebook' },
    settings.linkedin && { icon: 'fa-linkedin-in', href: settings.linkedin, label: 'LinkedIn' },
    settings.youtube  && { icon: 'fa-youtube',     href: settings.youtube,  label: 'YouTube' },
  ].filter(Boolean);

  return (
    <section id="contact" className={`section ${styles.section}`}>
      <div className="container">
        <div className={`${styles.header} animate-fade-up`}>
          <p className="section-label">Contact Us</p>
          <h2 className={styles.title}>
            Let&apos;s <span className="gradient-text">Talk</span>
          </h2>
          <p className={styles.subtitle}>
            Need a quote, a product demo, or technical support? Send us a message and our team will respond within one business day.
          </p>
        </div>

        <div className={`${styles.panel} animate-fade-up`}>
          {/* ── Left: contact details ── */}
          <aside className={styles.aside}>
            <div>
              <h3 className={styles.asideTitle}>Contact information</h3>
              <p className={styles.asideText}>Reach us directly — we&apos;re happy to help.</p>
            </div>

            <ul className={styles.contactList}>
              {contacts.map(c => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className={styles.contactItem}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <span className={styles.contactIcon}><i className={c.icon} /></span>
                    <span className={styles.contactText}>
                      <span className={styles.contactLabel}>{c.label}</span>
                      <span className={styles.contactValue}>{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className={styles.map}>
              <iframe
                title="Office location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d228.17691145322138!2d90.4007261071828!3d23.789046507607598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70025615ceb%3A0xc29507e916260f38!2sDIGITAL%20MACHINERY%20EQUIPMENT!5e0!3m2!1sen!2sbd!4v1786796920680!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            {socials.length > 0 && (
              <div className={styles.socials}>
                {socials.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                    <i className={`fa-brands ${s.icon}`} />
                  </a>
                ))}
              </div>
            )}
          </aside>

          {/* ── Right: inquiry form ── */}
          <div className={styles.formWrap}>
            {status === 'ok' ? (
              <div className={styles.success}>
                <span className={styles.successIcon}><i className="fa-solid fa-check" /></span>
                <h3>Message sent</h3>
                <p>Thank you for your inquiry. Our team will get back to you within 24 hours.</p>
                <button className="btn btn-outline" onClick={() => setStatus('')}>Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formHead}>
                  <h3>Send an inquiry</h3>
                  <p>Fields marked * are required.</p>
                </div>

                <div className={styles.row}>
                  <div className="form-group">
                    <label htmlFor="c-name">Full name *</label>
                    <input id="c-name" className="form-input" required placeholder="Dr. Mehedi Hasan" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-email">Email *</label>
                    <input id="c-email" className="form-input" type="email" required placeholder="doctor@hospital.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className="form-group">
                    <label htmlFor="c-phone">Phone</label>
                    <input id="c-phone" className="form-input" type="tel" placeholder="+880 1XX-XXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-org">Organization</label>
                    <input id="c-org" className="form-input" placeholder="Hospital / clinic name" value={form.organization} onChange={e => set('organization', e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="c-product">Product of interest</label>
                  <input id="c-product" className="form-input" placeholder="e.g. C-Arm, Ultrasound, OPG…" value={form.product} onChange={e => set('product', e.target.value)} />
                </div>

                <div className="form-group">
                  <label htmlFor="c-message">Message *</label>
                  <textarea id="c-message" className="form-input" required placeholder="Tell us about your requirement…" rows={5} value={form.message} onChange={e => set('message', e.target.value)} />
                </div>

                {status === 'error' && (
                  <p className={styles.error}>
                    <i className="fa-solid fa-circle-exclamation" /> Something went wrong. Please try again.
                  </p>
                )}

                <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={status === 'sending'}>
                  {status === 'sending'
                    ? <><span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending…</>
                    : <><i className="fa-solid fa-paper-plane" /> Send inquiry</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
