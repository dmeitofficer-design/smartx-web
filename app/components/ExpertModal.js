'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ExpertModal.module.css';

function Avatar({ member }) {
  const initials = member.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

  if (member.image) {
    return <img src={member.image} alt={member.name} className={styles.avatar} />;
  }
  return (
    <div className={styles.avatarFallback}>
      <span>{initials}</span>
    </div>
  );
}

function ExpertCard({ member, index }) {
  return (
    <motion.div
      className={styles.expertCard}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      <div className={styles.cardTop}>
        <div className={styles.avatarWrap}>
          <Avatar member={member} />
          <span className={styles.onlineDot} />
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{member.name}</div>
          <div className={styles.role}>{member.role}</div>
          {member.email && (
            <a href={`mailto:${member.email}`} className={styles.email}>
              <i className="fa-solid fa-envelope" />
              {member.email}
            </a>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        {member.phone ? (
          <a href={`tel:${member.phone}`} className={styles.callBtn}>
            <i className="fa-solid fa-phone" />
            <div>
              <div className={styles.callLabel}>Direct Call</div>
              <div className={styles.callNumber}>{member.phone}</div>
            </div>
          </a>
        ) : (
          <div className={styles.noPhone}>
            <i className="fa-solid fa-phone-slash" style={{ opacity: 0.3 }} />
            <span>No direct number listed</span>
          </div>
        )}

        {member.email && (
          <a href={`mailto:${member.email}`} className={styles.emailBtn}>
            <i className="fa-solid fa-envelope" />
            Email
          </a>
        )}

        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noreferrer" className={styles.linkedinBtn}>
            <i className="fa-brands fa-linkedin-in" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function ExpertModal({ isOpen, onClose }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef();

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/team')
      .then(r => r.json())
      .then(data => { setTeam(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
          onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div>
                <div className={styles.eyebrow}>
                  <span className={styles.liveDot} />
                  Available to Help
                </div>
                <h2 className={styles.title}>Talk to an Expert</h2>
                <p className={styles.subtitle}>
                  Reach out directly to our DRGEM specialists for technical consultation, demos, and pricing.
                </p>
              </div>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner} />
                  <span>Loading team…</span>
                </div>
              ) : team.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fa-solid fa-users" style={{ fontSize: '2rem', opacity: 0.25 }} />
                  <p>Team contact details coming soon.</p>
                  <p style={{ fontSize: 'var(--font-size-sm)' }}>
                    Please use the{' '}
                    <button
                      className={styles.inlineLink}
                      onClick={onClose}
                    >
                      contact form
                    </button>{' '}
                    for inquiries.
                  </p>
                </div>
              ) : (
                <div className={styles.expertList}>
                  {team[0] && (
  <ExpertCard key={team[0]._id} member={team[0]} index={0} />
)}

                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <i className="fa-regular fa-clock" style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }} />
              <span>Available Saturday – Thursday, 9 AM – 6 PM (BST)</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
