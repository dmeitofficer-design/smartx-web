//app(public)/products/[category]/[slug]/page.js
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) {
  const { category, slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug, published: true }).lean();
  if (!product) return {};

  return {
    title: `${product.name} - DRGEM Medical Imaging Bangladesh`,
    description: product.description?.substring(0, 160) || `Buy ${product.name} from official DRGEM distributor in Bangladesh.`,
    alternates: {
      canonical: `https://www.smartxbdlimited.com/products/${category}/${slug}`,
    },
  };
}
export default async function ProductDetailPage({ params }) {
  // Await params safely
  const resolvedParams = await params;
  const { category, slug } = resolvedParams || {};

  if (!slug) {
    return notFound();
  }

  await connectDB();

  // Fetch product (or support preview query if needed)
  const product = await Product.findOne({ slug, published: true }).lean();

  if (!product) {
    return notFound();
  }

  // Helper slugifier for matching category parameters
  const targetSlug = (cat) => cat?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || '';

  // Ensure category matches URL parameter
  if (category && targetSlug(product.category) !== category) {
    return notFound();
  }

  // Fetch related products
  const relatedProducts = await Product.find({
    category: product.category,
    slug: { $ne: slug },
    published: true
  })
    .limit(4)
    .lean();

  // Plain JSON serialization to avoid Next.js props error on MongoDB ObjectIds
  const sanitizedProduct = JSON.parse(JSON.stringify(product));
  const sanitizedRelated = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <ProductDetailClient 
      product={sanitizedProduct} 
      related={sanitizedRelated} 
    />
  );
}