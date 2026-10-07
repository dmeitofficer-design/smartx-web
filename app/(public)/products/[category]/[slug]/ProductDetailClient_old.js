'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import styles from './product.module.css';

function PlaceholderProductImage() {
  return (
    <div className={styles.placeholder}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="8" y="16" width="64" height="48" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <circle cx="40" cy="40" r="16" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M24 40 L56 40 M40 24 L40 56" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        <rect x="30" y="6" width="20" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
      </svg>
      <span>Product Image</span>
      <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>Replace from Admin Panel</span>
    </div>
  );
}

export default function ProductDetailClient({ product, related }) {
  const [activeTab, setActiveTab] = useState('features');

  return (
    <main style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'rgba(var(--color-primary-rgb),0.04)', borderBottom: '1px solid var(--glass-border)', padding: '0.75rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--color-primary)' }}>Home</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
          <Link href="/#products" style={{ color: 'var(--color-primary)' }}>Products</Link>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
          <span style={{ color: 'var(--text)' }}>{product.name}</span>
        </div>
      </div>

      {/* Hero */}
      <section className={`section ${styles.hero}`}>
        <div className="container">
          <div className={styles.heroGrid}>
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className={styles.imgCol}
            >
              <div className={styles.imgWrap}>
                {product.image ? (
                  <img src={product.image} alt={product.name} className={styles.heroImg} />
                ) : (
                  <PlaceholderProductImage />
                )}
                {product.badge && <span className={`badge badge-new ${styles.badge}`}>{product.badge}</span>}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="section-label" style={{ marginBottom: 'var(--space-md)' }}>{product.category}</div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 'var(--space-md)' }}>{product.name}</h1>
              <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 'var(--space-xl)' }}>
                {product.tagline || product.description?.slice(0, 200)}
              </p>

              {/* Top features */}
              {product.features?.slice(0, 4).length > 0 && (
                <div className={styles.featureList}>
                  {product.features.slice(0, 4).map((f, i) => (
                    <div key={i} className={styles.featureItem}>
                      <div className={styles.featureCheck}><i className="fa-solid fa-check" /></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{f.title}</div>
                        {f.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.ctas}>
                <a href={`/#contact?product=${encodeURIComponent(product.name)}`} className="btn btn-primary btn-lg btn-cta">
                  <i className="fa-solid fa-paper-plane" /> Request a Quote
                </a>
                <a href="/#contact" className="btn btn-outline btn-lg">
                  <i className="fa-solid fa-phone" /> Talk to an Expert
                </a>
              </div>

              {/* DRGEM trust badge */}
              <div className={styles.trustBadge}>
                <i className="fa-solid fa-shield-check" style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                  Genuine DRGEM product · CE certified · Official SmartX warranty
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs: Features / Specs / Description */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={styles.tabs}>
            {[
              ...(product.features?.length ? [{ id: 'features', label: 'Key Features' }] : []),
              ...(product.specifications?.length ? [{ id: 'specs', label: 'Specifications' }] : []),
              ...(product.description ? [{ id: 'overview', label: 'Overview' }] : []),
            ].map(t => (
              <button
                key={t.id}
                className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'features' && product.features?.length > 0 && (
              <div className={styles.featuresGrid}>
                {product.features.map((f, i) => (
                  <motion.div
                    key={i}
                    className={styles.featureCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <div className={styles.featureCardIcon}><i className="fa-solid fa-circle-check" /></div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
                      {f.description && <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.description}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'specs' && product.specifications?.length > 0 && (
              <div className={styles.specsTable}>
                {product.specifications.map((s, i) => (
                  <div key={i} className={`${styles.specRow} ${i % 2 === 0 ? styles.even : ''}`}>
                    <div className={styles.specLabel}>{s.label}</div>
                    <div className={styles.specValue}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'overview' && product.description && (
              <div className={styles.overview}>
                {product.description.split('\n\n').map((p, i) => (
                  <p key={i} style={{ marginBottom: 'var(--space-md)', lineHeight: 1.9, color: 'var(--text-muted)' }}>{p}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 style={{ marginBottom: 'var(--space-xl)' }}>Related <span className="gradient-text">Products</span></h2>
            <div className={styles.relatedGrid}>
              {related.map(p => (
                <Link key={p._id} href={`/products/${p.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedImg}>
                    {p.image ? <img src={p.image} alt={p.name} /> : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)' }}>
                        <i className="fa-solid fa-image" style={{ fontSize: '2rem' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 'var(--space-md)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{p.tagline}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
