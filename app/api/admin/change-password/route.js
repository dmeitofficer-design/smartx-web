import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Both current and new passwords are required.' }, 
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'New password must be at least 6 characters long.' }, 
        { status: 400 }
      );
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;

    // 1. Try finding the admin document across standard collections ('admins', 'users', 'contacts')
    let adminUser = await db.collection('admins').findOne({});
    let targetCollection = 'admins';

    if (!adminUser) {
      adminUser = await db.collection('users').findOne({});
      targetCollection = 'users';
    }

    // 2. If no user records exist in the database at all
    if (!adminUser) {
      return NextResponse.json(
        { message: 'No admin account document found in the database.' }, 
        { status: 404 }
      );
    }

    // 3. Compare passwords (handles both hashed passwords & plain text fallback)
    let isMatch = false;
    if (adminUser.password.startsWith('$2a$') || adminUser.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    } else {
      isMatch = currentPassword === adminUser.password;
    }

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Incorrect current password.' }, 
        { status: 401 }
      );
    }

    // 4. Update with new hashed password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection(targetCollection).updateOne(
      { _id: adminUser._id },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: 'Password updated successfully!' });

  } catch (error) {
    console.error('Change Password Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}