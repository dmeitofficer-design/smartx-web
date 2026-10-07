import Link from 'next/link';
import styles from './Footer.module.css';

const slugify = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
const MAX_FOOTER_CATEGORIES = 6;

export default function Footer({ settings = {}, products = [] }) {
  const year = new Date().getFullYear();
  const name = settings.siteName || 'SmartX Technology Limited';
  const tagline = settings.siteTagline || 'Medical imaging equipment, installation and support in Bangladesh.';
  const email = settings.email || 'info@smartxlimited.com';
  const phone = settings.phone || '+880-XXX-XXXXX';
  const address = settings.address || 'Dhaka, Bangladesh';
  const logoImage = settings.logoImagef || '';

  const categories = [...new Set(products.map(p => p?.category).filter(Boolean))];

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo} aria-label={`${name} home`}>
            {logoImage ? (
              <img src={logoImage} alt={name} className={styles.logoImg} />
            ) : (
              <span className={styles.logoText}>{name}</span>
            )}
          </Link>
          <p className={styles.tagline}>{tagline}</p>
          <div className={styles.socials}>
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>}
            {settings.linkedin && <a href={settings.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" /></a>}
            {settings.youtube  && <a href={settings.youtube}  target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>}
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.col}>
          <h4>Quick Links</h4>
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/products">Products</Link>
          <Link href="/team">Our Team</Link>
          <Link href="/#contact">Contact</Link>
        </div>

        {/* Products */}
        <div className={styles.col}>
          <h4>Products</h4>
          {categories.slice(0, MAX_FOOTER_CATEGORIES).map(cat => (
            <Link key={cat} href={`/products/${slugify(cat)}`}>{cat}</Link>
          ))}
          <Link href="/products">All Products</Link>
        </div>

        {/* Contact */}
        <div className={`${styles.col} ${styles.contactCol}`}>
          <h4>Contact</h4>
          <a href={`mailto:${email}`}><i className="fa-solid fa-envelope" /> <span>{email}</span></a>
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}><i className="fa-solid fa-phone" /> <span>{phone}</span></a>
          <span className={styles.address}><i className="fa-solid fa-location-dot" /> <span>{address}</span></span>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} {name}. All rights reserved.</p>
        <p>A sister concern of <strong>DME Group</strong></p>
      </div>
    </footer>
  );
}
