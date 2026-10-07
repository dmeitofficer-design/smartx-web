// app/api/team/[id]/photo/route.js
// Serves a team member's stored photo as a proper binary HTTP response.

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const member = await Team.findById(id).select('photo photoType').lean();

    if (!member?.photo) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    let buffer;
    let mimeType = member.photoType || 'image/webp';

    if (typeof member.photo === 'string') {
      const base64 = member.photo.replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(base64, 'base64');
    } else if (member.photo?.buffer) {
      buffer = Buffer.from(member.photo.buffer);
    } else {
      buffer = Buffer.from(member.photo);
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('[/api/team/[id]/photo]', err);
    return new NextResponse('Server error', { status: 500 });
  }
}
