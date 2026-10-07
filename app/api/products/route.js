import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/adminAuth';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const adminView = searchParams.get('admin'); // 🟢 Flag for admin panel

  if (slug) {
    const p = await Product.findOne({ slug }).lean();
    return NextResponse.json(p ? JSON.parse(JSON.stringify(p)) : null);
  }

  // 🟢 If admin query is present, fetch ALL products (both published and drafts)
  const filter = adminView ? {} : { published: true };

  const products = await Product.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(products)));
}
  
export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await connectDB();
  const data = await req.json();

  // If name is missing, prevent a DB crash
  if (!data.name) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  }

  // Modern mongoose will safely generate the slug during this invocation
  const p = await Product.create(data);
  return NextResponse.json(JSON.parse(JSON.stringify(p)));
}

export async function PUT(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  
  const { _id, ...data } = await req.json();

  // 🟢 Explicitly ensure catalog and link are updated even if empty string
  const updatePayload = {
    ...data,
    catalog: data.catalog ?? '',
    link: data.link ?? '',
  };

  const p = await Product.findByIdAndUpdate(
    _id, 
    { $set: updatePayload }, 
    { returnDocument: 'after' }
  );
  
  return NextResponse.json(JSON.parse(JSON.stringify(p)));
}

export async function DELETE(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
