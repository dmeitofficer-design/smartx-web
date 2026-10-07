// app/api/products/[id]/image/route.js
// Serves a product's stored image as a proper binary HTTP response.
// This keeps base64 blobs OUT of the HTML entirely.

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    // Fetch ONLY the image field — nothing else
    const product = await Product.findById(id).select('image imageType').lean();

    if (!product?.image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // image may be stored as:
    //   (a) a base64 string  →  "data:image/webp;base64,AAAA..."  or  just "AAAA..."
    //   (b) a Buffer         →  already binary
    let buffer;
    let mimeType = product.imageType || 'image/webp';

    if (typeof product.image === 'string') {
      // Strip the data-URL prefix if present
      const base64 = product.image.replace(/^data:[^;]+;base64,/, '');
      buffer = Buffer.from(base64, 'base64');
    } else if (product.image?.buffer) {
      // Mongoose Binary
      buffer = Buffer.from(product.image.buffer);
    } else {
      buffer = Buffer.from(product.image);
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        // Cache aggressively in the browser — revalidate after 1 day
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('[/api/products/[id]/image]', err);
    return new NextResponse('Server error', { status: 500 });
  }
}
