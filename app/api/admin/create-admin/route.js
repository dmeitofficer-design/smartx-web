import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST(req) {
  try {
    // 1. Initialize DB connection
    await connectDB();

    // 2. Safeguard checking for pre-existing accounts
    const count = await Admin.countDocuments();
    if (count > 0) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 403 });
    }

    // 3. Extract the body context safely
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // 4. Create the instance (Your models/Admin.js file handles the hashing)
    await Admin.create({ username, password });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("API ROUTE ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
