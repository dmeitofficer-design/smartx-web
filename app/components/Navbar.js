'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const slugify = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const LINKS = [
  { label: 'Home',     href: '/',         icon: 'fa-house' },
  { label: 'About',    href: '/about',    icon: 'fa-building' },
  { label: 'Products', href: '/products', icon: 'fa-layer-group', mega: true },
  { label: 'Team',     href: '/team',     icon: 'fa-user-group' },
  { label: 'Contact',  href: '/#contact', icon: 'fa-headset' },
];

const MAX_PREVIEW_ITEMS = 6;

export default function Navbar({ settings = {}, products = [] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState('');
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [activeProd, setActiveProd] = useState(0);
  const closeTimer = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Track the URL hash so "Contact" (/#contact) can be highlighted
  useEffect(() => {
    const fn = () => setHash(window.location.hash);
    fn();
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, [pathname]);

  // Close the mega menu whenever the route changes
  useEffect(() => { setMegaOpen(false); }, [pathname]);

  // Group products by category, preserving admin order
  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (!p?.category) continue;
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category).push(p);
    }
    return [...map.entries()].map(([name, items]) => ({ name, slug: slugify(name), items }));
  }, [products]);

  const isActive = (l) => {
    if (l.href === '/#contact') return pathname === '/' && hash === '#contact';
    if (l.href === '/') return pathname === '/' && hash !== '#contact';
    return pathname === l.href || pathname.startsWith(`${l.href}/`);
  };

  const onLinkClick = (l) => setHash(l.href.includes('#') ? `#${l.href.split('#')[1]}` : '');

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMegaSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const selectCategory = (i) => {
    setActiveCat(i);
    setActiveProd(0);
  };

  const logoText  = settings.logoText  || 'SmartX';
  const logoImage = settings.logoImage || '';
  const textImage = settings.textImage || '';
  const ctaLabel  = settings.ctaLabel  || 'Request a Quote';
  const ctaHref   = '/#contact';

  const cat = categories[activeCat] || categories[0];
  const catItems = cat ? cat.items.slice(0, MAX_PREVIEW_ITEMS) : [];
  const previewProduct = catItems[activeProd] || catItems[0];

  return (
    <>
      <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label={`${logoText} home`} onClick={() => setHash('')}>
            {logoImage ? (
              <img src={logoImage} alt={logoText} className={styles.logoImg} />
            ) : (
              <span className={styles.brandText}>{logoText}</span>
            )}
            {textImage && <img src={textImage} alt="" className={styles.textImg} />}
          </Link>

          <nav className={styles.desktopLinks} aria-label="Main">
            {LINKS.map(l => {
              if (l.mega) {
                return (
                  <div
                    key={l.href}
                    className={styles.megaTrigger}
                    onMouseEnter={openMega}
                    onMouseLeave={closeMegaSoon}
                    onFocus={openMega}
                    onBlur={closeMegaSoon}
                    onKeyDown={(e) => { if (e.key === 'Escape') setMegaOpen(false); }}
                  >
                    <Link
                      href={l.href}
                      className={`${styles.navLink} ${isActive(l) ? styles.navLinkActive : ''}`}
                      aria-expanded={megaOpen}
                      aria-haspopup="true"
                    >
                      {l.label}
                      <i className={`fa-solid fa-chevron-down ${styles.chevron} ${megaOpen ? styles.chevronOpen : ''}`} />
                    </Link>

                    {megaOpen && (
                      <div className={styles.mega} role="menu">
                        {categories.length === 0 ? (
                          <div className={styles.megaEmpty}>
                            <i className="fa-solid fa-box-open" />
                            <p>Products are coming soon.</p>
                            <Link href="/products" className="btn btn-primary btn-sm">Browse products</Link>
                          </div>
                        ) : (
                          <>
                            {/* Column 1 — categories */}
                            <div className={styles.megaCats}>
                              <div className={styles.megaHeading}>Categories</div>
                              {categories.map((c, i) => (
                                <Link
                                  key={c.slug}
                                  href={`/products/${c.slug}`}
                                  className={`${styles.megaCat} ${i === activeCat ? styles.megaCatActive : ''}`}
                                  onMouseEnter={() => selectCategory(i)}
                                  onFocus={() => selectCategory(i)}
                                >
                                  <span>{c.name}</span>
                                  <span className={styles.megaCount}>{c.items.length}</span>
                                </Link>
                              ))}
                              <Link href="/products" className={styles.megaAll}>
                                All categories <i className="fa-solid fa-arrow-right" />
                              </Link>
                            </div>

                            {/* Column 2 — products in hovered category */}
                            <div className={styles.megaProducts}>
                              <div className={styles.megaHeading}>{cat?.name}</div>
                              {catItems.map((p, i) => (
                                <Link
                                  key={p.id}
                                  href={`/products/${cat.slug}/${p.slug}`}
                                  className={`${styles.megaProduct} ${i === activeProd ? styles.megaProductActive : ''}`}
                                  onMouseEnter={() => setActiveProd(i)}
                                  onFocus={() => setActiveProd(i)}
                                >
                                  <span className={styles.megaThumb}>
                                    {p.image ? <img src={p.image} alt="" loading="lazy" /> : <i className="fa-solid fa-image" />}
                                  </span>
                                  <span className={styles.megaProductName}>{p.name}</span>
                                </Link>
                              ))}
                              {cat && cat.items.length > MAX_PREVIEW_ITEMS && (
                                <Link href={`/products/${cat.slug}`} className={styles.megaAll}>
                                  View all {cat.items.length} <i className="fa-solid fa-arrow-right" />
                                </Link>
                              )}
                            </div>

                            {/* Column 3 — large preview of hovered product */}
                            {previewProduct && (
                              <Link
                                href={`/products/${cat.slug}/${previewProduct.slug}`}
                                className={styles.megaPreview}
                                tabIndex={-1}
                              >
                                <div className={styles.megaPreviewImg}>
                                  {previewProduct.image
                                    ? <img key={previewProduct.id} src={previewProduct.image} alt={previewProduct.name} />
                                    : <i className="fa-solid fa-image" />}
                                </div>
                                <div className={styles.megaPreviewBody}>
                                  <span className={styles.megaPreviewCat}>{cat.name}</span>
                                  <strong>{previewProduct.name}</strong>
                                  {previewProduct.tagline && <p>{previewProduct.tagline}</p>}
                                  <span className={styles.megaPreviewCta}>
                                    View details <i className="fa-solid fa-arrow-right" />
                                  </span>
                                </div>
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`${styles.navLink} ${isActive(l) ? styles.navLinkActive : ''}`}
                  onClick={() => onLinkClick(l)}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link href={ctaHref} className={`btn btn-primary btn-sm ${styles.ctaBtn}`} onClick={() => setHash('#contact')}>
              {ctaLabel}
            </Link>
          </nav>

          {/* Mobile: compact quote button on the right of the header */}
          <Link href={ctaHref} className={styles.mobileCta} aria-label={ctaLabel} onClick={() => setHash('#contact')}>
            <i className="fa-solid fa-file-signature" />
            <span>Quote</span>
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className={styles.bottomNav} aria-label="Mobile">
        {LINKS.map(l => {
          const active = isActive(l);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.bottomTab} ${active ? styles.active : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onLinkClick(l)}
            >
              <span className={styles.tabIcon}>
                <i className={`fa-solid ${l.icon}`} />
              </span>
              <span className={styles.tabLabel}>{l.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
