import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    // Handling async params (required in Next.js 15+, safe in Next.js 13/14)
    const resolvedParams = await params;
    const pathArray = resolvedParams.path; 

    if (!pathArray || pathArray.length === 0) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    // Join the path array: e.g. ['catalogs', 'topaz-d.pdf'] -> 'catalogs/topaz-d.pdf'
    const relativePath = pathArray.join('/');

    // Target the actual directory where files are stored on your server
    const baseUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(baseUploadsDir, relativePath);

    // Security Guard: Prevent directory traversal (e.g., ../../etc/passwd)
    if (!filePath.startsWith(baseUploadsDir)) {
      return new NextResponse('Access Denied', { status: 403 });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    // Read and return the file
    const fileBuffer = fs.readFileSync(filePath);

    // Dynamic MIME type determination
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.pdf')) contentType = 'application/pdf';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.webp')) contentType = 'image/webp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline', // Opens in browser instead of forcing download
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('File serving error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}