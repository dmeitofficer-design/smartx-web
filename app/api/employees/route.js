import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { requireAdmin } from '@/lib/adminAuth';
import crypto from 'crypto';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const SCAN_SECRET = process.env.SCAN_SECRET || 'smartx_technology_token_secret_2026';
function generateSecureScanLink(employeeId = '') {
  const safeId = String(employeeId || '').trim();
  
  // Dynamic network selection for local testing vs live server environment
  const domain = process.env.NODE_ENV === 'development'
    ? 'http://192.168.1.225:3000'
    : 'https://smartxlimited.com';
    
  // 🟢 ADJUSTED TO 12 CHARACTERS: Maximum QR code compactness with enterprise-grade security
  const hash = crypto.createHmac('sha256', SCAN_SECRET)
                     .update(safeId)
                     .digest('hex')
                     .substring(0, 4);

  return `${domain}/verify-employee/${encodeURIComponent(safeId)}?scanToken=${hash}`;
}

export async function GET(req) {
  await connectDB();
  // Automatically pulls your new scanCount and scanHistory data fields
  const employees = await Employee.find().sort({ createdAt: -1 }).lean();
  
  const output = employees.map(emp => {
    const targetId = emp.employeeId || String(emp._id);
    return {
      ...emp,
      employeeId: targetId,
      qrCodeLink: generateSecureScanLink(targetId)
    };
  });
  
  return NextResponse.json(JSON.parse(JSON.stringify(output)));
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const data = await req.json();

  if (!data.employeeId || !data.name) {
    return NextResponse.json({ error: 'Missing core verification identifiers' }, { status: 400 });
  }

  const existing = await Employee.findOne({ employeeId: data.employeeId.trim() });
  if (existing) {
    return NextResponse.json({ error: `Employee ID "${data.employeeId}" is already registered.` }, { status: 400 });
  }

  const employee = await Employee.create(data);
  return NextResponse.json({ 
    success: true, 
    employee,
    qrCodeLink: generateSecureScanLink(employee.employeeId)
  });
}

export async function DELETE(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing record identifier' }, { status: 400 });
  }

  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    if (employee.profilePic?.publicId) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/upload`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: employee.profilePic.publicId }),
      }).catch(() => {});
    }

    await Employee.findByIdAndDelete(id);
    return NextResponse.json({ ok: true, message: 'Employee wiped from registry successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process deletion request' }, { status: 500 });
  }
}

export async function PUT(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const data = await req.json();
  const { _id, ...updateData } = data;

  if (!_id) {
    return NextResponse.json({ error: 'Missing record document reference' }, { status: 400 });
  }

  try {
    if (updateData.employeeId) {
      const existing = await Employee.findOne({ 
        employeeId: updateData.employeeId.trim(),
        _id: { $ne: _id }
      });
      if (existing) {
        return NextResponse.json({ error: `Employee ID "${updateData.employeeId}" is already assigned.` }, { status: 400 });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return NextResponse.json({ 
      success: true, 
      employee: updatedEmployee,
      qrCodeLink: generateSecureScanLink(updatedEmployee.employeeId)
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update employee entry' }, { status: 500 });
  }
}