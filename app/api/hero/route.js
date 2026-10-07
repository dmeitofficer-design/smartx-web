import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Hero from '@/models/Hero';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  await connectDB();
  let hero = await Hero.findOne().lean();
  if (!hero) hero = (await Hero.create({})).toObject();
  return NextResponse.json(JSON.parse(JSON.stringify(hero)));
}

export async function PUT(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const data = await req.json();
  const hero = await Hero.findOneAndUpdate({}, data, { upsert: true, returnDocument: 'after' });
  return NextResponse.json(JSON.parse(JSON.stringify(hero)));
}
