//app(public)/products/[category]/[slug]/page.js
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { SITE_URL, absoluteUrl, metaDescription, pageMeta, slugifyCategory } from '@/lib/site';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }) {
  const { category, slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug, published: true }).lean();
  if (!product) return {};

  return pageMeta({
    title: `${product.name} - DRGEM Medical Imaging Bangladesh`,
    description: product.tagline || product.description || `Buy ${product.name} from the official DRGEM distributor in Bangladesh.`,
    path: `/products/${slugifyCategory(product.category) || category}/${slug}`,
    image: product.image,
    imageAlt: product.name,
  });
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

  const catSlug = targetSlug(product.category);
  const pageUrl = `${SITE_URL}/products/${catSlug}/${slug}`;
  const images = [product.image, ...(product.gallery || [])].map(absoluteUrl).filter(Boolean);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: metaDescription(product.description || product.tagline, undefined, 5000),
      url: pageUrl,
      category: product.category,
      brand: { '@type': 'Brand', name: 'DRGEM' },
      ...(images.length && { image: images }),
      ...(product.specifications?.length && {
        additionalProperty: product.specifications
          .filter((sp) => sp?.label && sp?.value)
          .map((sp) => ({ '@type': 'PropertyValue', name: sp.label, value: sp.value })),
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
        { '@type': 'ListItem', position: 3, name: product.category, item: `${SITE_URL}/products/${catSlug}` },
        { '@type': 'ListItem', position: 4, name: product.name, item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductDetailClient 
        product={sanitizedProduct} 
        related={sanitizedRelated} 
      />
    </>
  );
}