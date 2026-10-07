import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  await connectDB();
  const team = await Team.find({ published: true }).sort({ order: 1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(team)));
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const m = await Team.create(await req.json());
  return NextResponse.json(JSON.parse(JSON.stringify(m)));
}

export async function PUT(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { _id, ...data } = await req.json();
  const m = await Team.findByIdAndUpdate(_id, data, { returnDocument: 'after' });
  return NextResponse.json(JSON.parse(JSON.stringify(m)));
}

export async function DELETE(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  await Team.findByIdAndDelete(searchParams.get('id'));
  return NextResponse.json({ ok: true });
}
