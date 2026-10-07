import Link from 'next/link';
import styles from './AboutSection.module.css';

const DEFAULT_BODY =
  'SmartX Technology Limited is a sister concern of DME Group, supplying medical imaging equipment and healthcare technology to hospitals, clinics and diagnostic centres across Bangladesh.\n\n' +
  'We bring together trusted international brands, professional installation, user training and responsive after-sales support — so every facility we work with can deliver accurate, dependable diagnostics.';

const DEFAULT_HIGHLIGHTS = [
  { icon: 'building',            title: 'Backed by DME Group',  description: 'Built on the experience, partnerships and service network of DME Group.' },
  { icon: 'screwdriver-wrench',  title: 'Expert Installation',  description: 'Certified engineers for professional setup, calibration and training.' },
  { icon: 'headset',             title: '24/7 Support',         description: 'Round-the-clock after-sales service and preventive maintenance.' },
  { icon: 'map-location-dot',    title: 'Nationwide Coverage',  description: 'Service reach across all 64 districts of Bangladesh.' },
];

// Highlights stored before the FA-icon switch hold emoji; fall back to a matching default icon
const FA_NAME = /^[a-z0-9-]+$/;

export default function AboutSection({ about = {} }) {
  const {
    heading = 'About SmartX Technology Limited',
    body = DEFAULT_BODY,
    image = '',
    mission = 'To make high-quality diagnostic imaging accessible to every healthcare facility in Bangladesh through reliable technology and exceptional service.',
    vision = 'To be the most trusted medical technology partner for healthcare providers in South Asia.',
    highlights = [],
  } = about;

  const paragraphs = (body || DEFAULT_BODY).split('\n\n').filter(Boolean);
  const intro = paragraphs[0];
  const story = paragraphs.length > 1 ? paragraphs.slice(1) : [];

  const cards = (highlights.length ? highlights : DEFAULT_HIGHLIGHTS).map((h, i) => ({
    ...h,
    icon: FA_NAME.test(h.icon || '') ? h.icon : (DEFAULT_HIGHLIGHTS[i]?.icon || 'circle-check'),
  }));

  return (
    <div id="about" className={styles.page}>
      {/* ── 1. Intro band ── */}
      <section className={styles.intro}>
        <div className={`container ${styles.introInner}`}>
          <span className={styles.groupPill}>
            <i className="fa-solid fa-sitemap" aria-hidden="true" />
            A sister concern of <strong>DME Group</strong>
          </span>
          <h1 className={styles.introTitle}>{heading}</h1>
          <p className={styles.introText}>{intro}</p>
          <div className={styles.introCtas}>
            <Link href="/products" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-layer-group" /> Explore products
            </Link>
            <Link href="/#contact" className="btn btn-outline btn-lg">
              <i className="fa-solid fa-headset" /> Contact us
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Story: image + text ── */}
      <section className={styles.block}>
        <div className={`container ${styles.storyGrid}`}>
          <div className={styles.storyMedia}>
            {image ? (
              <img src={image} alt={heading} className={styles.storyImg} loading="lazy" />
            ) : (
              <div className={styles.storyPlaceholder} aria-hidden="true">
                <i className="fa-solid fa-hospital" />
              </div>
            )}
          </div>

          <div className={styles.storyText}>
            <p className="section-label">Who we are</p>
            <h2 className={styles.blockTitle}>
              Healthcare technology, <span className="gradient-text">delivered with care</span>
            </h2>
            {(story.length ? story : [intro]).map((p, i) => (
              <p key={i} className={styles.paragraph}>{p}</p>
            ))}
            <ul className={styles.checks}>
              <li><i className="fa-solid fa-circle-check" /> Diagnostic imaging &amp; medical equipment</li>
              <li><i className="fa-solid fa-circle-check" /> Installation, training &amp; calibration</li>
              <li><i className="fa-solid fa-circle-check" /> Maintenance &amp; after-sales service</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. DME Group ── */}
      <section className={styles.block}>
        <div className="container">
          <div className={styles.group}>
            <div className={styles.groupIcon}><i className="fa-solid fa-building" /></div>
            <div className={styles.groupBody}>
              <p className={styles.groupLabel}>Part of DME Group</p>
              <h2 className={styles.groupTitle}>The strength of a group, the focus of a specialist</h2>
              <p className={styles.groupText}>
                As a sister concern of DME Group, SmartX shares the group&apos;s commitment to quality, its
                technical expertise and its long-standing relationships with healthcare providers — while
                focusing on bringing modern medical technology to facilities of every size.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Mission & Vision ── */}
      <section className={styles.block}>
        <div className={`container ${styles.mvGrid}`}>
          <article className={styles.mvCard}>
            <span className={styles.mvIcon}><i className="fa-solid fa-bullseye" /></span>
            <h3 className={styles.mvTitle}>Our mission</h3>
            <p className={styles.mvText}>{mission}</p>
          </article>
          <article className={styles.mvCard}>
            <span className={styles.mvIcon}><i className="fa-solid fa-eye" /></span>
            <h3 className={styles.mvTitle}>Our vision</h3>
            <p className={styles.mvText}>{vision}</p>
          </article>
        </div>
      </section>

      {/* ── 5. Why choose us ── */}
      <section className={styles.block}>
        <div className="container">
          <div className={styles.blockHead}>
            <p className="section-label">Why SmartX</p>
            <h2 className={styles.blockTitle}>Why healthcare providers <span className="gradient-text">choose us</span></h2>
          </div>
          <div className={styles.highlights}>
            {cards.map((h, i) => (
              <article key={i} className={styles.hlCard} style={{ animationDelay: `${i * 80}ms` }}>
                <span className={styles.hlIcon}><i className={`fa-solid fa-${h.icon}`} aria-hidden="true" /></span>
                <h3 className={styles.hlTitle}>{h.title}</h3>
                <p className={styles.hlDesc}>{h.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Closing CTA ── */}
      <section className={styles.block}>
        <div className="container">
          <div className={styles.cta}>
            <div>
              <h2 className={styles.ctaTitle}>Planning to upgrade your facility?</h2>
              <p className={styles.ctaText}>Talk to our team about the right equipment, installation and support plan.</p>
            </div>
            <Link href="/#contact" className={`btn btn-lg ${styles.ctaBtn}`}>
              Get in touch <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
