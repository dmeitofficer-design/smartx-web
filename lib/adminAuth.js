// lib/adminAuth.js
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'smartx-secret-2024';

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
