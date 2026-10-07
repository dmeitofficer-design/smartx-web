import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { signAdminToken } from '@/lib/adminAuth';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    await connectDB();
    const { username, password } = await req.json();
    const admin = await Admin.findOne({ username });
    if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const ok = await admin.comparePassword(password);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = signAdminToken({ id: admin._id, username: admin.username });
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
