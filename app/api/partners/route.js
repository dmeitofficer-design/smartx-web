import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Partners from '@/models/Partners';
import { requireAdmin } from '@/lib/adminAuth';

const normalizeItems = (items) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => {
    if (typeof item === 'string') {
      return { image: item, link: '' };
    }
    return {
      image: item?.image || '',
      link: item?.link || ''
    };
  });
};

export async function GET() {
  await connectDB();
  let partnersDoc = await Partners.findOne().lean();
  
  if (!partnersDoc) {
    partnersDoc = (await Partners.create({ title: 'Our Trusted Partners & Clients' })).toObject();
  }

  partnersDoc.partners = normalizeItems(partnersDoc.partners);
  partnersDoc.clients = normalizeItems(partnersDoc.clients);

  return NextResponse.json(JSON.parse(JSON.stringify(partnersDoc)));
}

export async function PUT(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const data = await req.json();

  if (data.partners) data.partners = normalizeItems(data.partners);
  if (data.clients) data.clients = normalizeItems(data.clients);

  // 🟢 Fixed the CastError and cleared the Mongoose deprecation warning message
  const updatedPartners = await Partners.findOneAndUpdate(
    {}, 
    data, 
    { upsert: true, returnDocument: 'after' }
  ).lean();
  
  return NextResponse.json(JSON.parse(JSON.stringify(updatedPartners)));
}   