import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import About from '@/models/About';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  await connectDB();
  let about = await About.findOne().lean();
  if (!about) about = (await About.create({})).toObject();
  return NextResponse.json(JSON.parse(JSON.stringify(about)));
}

export async function PUT(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const data = await req.json();
  const about = await About.findOneAndUpdate({}, data, { upsert: true, returnDocument: 'after' });
  return NextResponse.json(JSON.parse(JSON.stringify(about)));
}
