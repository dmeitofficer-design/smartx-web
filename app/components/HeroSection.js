'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HeroSection.module.css';

function PlaceholderHeroImage() {
  return (
    <div className={styles.placeholderWrap}>
      <div className={styles.placeholderImg}>
        <svg width="56" height="56" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="20" width="64" height="48" rx="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
          <circle cx="40" cy="44" r="14" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
          <path d="M26 44 L54 44 M40 30 L40 58" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
          <rect x="32" y="12" width="16" height="10" rx="3" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
        </svg>
        <span>Hero Images</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Add from Admin Panel</span>
      </div>
    </div>
  );
}

function FloatBadge({ badge }) {
  return (
    <div className={styles.floatBadge}>
      {badge.icon ? (
        <img height="30px" src={badge.icon} alt="" className={styles.floatBadgeIcon} />
      ) : (
        <i className="fa-solid fa-shield-check" style={{ color: 'var(--color-success)', fontSize: '1.1rem' }} />
      )}
    </div>
  );
}

function HeroSlider({ heroImages = [], globalBadges = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);
  const SWIPE_THRESHOLD = 60;

  // Extract images, badges, model, tagline, and link per slide
  const slides = heroImages.map(item => ({
    image: item?.image || (typeof item === 'string' ? item : ''),
    badgeIndices: item?.badgeIndices || [],
    model: item?.model || '',
    tagline: item?.tagline || '',
    link: item?.link || '',
  })).filter(s => s.image);

  const imageCount = slides.length;

  // Auto-play
  useEffect(() => {
    if (imageCount <= 1) return;
    const start = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % imageCount);
      }, 4000);
    };
    start();
    return () => clearInterval(autoPlayRef.current);
  }, [imageCount]);

  const pauseAutoPlay = () => clearInterval(autoPlayRef.current);

  const resumeAutoPlay = () => {
    if (imageCount <= 1) return;
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageCount);
    }, 4000);
  };

  const goToSlide = (index) => setCurrentIndex(index);

  // ── Mouse drag (desktop) ──
  const handleMouseDown = (e) => {
    e.preventDefault();
    pauseAutoPlay();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragDeltaX(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDragDeltaX(e.clientX - dragStartX);
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX;
    setIsDragging(false);
    setDragDeltaX(0);
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) {
        setCurrentIndex((prev) => (prev + 1) % imageCount);
      } else {
        setCurrentIndex((prev) => (prev - 1 + imageCount) % imageCount);
      }
    }
    resumeAutoPlay();
  };

  const handleMouseLeave = (e) => {
    if (isDragging) {
      handleMouseUp(e);
    } else {
      resumeAutoPlay();
    }
  };

  // ── Touch (mobile) ──
  const dragDeltaRef = useRef(0);

  const handleTouchStart = (e) => {
    pauseAutoPlay();
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragDeltaX(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    dragDeltaRef.current = e.touches[0].clientX - dragStartX;
    setDragDeltaX(dragDeltaRef.current);
  };

  const handleTouchEnd = () => {
    const delta = dragDeltaRef.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) {
        setCurrentIndex((prev) => (prev + 1) % imageCount);
      } else {
        setCurrentIndex((prev) => (prev - 1 + imageCount) % imageCount);
      }
    }
    dragDeltaRef.current = 0;
    setDragDeltaX(0);
    setIsDragging(false);
  };

  if (imageCount === 0) return null;

  const currentSlide = slides[currentIndex] || {};

  // Shift track by drag delta while dragging
  const sliderWidth = sliderRef.current?.offsetWidth || 1;
  const translateX =
    -(currentIndex * 100) +
    (isDragging ? (dragDeltaX / sliderWidth) * 100 : 0);

  return (
    <div
      className={`${styles.heroSlider} ${isDragging ? styles.dragging : ''}`}
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={pauseAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Images */}
      <div
        className={`${styles.sliderTrack} ${isDragging ? styles.noanim : ''}`}
        style={{ transform: `translateX(${translateX}%)` }}
      >
        {slides.map((s, index) => (
          <div key={index} className={styles.slide}>
            <img
              src={s.image}
              alt={s.model || `Medical equipment ${index + 1}`}
              className={styles.sliderImg}
              draggable={false}
            />
          </div>
        ))}
      </div>

{/* Dynamic Product Info Overlay (Model, Tagline & Link) */}
{(currentSlide.model || currentSlide.tagline || currentSlide.link) && (
  <div className={styles.productOverlay}>
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={styles.productDetailsBox}
      >
        {currentSlide.model && (
          <span className={styles.productModel}>{currentSlide.model}</span>
        )}
        {currentSlide.tagline && (
          <p className={styles.productTagline}>{currentSlide.tagline}</p>
        )}
        {currentSlide.link && (
          <Link href={currentSlide.link} className={styles.productLink}>
            Learn More <i className="fa-solid fa-arrow-right" />
          </Link>
        )}
      </motion.div>
    </AnimatePresence>
  </div>
)}

      {/* Floating badges — only for current slide */}
      {(() => {
        const slideBadges = (currentSlide.badgeIndices || [])
          .map(idx => globalBadges[idx])
          .filter(Boolean);

        return slideBadges.length > 0 && (
          <div className={styles.floatingBadgesContainer}>
            {slideBadges.map((b, i) => (
              <FloatBadge key={i} badge={b} />
            ))}
          </div>
        );
      })()}

      {/* Navigation dots */}
      {imageCount > 1 && (
        <div className={styles.sliderDots}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeroSection({ hero = {}, settings = {} }) {
  const {
    headline          = 'Inovation in  Healthcare',
    subheadline       = 'Exclusive distributor of DRGEM medical imaging solutions in Bangladesh.',
    ctaLabel          = 'Explore Products',
    ctaHref           = '#products',
    ctaSecondaryLabel = 'Request a Quote',
    ctaSecondaryHref  = '#contact',
    bgType            = 'gradient',
    bgColor           = '#3da2f5',
    bgImage           = '',
    heroImages        = [],
    badges            = [],
    ceBadgeLabel      = 'CE Certified',
    ceBadgeSub        = 'Medical Equipment',
    ceBadgeIcon       = '',
    badge             = 'Smartx technology limited — Bangladesh',
    stats             = [],
  } = hero;

  const resolvedBadges = badges.length > 0
    ? badges
    : (ceBadgeLabel ? [{ label: ceBadgeLabel, sub: ceBadgeSub, icon: ceBadgeIcon }] : []);

  const defaultStats = [
    { value: '20+',  label: 'Years Experience' },
    { value: '500+', label: 'Installations' },
    { value: '64',   label: 'Districts Served' },
    { value: '24/7', label: 'Support' },
  ];
  const displayStats = stats.length ? stats : defaultStats;

  const hasImages = (heroImages || []).some(item => item?.image || typeof item === 'string');

  return (
    <section id="hero" className={styles.section}>

      {/* ── Background ── */}
      <div
        className={styles.bg}
        style={bgType === 'color' ? { background: bgColor } : undefined}
      >
        {bgType === 'image' && bgImage && (
          <img src={bgImage} alt="" className={styles.bgImg} aria-hidden="true" />
        )}
        {bgType !== 'gradient' && <div className={styles.bgOverlay} />}
      </div>

      {/* CSS blobs for color mode */}
      {bgType === 'color' && (
        <>
          <div className={styles.blob1} />
          <div className={styles.blob2} />
          <div className={styles.blob3} />
        </>
      )}

      {/* ── FULL-BLEED slider — direct child of section, above container ── */}
      <div className={`${styles.imageSection} animate-hero-image`}>
        {hasImages ? (
          <HeroSlider heroImages={heroImages} globalBadges={resolvedBadges} />
        ) : (
          <PlaceholderHeroImage />
        )}
      </div>

      {/* ── Text content below the slider ── */}
      <div className={`container ${styles.content}`}>
        <div className={styles.textSection}>
          <div className={`${styles.badge} animate-fade-up`}>
            <span className={styles.badgeDot} />
            {badge}
          </div>

          <h1 className={`${styles.headline} animate-fade-up`} style={{ animationDelay: '0.1s' }}>
            {headline}
          </h1>

          <p className={`${styles.sub} animate-fade-up`} style={{ animationDelay: '0.2s' }}>
            {subheadline}
          </p>

          {/* Stats bar — hidden for now; uncomment to bring it back (data still editable in Admin → Hero)
          <div className={`${styles.stats} animate-fade-up`} style={{ animationDelay: '0.4s' }}>
            {displayStats.map((s, i) => (
              <div key={i} className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
          */}

          <div className={`${styles.ctas} animate-fade-up`} style={{ animationDelay: '0.3s' }}>
            <a href={ctaHref} className="btn btn-primary btn-lg">{ctaLabel}</a>
            <a href={ctaSecondaryHref} className="btn btn-outline btn-lg">{ctaSecondaryLabel}</a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`${styles.scrollHint} animate-bounce`}>
        <i className="fa-solid fa-chevron-down" />
      </div>
    </section>
  );
}