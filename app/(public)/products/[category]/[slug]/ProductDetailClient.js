'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './product.module.css';
import QuoteModal from '@/app/components/QuoteModal';
import ExpertModal from '@/app/components/ExpertModal';

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
    </div>
  );
}

export default function ProductDetailClient({ product, related = [] }) {
  if (!product) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loader" />
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('features');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [expertOpen, setExpertOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(product?.image || '');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const allImages = [product?.image, ...(product?.gallery || [])].filter(Boolean);

  useEffect(() => {
    if (product?.image) {
      setActiveImage(product.image);
    }
  }, [product]);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    scrollToTop();
    const timeout = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timeout);
  }, [product?._id || product?.id]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  const targetSlug = (cat) => cat?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'general';

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;

      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, allImages.length]);

  return (
    <main>
      <QuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} defaultProduct={product?.name} />
      <ExpertModal isOpen={expertOpen} onClose={() => setExpertOpen(false)} />

      {/* 
      <div className={styles.breadcrumbs}>
        <div className="r">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', paddingLeft: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <Link href="/" style={{ color: 'var(--color-primary)' }}>Home</Link>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
            <Link href="/products" style={{ color: 'var(--color-primary)' }}>Products</Link>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
            <Link href={`/products/${targetSlug(product?.category)}`} style={{ color: 'var(--color-primary)' }}>
              {product?.category}
            </Link>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
            <span style={{ color: 'var(--text)' }}>{product?.name}</span>
          </div>
        </div>
      </div>
      Standardized Breadcrumb Section */}

      {/* Hero Specifications Details Section */}
      <section className={`section ${styles.hero}`}>
        <div className="container">
          <div className={styles.heroGrid}>
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className={styles.imgCol}>
              <div 
                className={styles.imgWrap} 
                style={{ cursor: 'zoom-in' }} 
                onClick={() => setLightboxIndex(allImages.indexOf(activeImage))}
              >
                {activeImage ? (
                  <motion.img 
                    key={activeImage}
                    src={activeImage} 
                    alt={product?.name} 
                    className={styles.heroImg} 
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                ) : (
                  <PlaceholderProductImage />
                )}
                {product?.badge && <span className={`badge badge-new ${styles.badge}`}>{product.badge}</span>}
              </div>

              {allImages.length > 1 && (
                <div className={styles.galleryRow}>
                  {allImages.map((img, i) => (
                    <button 
                      key={i} 
                      className={`${styles.thumbWrap} ${activeImage === img ? styles.activeThumb : ''}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img} alt={`Product view ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <div className="section-label" style={{ marginBottom: 'var(--space-md)' }}>{product?.category}</div>
              <h1 style={{ marginBottom: 'var(--space-md)' }}>{product?.name}</h1>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 'var(--space-xl)' }}>
                {product?.tagline || product?.description?.slice(0, 200)}
              </p>

              <div className={styles.ctas} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', borderColor: 'var(--text-muted)' }}>
                <button className="btn btn-primary btn-lg btn-cta" onClick={() => setQuoteOpen(true)} >
                  <i className="fa-solid fa-paper-plane" /> Request a Quote
                </button>

                <button className="btn btn-ghost btn-lg btn-cta" onClick={() => setExpertOpen(true)}>
                  <i className="fa-solid fa-headset" /> Talk to an Expert
                </button>

                {product?.catalog && (
                  <a 
                    href={product.catalog} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-outline btn-lg btn-cta"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }} /> View Catalog
                  </a>
                )}

                {product?.link && (
                  <a 
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-outline btn-lg btn-cta"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" /> More Specifications
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs Layout */}
      <section className="section" style={{ paddingTop: 0, minHeight: '60vh' }}>
        <div className="container">
          <div className={styles.tabs}>
            {[
              ...(product?.features?.length ? [{ id: 'features', label: 'Key Features' }] : []),
              ...(product?.specifications?.length ? [{ id: 'specs', label: 'Specifications' }] : []),
              ...(product?.description ? [{ id: 'overview', label: 'Overview' }] : []),
            ].map(t => (
              <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'features' && product?.features?.length > 0 && (
              <div className={styles.featuresGrid}>
                {product.features.map((f, i) => (
                  <motion.div key={i} className={styles.featureCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <div className={styles.featureCardIcon}><i className="fa-solid fa-circle-check" /></div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
                      {f.description && <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.description}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'specs' && product?.specifications?.length > 0 && (
              <div className={styles.specsTable}>
                {product.specifications.map((s, i) => (
                  <div key={i} className={`${styles.specRow} ${i % 2 === 0 ? styles.even : ''}`}>
                    <div className={styles.specLabel}>{s.label}</div>
                    <div className={styles.specValue}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'overview' && product?.description && (
              <div className={styles.overview}>
                {product.description.split('\n\n').map((p, i) => (
                  <p key={i} style={{ marginBottom: 'var(--space-md)', lineHeight: 1.9, color: 'var(--text-muted)' }}>{p}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related && related.length > 0 && (
        <section className="section" style={{ paddingTop: 0, minHeight: '40vh' }}>
          <div className="container">
            <h2 style={{ marginBottom: 'var(--space-xl)' }}>Related <span className="gradient-text">Products</span></h2>
            <div className={styles.relatedGrid}>
              {related.map(p => (
                <Link key={p._id} href={`/products/${targetSlug(p.category)}/${p.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedImg}>
                    {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : (
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            className={styles.lightboxOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button className={styles.lightboxClose} onClick={() => setLightboxIndex(null)}>
              <i className="fa-solid fa-xmark" />
            </button>

            <button className={styles.lightboxNavPrev} onClick={handlePrevImage}>
              <i className="fa-solid fa-chevron-left" />
            </button>

            <motion.div 
              className={styles.lightboxContent}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={allImages[lightboxIndex]} alt={`${product?.name} view details`} className={styles.lightboxImage} />
              
              <div className={styles.lightboxCounter}>
                {lightboxIndex + 1} / {allImages.length}
              </div>
            </motion.div>

            <button className={styles.lightboxNavNext} onClick={handleNextImage}>
              <i className="fa-solid fa-chevron-right" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}