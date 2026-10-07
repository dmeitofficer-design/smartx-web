import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { unlink } from 'fs/promises';
export async function GET(request, { params }) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const pathArray = resolvedParams?.path;

    if (!pathArray || pathArray.length === 0) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    // Join path parts (e.g., ['catalogs', 'file.pdf'] -> 'catalogs/file.pdf')
    const relativePath = pathArray.join('/');

    // Target the upload directory directly on disk
    const baseUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(baseUploadsDir, relativePath);

    // Security Check: Prevent Directory Traversal attacks (e.g. ../../)
    if (!filePath.startsWith(baseUploadsDir)) {
      return new NextResponse('Access Denied', { status: 403 });
    }

    // Check if the file exists directly on disk right now
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    // Read the file directly from disk (No restart needed!)
    const fileBuffer = fs.readFileSync(filePath);

    // Set correct Content-Type header
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.pdf')) contentType = 'application/pdf';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.webp')) contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline', // Opens inside the browser
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // Prevents caching stale 404s
      },
    });
  } catch (error) {
    console.error('Dynamic file serving error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
export async function DELETE(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { publicId, format } = await req.json();

    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    // 🟢 1. Handle Local PDF Deletion
    if (format === 'pdf' || publicId.endsWith('.pdf')) {
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'catalogs', publicId);

      try {
        await unlink(filePath);
        return NextResponse.json({ success: true, message: 'PDF deleted from server disk' });
      } catch (err) {        // If file doesn't exist on disk, return success anyway so UI updates cleanly
        if (err.code === 'ENOENT') {
          return NextResponse.json({ success: true, message: 'File already deleted or missing' });
        }
        throw err;
      }
    }

    // 🟢 2. Handle Cloudinary Image Deletion
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });

    if (result.result === 'ok' || result.result === 'not_found') {
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json({ error: 'Failed to delete image from Cloudinary', result }, { status: 500 });
    }

  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json(
      { error: err?.message || 'Delete failed' },
      { status: 500 }
    );
  }
}