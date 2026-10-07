import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { connectDB } from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import Product from '@/models/Product';
import { unstable_cache } from 'next/cache';
import NavbarWrapper from './components/NavbarWrapper';
import FooterWrapper from './components/FooterWrapper';
import localFont from 'next/font/local';

const customAccentFont = localFont({
  src: '../public/fonts/Kangge.ttf',
  variable: '--font-accent',
});
const customAccentFont2 = localFont({
  src: '../public/fonts/GebukRegular.ttf',
  variable: '--font-accent2',
});
const customAccentFont3 = localFont({
  src: '../public/fonts/Megiko.otf',
  variable: '--font-accent3',
});
const customAccentFont4 = localFont({
  src: '../public/fonts/Stark.otf',
  variable: '--font-accent4',
});

// Revalidate layout settings every 30 seconds (ISR)
export const revalidate = 30;

const stringifyAndClean = (data) => {
  if (!data) return null;
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (value && typeof value === 'object' && value.buffer !== undefined) {
      return undefined;
    }
    if (key === '_id' && value) {
      return typeof value === 'object' ? value.toString() : value;
    }
    return value;
  }));
};

const getSettings = unstable_cache(
  async () => {
    try {
      await connectDB();
      let s = await SiteSettings.findOne().lean();
      if (!s) {
        const created = await SiteSettings.create({});
        s = created.toObject ? created.toObject() : created;
      }
      return stringifyAndClean(s) || {};
    } catch (error) {
      console.error("Layout data cache fetch failure:", error);
      return {};
    }
  },
  ['site-settings-global'],
  { revalidate: 30, tags: ['settings'] }
);

// Lightweight product list for the navbar mega-menu and footer links
const getNavProducts = unstable_cache(
  async () => {
    try {
      await connectDB();
      const list = await Product.find({ published: true })
        .select('name slug category image tagline order')
        .sort({ order: 1, createdAt: -1 })
        .lean();
      return list.map(p => {
        const img = typeof p.image === 'string' ? p.image : '';
        const isUrl = /^(https?:)?///.test(img) || img.startsWith('/');
        return {
          id: String(p._id),
          name: p.name,
          slug: p.slug,
          category: p.category || '',
          tagline: p.tagline || '',
          // Keep base64 blobs out of the HTML — serve them through the image route
          image: !img ? '' : isUrl ? img : `/api/products/${p._id}/image`,
        };
      });
    } catch (error) {
      console.error('Nav products fetch failure:', error);
      return [];
    }
  },
  ['nav-products'],
  { revalidate: 60, tags: ['products'] }
);

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#090d16',
  };
}

export async function generateMetadata() {
  const s = await getSettings();
  const siteName = s.siteName || 'SmartX Technology Limited';
  const description = s.siteTagline || 'Exclusive distributor of DRGEM medical imaging equipment in Bangladesh.';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smartxbdlimited.com';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: description,
    
    // Automatically generates self-referencing canonical tag for EVERY page
    alternates: {
      canonical: './',
    },

    // Ensures icon tags are explicitly declared in HTML head
    icons: {
      icon: '/icon.png',
      shortcut: '/icon.png',
      apple: '/icon.png',
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    openGraph: {
      title: siteName,
      description: description,
      url: siteUrl,
      siteName: siteName,
      locale: 'en_US',
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: description,
    },
  };
}

function hexToRgb(hex = '#0ea5e9') {
  const h = hex.replace('#', '');
  if (h.length !== 6) return '14, 165, 233';
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default async function RootLayout({ children }) {
  const [s, navProducts] = await Promise.all([getSettings(), getNavProducts()]);

  const cssOverride = `
    :root {
      --color-primary: ${s.colorPrimary || '#0ea5e9'};
      --color-primary-rgb: ${hexToRgb(s.colorPrimary)};
      --color-secondary: ${s.colorSecondary || '#6366f1'};
      --color-accent: ${s.colorAccent || '#06b6d4'};
      --font-heading: ${s.fontHeading || "var(--font-accent),  'Inter', sans-serif"};
      --font-body: ${s.fontBody || "'Inter', sans-serif"};
    }
  `;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: s.siteName || 'SmartX Technology Limited',
    url: 'https://smartxbdlimited.com',
    logo: s.logoImage || 'https://smartxbdlimited.com/icon.png',
    description: s.siteTagline || 'Exclusive distributor of DRGEM medical imaging equipment in Bangladesh.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'House# 15/L-8, Road# 4, Block# F, Banani',
      addressLocality: 'Dhaka',
      postalCode: '1213',
      addressCountry: 'BD',
    },
    telephone: '+880-1321222170',
  };

  return (
    <html lang="en" className={`${customAccentFont.variable} ${customAccentFont2.variable} ${customAccentFont3.variable} ${customAccentFont4.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: cssOverride }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NavbarWrapper settings={s} products={navProducts} />
        {children}
        <FooterWrapper settings={s} products={navProducts} />
      </body>
    </html>
  );
}