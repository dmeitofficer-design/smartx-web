import { connectDB } from '@/lib/mongodb';
import Hero from '@/models/Hero';
import Product from '@/models/Product';
import SiteSettings from '@/models/SiteSettings';
import { Suspense } from 'react';

import HeroSection from './components/HeroSection';
import ProductsSection from './components/ProductsSection';
import ContactSection from './components/ContactSection';
import PartnersSection from './components/PartnersSection';
import ClientsSection from './components/ClientsSection';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

// A robust helper to serialize MongoDB objects
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

// Data fetching functions
async function getHeroData() {
  await connectDB();
  const [hero, settings] = await Promise.all([
    Hero.findOne().lean(),
    SiteSettings.findOne().lean(),
  ]);
  return {
    hero: stringifyAndClean(hero) || {},
    settings: stringifyAndClean(settings) || {},
  };
}

async function getProductsData() {
  await connectDB();
  const products = await Product.find({ published: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return stringifyAndClean(products) || [];
}

async function getPartnersData() {
  await connectDB();
  const Partners = (await import('@/models/Partners')).default;
  const partnersData = await Partners.findOne().lean();
  return stringifyAndClean(partnersData) || {};
}

// Wrappers for client components
async function ProductsSectionWrapper({ productsPromise }) {
  const products = await productsPromise;
  return <ProductsSection products={products} isLoading={false} />;
}

async function PartnersSectionWrapper({ partnersPromise }) {
  const data = await partnersPromise;
  return <PartnersSection initialData={data} />;
}

async function ClientsSectionWrapper({ partnersPromise }) {
  const data = await partnersPromise;
  return <ClientsSection initialData={data} />;
}

export default async function HomePage() {
  // Start fetching critical data immediately
  const { hero, settings } = await getHeroData();

  // Fire off remaining data fetches in parallel
  const productsPromise = getProductsData();
  const partnersPromise = getPartnersData();

  return (
    <main>
      {/* Hero is critical - rendered immediately */}
      <HeroSection hero={hero} settings={settings} />

      <Suspense fallback={<div className="py-16 text-center">Loading partners...</div>}>
        <PartnersSectionWrapper partnersPromise={partnersPromise} />
      </Suspense>

      {/* Products Section with Suspense */}
      <Suspense fallback={<ProductsSection products={[]} isLoading={true} />}>
        <ProductsSectionWrapper productsPromise={productsPromise} />
      </Suspense>

      <Suspense fallback={<div className="py-16 text-center">Loading clients...</div>}>
        <ClientsSectionWrapper partnersPromise={partnersPromise} />
      </Suspense>

      {/* Contact Section - uses already loaded settings */}
      <ContactSection settings={settings} />
    </main>
  );
}