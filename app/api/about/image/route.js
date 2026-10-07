// app/api/about/image/route.js
// Serves the About section image

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import About from '@/models/About';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const about = await About.findOne().select('image imageType').lean();

    if (!about?.image) return new NextResponse('Not found', { status: 404 });

    let buffer;
    const mimeType = about.imageType || 'image/webp';

    if (typeof about.image === 'string') {
      buffer = Buffer.from(about.image.replace(/^data:[^;]+;base64,/, ''), 'base64');
    } else if (about.image?.buffer) {
      buffer = Buffer.from(about.image.buffer);
    } else {
      buffer = Buffer.from(about.image);
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('[/api/about/image]', err);
    return new NextResponse('Server error', { status: 500 });
  }
}
