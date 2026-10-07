import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product'; // Ensure your Product model is imported
import ProductsSection from '../components/ProductsSection';// Adjust relative import based on your folder structure

export const dynamic = 'force-dynamic';

const stringifyAndClean = (data) => {
  if (!data) return null;
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (key === '_id' && value) return value.toString();
    return value;
  }));
};

async function getProductsData() {
  await connectDB();
  // Fetches published products sorted by order or creation date
  const products = await Product.find({ published: true }).sort({ order: 1 }).lean();
  return stringifyAndClean(products) || [];
}

export default async function ProductsPage() {
  const productsData = await getProductsData();

  return (
    <main className="pt-24">
      <ProductsSection products={productsData} isLoading={false} />
    </main>
  );
}