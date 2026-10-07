import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

// Revalidate sitemap automatically every 24 hours
export const revalidate = 86400;

// Slugifier matching page.js URL route parameters
const slugifyCategory = (category) => {
  if (!category) return 'general';
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smartxbdlimited.com';

  let productUrls = [];

  try {
    await connectDB();
    const products = await Product.find({ published: true })
      .select('slug category updatedAt')
      .lean();

    productUrls = products.map((item) => ({
      url: `${baseUrl}/products/${slugifyCategory(item.category)}/${item.slug}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap generation database error:', error);
  }

  // Core static site routes
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  return [...staticPages, ...productUrls];
}