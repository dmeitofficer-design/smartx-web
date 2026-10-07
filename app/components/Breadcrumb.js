// path: app/components/Breadcrumb.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Breadcrumb.module.css';

// Override auto-generated labels here (segment -> display label)
const LABELS = {
  smartx: 'SmartX',
  cms: 'CMS',
  // add more segment overrides as needed
};

function toLabel(segment) {
  if (LABELS[segment]) return LABELS[segment];
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumb({ homeLabel = 'Home', hideOnHome = true }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (hideOnHome && segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    return { href, label: toLabel(seg) };
  });

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/">{homeLabel}</Link>
        </li>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.href} className={styles.item}>
              <span className={styles.separator}> <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }} /> </span>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href}>{crumb.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}