// Single source for the public site URL so canonicals, sitemap, robots and
// structured data never disagree (www vs non-www splits ranking signals).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://smartxlimited.com').replace(/\/+$/, '');

export const SITE_NAME = 'SmartX Technology Limited';
export const DEFAULT_DESCRIPTION = 'Exclusive distributor of DRGEM medical imaging equipment in Bangladesh.';

// Must match the [category] route segment.
export const slugifyCategory = (category) =>
  (category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// Images may be stored as base64 data URIs; only real URLs belong in meta tags / JSON-LD.
export function absoluteUrl(src) {
  if (!src || typeof src !== 'string') return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return `${SITE_URL}${src}`;
  return undefined;
}

// Plain-text, length-capped description for <meta name="description">.
export function metaDescription(text, fallback = DEFAULT_DESCRIPTION, max = 160) {
  const clean = (text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

// Full per-page metadata. Next merges metadata shallowly, so a page that sets
// openGraph/twitter must set every field it needs, not just `url`.
export function pageMeta({ title, description, path, image, imageAlt }) {
  const desc = metaDescription(description);
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const img = absoluteUrl(image);
  return {
    ...(title && { title }),
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description: desc,
      url: path,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
      ...(img && { images: [{ url: img, alt: imageAlt || title || SITE_NAME }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      ...(img && { images: [img] }),
    },
  };
}
