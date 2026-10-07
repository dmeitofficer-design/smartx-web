import styles from './ProductsSection.module.css'; 
// Make sure this path points correctly to your CSS module file

export default function CategorySkeleton() {
  return (
    <main className="section" style={{ paddingTop: 'var(--space-2xl)' }}>
      <div className="container">
        {/* Fake Category Header Skeleton */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ width: '120px', height: '20px', background: 'var(--bg-muted)', opacity: 0.15, borderRadius: '4px', marginBottom: '1rem' }} />
          <div style={{ width: '300px', height: '40px', background: 'var(--bg-muted)', opacity: 0.15, borderRadius: '6px' }} />
        </div>

        {/* 3 Grid Skeleton Cards */}
        <div className={styles.grid}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
              <div className={styles.imgWrap}>
                <div className={styles.skeletonImg} />
                <div className={styles.skeletonBadge} />
                <div className={styles.skeletonCatTag} />
              </div>
              <div className={styles.body}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonTagline} />
                <div className={styles.skeletonFeatures}>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className={styles.skeletonFeature} />
                  ))}
                </div>
                <div className={styles.skeletonActions}>
                  <div className={styles.skeletonBtn} />
                  <div className={styles.skeletonBtn} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}