import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductsClientView from './ProductsClientView';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }) {
  const { category } = await params;
  await connectDB();

  const allProducts = await Product.find({ published: true }).lean();

  // 1. Filter products by transforming DB category string to URL-safe slug match
  const filteredProducts = allProducts.filter(p => {
    const safeCatSlug = p.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return safeCatSlug === category;
  });

  // 🟢 2. Sort the products array directly in JavaScript
  // We check for `orderIndex` and fallback to `order` in case your DB uses that name instead.
  filteredProducts.sort((a, b) => {
    const orderA = a.orderIndex ?? a.order ?? 0;
    const orderB = b.orderIndex ?? b.order ?? 0;
    return orderA - orderB;
  });

  if (filteredProducts.length === 0) {
    return notFound();
  }

  const displayCategoryName = filteredProducts[0].category;
  const sanitizedProducts = JSON.parse(JSON.stringify(filteredProducts));

  return (
    <main className="section" >
      <div className="container">
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          
          {/* 🟢 Converted from raw Link text layout to an elegant interactive Ghost Button layout */}
        

          <h1 style={{ fontSize: 'var(--font-size-4xl)', marginTop: '0.25rem' }}>
            {displayCategoryName} <span className="gradient-text">Solutions</span>
          </h1>
        </div>

        <ProductsClientView products={sanitizedProducts} categorySlug={category} />
          <Link 
            href="/#products" 
            className="btn btn-ghost back-to-categories"
      
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.85rem' }} /> Back to Categories
          </Link>
      </div>
    </main>
  );
}