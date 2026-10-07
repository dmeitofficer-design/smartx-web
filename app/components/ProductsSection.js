'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProductsSection.module.css';
import Link from 'next/link';

const targetSlug = (cat) => cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

function PlaceholderProductImage() {
  return (
    <div className={styles.placeholder}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="12" width="40" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <circle cx="24" cy="27" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M15 27 L33 27 M24 18 L24 36" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        <rect x="19" y="6" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
      </svg>
      <span>Category Preview</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={`${styles.card} ${styles.skeletonCard}`}>
      <div className={styles.imgWrap}>
        <div className={styles.skeletonImg} />
        <div className={styles.skeletonBadge} />
        <div className={styles.skeletonCatTag} />
      </div>
      <div className={styles.body}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonTagline} />
        <div className={styles.skeletonFeatures}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonFeature} />
          ))}
        </div>
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonBtn} />
          <div className={styles.skeletonBtn} />
        </div>
      </div>
    </div>
  );
}

function CategoryPreviewCard({ category, representativeProduct, index, onExplore }) {
  const catSlug = targetSlug(category);

  return (
    <div 
      className={`${styles.card} animate-fade-up`} 
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onExplore(catSlug)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onExplore(catSlug); }}
    >
      <div className={styles.imgWrap}>
        {representativeProduct?.image ? (
          <img src={representativeProduct.image} alt={category} className={styles.img} />
        ) : (
          <PlaceholderProductImage />
        )}
        <div className={styles.catTag}></div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{category}</h3>
        <p className={styles.tagline}>
          Explore our full line of professional systems and clinical imaging modules for {category.toLowerCase()}.
        </p>
        <div className={styles.actions}>
          <button className={styles.exploreBtn} type="button">
            Explore category
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsSection({ products = [], isLoading = false }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const dynamicCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const categoryBlocks = dynamicCategories.map(cat => {
    const repProduct = products.find(p => p.category === cat);
    return { name: cat, product: repProduct };
  });

const handleExploreCategory = (catSlug) => {
  // 1. Immediately scroll to top
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  
  // 2. Drive navigation directly. Next.js instantly swaps views 
  // and displays your category folder loading.js layout shell!
  router.push(`/products/${catSlug}`);
};

  return (
    <section id="products" className="section">
          
      <div className="container">
         <Link 
            href="/" 
            className="btn btn-ghost back-to-categories"
      
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.85rem' }} /> Home
          </Link>
        {/* Header */}
        <div className={`${styles.header} animate-fade-up`} style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <p className="section-label">Product Categories</p>
          <h2 style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-md)' }}>
            Our <span className="gradient-text">Medical Imaging</span> Solutions
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
            Comprehensive diagnostic imaging equipment designed for clinical excellence. Select a division below to browse specialized equipment catalogs.
          </p>
        </div>

        {/* Categories Preview Grid */}
        {isLoading || isNavigating ? (
          <div className={styles.grid}>
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : categoryBlocks.length === 0 ? (
          <div className={styles.empty}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '2rem', opacity: 0.3 }} />
            <p>No product segments configured yet.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {categoryBlocks.map((block, i) => (
              <CategoryPreviewCard 
                key={block.name} 
                category={block.name} 
                representativeProduct={block.product} 
                index={i} 
                onExplore={handleExploreCategory}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}