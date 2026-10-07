import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const msg = await Contact.create(data);
  return NextResponse.json({ ok: true, id: msg._id });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const msgs = await Contact.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(msgs)));
}

export async function PUT(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { _id, ...data } = await req.json();
  await Contact.findByIdAndUpdate(_id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  await Contact.findByIdAndDelete(searchParams.get('id'));
  return NextResponse.json({ ok: true });
}
