import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { SITE_URL, slugifyCategory } from '@/lib/site';

// Revalidate sitemap automatically every 24 hours
export const revalidate = 86400;

export default async function sitemap() {
  const staticPages = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/products`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/team`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  let categoryUrls = [];
  let productUrls = [];

  try {
    await connectDB();
    const products = await Product.find({ published: true })
      .select('slug category updatedAt')
      .lean();

    const categories = new Map(); // slug -> newest product update in it
    for (const p of products) {
      const cat = slugifyCategory(p.category);
      if (!cat) continue;
      const updated = p.updatedAt ? new Date(p.updatedAt) : undefined;
      const prev = categories.get(cat);
      if (!prev || (updated && updated > prev)) categories.set(cat, updated);

      if (p.slug) {
        productUrls.push({
          url: `${SITE_URL}/products/${cat}/${p.slug}`,
          lastModified: updated,
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      }
    }

    categoryUrls = [...categories].map(([cat, updated]) => ({
      url: `${SITE_URL}/products/${cat}`,
      lastModified: updated,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));
  } catch (error) {
    console.error('Sitemap generation database error:', error);
  }

  return [...staticPages, ...categoryUrls, ...productUrls];
}
