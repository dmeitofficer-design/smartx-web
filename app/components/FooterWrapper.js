'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper({ settings, products }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return <Footer settings={settings} products={products} />;
}
