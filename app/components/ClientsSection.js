'use client';
import { useEffect, useState } from 'react';
import styles from './ClientsSection.module.css';
import { useInfiniteGrid } from './masnorypan';

export default function ClientsSection({ initialData = {} }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (!initialData?.clients?.length) {
      fetch('/api/partners')
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    }
  }, [initialData]);

  const normalizeLogos = (logos) => {
    if (!logos || !Array.isArray(logos)) return [];
    return logos.map(item => {
      let rawImage = '', rawLink = '';
      if (typeof item === 'string') {
        rawImage = item;
      } else {
        rawImage = item?.image || item?.compressed || item?.original || '';
        rawLink  = item?.link || '';
      }
      let formattedLink = rawLink.trim();
      if (formattedLink && !/^https?:\/\//i.test(formattedLink))
        formattedLink = `https://${formattedLink}`;
      return { image: rawImage, link: formattedLink };
    });
  };

  const clients = normalizeLogos(data?.clients || initialData?.clients || []);
  const { containerRef, tiles, isDragging, wasDragged, containerProps, isMobile } =
    useInfiniteGrid({ items: clients });

  if (clients.length === 0) return null;

  return (
    <section className={styles.clientsSection}>
      <div className={styles.inner}>
        <div className={styles.clientsHeader}>
          <h1>Trusted by over 400+ clients</h1>
          <p>
            "Our clients are our top priority, and we are committed to
            providing them with the highest level of service."
          </p>
        </div>

        {isMobile ? (
          <div className={styles.mobileGrid}>
            {clients.map((item, idx) => {
              const card = (
                <div className={styles.logoCard}>
                  <img src={item.image} alt="Client Logo" className={styles.logo} loading="lazy" />
                </div>
              );
              return item.link ? (
                <a
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.logoLinkWrapper}
                >
                  {card}
                </a>
              ) : (
                <div key={idx} className={styles.logoLinkWrapper}>
                  {card}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.viewportWrapper}>
            <div
              ref={containerRef}
              className={`${styles.gridViewport} ${isDragging ? styles.dragging : ''}`}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              {...containerProps}
            >
              {tiles.map(({ item, w, h, key, transform }) => {
                const src = item?.image;
                if (!src) return null;
                const card = (
                  <div className={styles.logoCard} style={{ width: w, height: h }}>
                    <img src={src} alt="Client Logo" className={styles.logo} draggable="false" />
                  </div>
                );
                const wrapStyle = { transform, width: w, height: h };
                return item.link ? (
                  <a
                    key={key}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.logoLinkWrapper}
                    style={wrapStyle}
                    title="Visit Client Website"
                    onClick={(e) => { if (wasDragged()) e.preventDefault(); }}
                  >
                    {card}
                  </a>
                ) : (
                  <div key={key} className={styles.logoLinkWrapper} style={wrapStyle}>
                    {card}
                  </div>
                );
              })}
            </div>
            <div className={styles.fadeLeft}  aria-hidden="true" />
            <div className={styles.fadeRight} aria-hidden="true" />
            <div className={styles.fadeTop}   aria-hidden="true" />
            <div className={styles.fadeBottom} aria-hidden="true" />
          </div>
        )}

        <h2 className={styles.heading}>Our Esteemed Clients</h2>
      </div>
    </section>
  );
}