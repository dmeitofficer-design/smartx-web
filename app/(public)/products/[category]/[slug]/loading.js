// app/products/[slug]/loading.js
'use client'; // Required to use useEffect in the App Router

import { useEffect } from 'react';
import styles from './product.module.css';

export default function Loading() {
  // Reset scroll position to top instantly when the loading skeleton mounts
  useEffect(() => {
  window.scrollTo({
  top: 0,
  left: 0,
  behavior: 'instant'
});
  }, []);

  return (
    <main style={{ paddingTop: 'var(--nav-height)', minHeight: 'calc(100vh - var(--nav-height))'}}>
      {/* Breadcrumb Skeleton */}
      <div 
        style={{ 
          background: 'rgba(var(--color-primary-rgb),0.04)', 
          borderBottom: '1px solid var(--glass-border)', 
          padding: '0.75rem 0' 
        }}
      >
        <div className="container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-sm)', 
          fontSize: 'var(--font-size-sm)',
          flexWrap: 'wrap' 
        }}>
          <div className={styles.skeletonText} style={{ width: '60px', height: '18px', background: 'var(--text-muted)', opacity: 0.2 }} />
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem', opacity: 0.3 }} />
          <div className={styles.skeletonText} style={{ width: '80px', height: '18px', background: 'var(--text-muted)', opacity: 0.2 }} />
          <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem', opacity: 0.3 }} />
          <div className={styles.skeletonText} style={{ width: '180px', height: '18px', background: 'var(--text-muted)', opacity: 0.2 }} />
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <section className={`section ${styles.hero}`}>
        <div className="container">
          <div className={styles.heroGrid}>
            {/* Image Column */}
            <div className={styles.imgCol}>
              <div className={styles.imgWrap}>
                <div 
                  className={styles.skeletonImage} 
                  style={{ 
                    aspectRatio: '16/11', 
                    borderRadius: '12px'
                  }} 
                />
              </div>
            </div>

            {/* Content Column */}
            <div className={styles.contentCol}>
              <div className={styles.skeletonText} style={{ width: '120px', height: '20px', marginBottom: 'var(--space-md)', background: 'var(--text-muted)', opacity: 0.2 }} />
              
              <div className={styles.skeletonHeading} style={{ height: '52px', marginBottom: 'var(--space-md)', background: 'var(--text-muted)', opacity: 0.2 }} />
              
              <div className={styles.skeletonText} style={{ height: '80px', marginBottom: 'var(--space-xl)', background: 'var(--text-muted)', opacity: 0.2 }} />

              <div style={{ marginBottom: 'var(--space-xl)' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.featureItem} style={{ 
                    marginBottom: '12px', 
                    display: 'flex', 
                    gap: '10px' 
                  }}>
                    <div className={styles.skeletonText} style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: 'var(--text-muted)', 
                      opacity: 0.2,
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div className={styles.skeletonText} style={{ width: '65%', height: '20px', marginBottom: '6px', background: 'var(--text-muted)', opacity: 0.2 }} />
                      <div className={styles.skeletonText} style={{ width: '85%', height: '16px', background: 'var(--text-muted)', opacity: 0.15 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
