'use client';
import { motion } from 'framer-motion';
import styles from './TeamSection.module.css';

function PlaceholderAvatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '??';
  return (
    <div className={styles.avatar}>
      <span>{initials}</span>
    </div>
  );
}

export default function TeamSection({ team = [] }) {
  if (team.length === 0) return null;

  return (
    <section id="team" className={`section ${styles.section}`}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label">Our Team</p>
          <h2 style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-md)' }}>
            Meet the <span className="gradient-text">People Behind SmartX</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto' }}>
            A dedicated team of medical imaging specialists and engineers committed to delivering excellence.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {team.map((member, i) => (
            <motion.div
              key={member._id}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.imgWrap}>
                {member.image ? (
                  <img src={member.image} alt={member.name} className={styles.img} />
                ) : (
                  <PlaceholderAvatar name={member.name} />
                )}
              </div>
              <div className={styles.info}>
                <h4 className={styles.name}>{member.name}</h4>
                <p className={styles.role}>{member.role}</p>
                {member.bio && <p className={styles.bio}>{member.bio}</p>}
                <div className={styles.links}>
                  {member.email   && <a href={`mailto:${member.email}`} aria-label="Email"><i className="fa-solid fa-envelope" /></a>}
                  {member.linkedin && <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" /></a>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
