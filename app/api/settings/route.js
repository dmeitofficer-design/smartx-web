import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  await connectDB();
  let settings = await SiteSettings.findOne().lean();
  if (!settings) settings = await SiteSettings.create({});
  return NextResponse.json(JSON.parse(JSON.stringify(settings)));
}

export async function PUT(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const data = await req.json();
  
  // FIXED: Replaced { returnDocument: 'after' } with { returnDocument: 'after' }
  const settings = await SiteSettings.findOneAndUpdate({}, data, { upsert: true, returnDocument: 'after' });
  
  return NextResponse.json(JSON.parse(JSON.stringify(settings)));
}
