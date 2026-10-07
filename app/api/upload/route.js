import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/adminAuth';
import path from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';

// Max 10 MB
const MAX_BYTES = 20 * 1024 * 1024;

const FOLDER_MAP = {
  hero:       'smartx/hero',
  hero_bg:    'smartx/hero',
  logo:       'smartx/branding',
  ce_icon:    'smartx/branding',
  product:    'smartx/products',
  team:       'smartx/team',
  about:      'smartx/about',
};

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file     = formData.get('file');
    const context  = formData.get('context') || 'general';
    const mode     = formData.get('mode')    || 'optimized';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 413 });
    }

    const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');

    // 🟢 OPTION: Save PDFs directly to the local /public/uploads folder
    if (isPdf) {
      const buffer = Buffer.from(bytes);
      
      // Ensure the destination directory exists: public/uploads/catalogs
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'catalogs');
      await mkdir(uploadDir, { recursive: true });

      // Create a unique, safe filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${safeName}`;
      const filePath = path.join(uploadDir, filename);

      // Write the file binary to disk
      await writeFile(filePath, buffer);

      // Return the public web URL path
      const publicUrl = `/uploads/catalogs/${filename}`;

      return NextResponse.json({
        url: publicUrl,
        publicId: filename,
        format: 'pdf',
        bytes: bytes.byteLength,
      });
    }

    // 🟢 Standard Cloudinary flow for Images / Logos
    const isSvg = file.type === 'image/svg+xml' || file.name?.toLowerCase().endsWith('.svg');
    const folder = FOLDER_MAP[context] || 'smartx/general';

    const uploadOptions = {
      folder,
      use_filename: false,
      unique_filename: true,
      overwrite: false,
      resource_type: 'image',
      tags: ['smartx', context],
    };

    if (isSvg) {
      uploadOptions.resource_type = 'image';
      uploadOptions.format = 'svg';
    } else if (mode === 'optimized') {
      uploadOptions.transformation = [
        { width: 1600, height: 1600, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' },
      ];
    }

    const buffer = Buffer.from(bytes);
    const b64    = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    return NextResponse.json({
      url:       result.secure_url,
      publicId:  result.public_id,
      format:    result.format,
      width:     result.width,
      height:    result.height,
      bytes:     result.bytes,
    });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: err?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
export async function DELETE(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { publicId, format } = await req.json();

    console.log('DELETE Request received for:', { publicId, format });

    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    // 🟢 1. Handle Local PDF Deletion
    if (format === 'pdf' || publicId.endsWith('.pdf')) {
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'catalogs', publicId);

      console.log('Attempting to unlink file at:', filePath);

      try {
        await unlink(filePath);
        console.log('Successfully unlinked file!');
        return NextResponse.json({ success: true, message: 'PDF deleted from server disk' });
      } catch (err) {
        console.error('Failed to unlink file:', err);
        if (err.code === 'ENOENT') {
          return NextResponse.json({ success: true, message: 'File already deleted or missing' });
        }
        return NextResponse.json({ error: `File system error: ${err.message}` }, { status: 500 });
      }
    }

    // 🟢 2. Handle Cloudinary Image Deletion
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });

    return NextResponse.json({ success: true, result });

  } catch (err) {
    console.error('Delete handler crashed:', err);
    return NextResponse.json({ error: err?.message || 'Delete failed' }, { status: 500 });
  }
}