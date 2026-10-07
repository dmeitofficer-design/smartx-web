'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import styles from './categoryProducts.module.css'; 
import QuoteModal from './[slug]/QuoteModal'; 

export default function ProductsClientView({ products = [], categorySlug, categoryName }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedProdName, setSelectedProdName] = useState('');
  const router = useRouter();

  // Fallback to formatted slug if categoryName isn't provided
  const displayCategory = categoryName || (categorySlug ? categorySlug.replace(/-/g, ' ') : 'Category');

  return (
    <>
      {/* Dynamic Breadcrumb Section matching ProductDetailClient structure 
      <div className={styles.breadcrumbs}>
        <div className="r">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', paddingLeft: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <Link href="/" style={{ color: 'var(--color-primary)' }}>Home</Link>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} />
            <span style={{ color: 'var(--text-muted)' }}>{displayCategory}</span>
          </div>
        </div>
      </div>
      */}
      <div className={styles.grid}>
        {products.map((product, index) => (
          <div 
            key={product._id}
            className={`${styles.card} animate-fade-up`} 
            style={{ animationDelay: `${index * 80}ms` }}
            onClick={(e) => {
              if (e.target.closest('.qoutebtn') || e.target.closest('.modal-container-wrapper')) return;
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              router.push(`/products/${categorySlug}/${product.slug}`);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push(`/products/${categorySlug}/${product.slug}`);
            }}
          >
            <div className={styles.imgWrap}>
              {product.image ? (
                <img src={product.image} alt={product.name} className={styles.img} loading="lazy" />
              ) : (
                <div className={styles.placeholder}><span>Product Image</span></div>
              )}
              {product.badge && <span className={`badge badge-new ${styles.badge}`}>{product.badge}</span>}
            </div>

            <div className={styles.body}>
              <h3 className={styles.name}>{product.name}</h3>
              
              <div className={styles.actions}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm qoutebtn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProdName(product.name);
                    setQuoteOpen(true);
                  }}
                >
                  <i className="fa-solid fa-file-lines" /> <span className={styles.quoteLong}>Request a </span>Quote
                </button>
                
                <Link 
                  href={`/products/${categorySlug}/${product.slug}`} 
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quoteOpen && (
        <div className="modal-container-wrapper" onClick={(e) => e.stopPropagation()}>
          <QuoteModal 
            isOpen={quoteOpen} 
            onClose={() => setQuoteOpen(false)} 
            defaultProduct={selectedProdName}
          />
        </div>
      )}
    </>
  );
}