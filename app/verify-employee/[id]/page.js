import crypto from 'crypto';
import { headers } from 'next/headers'; // 🟢 For parsing visitor network telemetry
import { connectDB } from '@/lib/mongodb';
import Employee from '@/models/Employee';
import styles from './verify.module.css';

const SCAN_SECRET = process.env.SCAN_SECRET || 'smartx_technology_token_secret_2026';

export default async function VerifyEmployeePublicPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { id } = resolvedParams;
  const { scanToken } = resolvedSearchParams;

  // 1. Enforce scan-only matching parameters
  if (!scanToken) {
    return (
      <div className={styles.unauthorizedContainer}>
        <div className={styles.alertIcon}>⚠️</div>
        <h2>Access Violation: Manual Entry Blocked</h2>
        <p>This verification node requires an authentic physical hardware scan telemetry token. Manual domain string entries are restricted.</p>
      </div>
    );
  }

  // 2. Decode the ID explicitly to ensure spaces match perfectly during hash verification
  const cleanId = decodeURIComponent(id).trim();

  // 🟢 MATCHES THE 12-CHARACTER COMPACT SECURITY SLICE
  const computedHash = crypto.createHmac('sha256', SCAN_SECRET)
                             .update(cleanId)
                             .digest('hex')
                             .substring(0, 4);

  if (scanToken !== computedHash) {
    return (
      <div className={styles.unauthorizedContainer}>
        <div className={styles.alertIcon}>❌</div>
        <h2>Invalid Security Signature</h2>
        <p>The cryptographic verification signature provided is corrupt or has expired.</p>
      </div>
    );
  }

  await connectDB();

  // 3. 🟢 VISITOR TELEMETRY ENGINE: Extract hardware metadata from client headers
  const headerList = await headers();
  let ipAddress = headerList.get('x-forwarded-for') || '127.0.0.1';
  // If it includes the IPv6 hybrid mapping prefix, strip it clean
if (ipAddress.includes('::ffff:')) {
  ipAddress = ipAddress.replace('::ffff:', '');
}

// Split by comma in case there are multiple proxy hops, and trim any empty spaces
ipAddress = ipAddress.split(',')[0].trim();
  const userAgent = headerList.get('user-agent') || '';

  let device = 'Desktop';
  if (/Mobi|Android|iPhone/i.test(userAgent)) device = 'Mobile';
  
  let browser = 'Other Browser';
  if (/Chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/Safari/i.test(userAgent)) browser = 'Safari';
  else if (/Firefox/i.test(userAgent)) browser = 'Firefox';

  // 4. 🟢 ATOMIC DB TRACKING UPDATE: Increments scanCount and pushes details to scanHistory array
  const employee = await Employee.findOneAndUpdate(
    { employeeId: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
    {
      $inc: { scanCount: 1 },
      $push: {
        scanHistory: {
          scannedAt: new Date(),
          ipAddress,
          browser,
          device,
          location: 'Dhaka, Bangladesh' // Fallback structural tag
        }
      }
    },
    { returnDocument: 'after' } // Return the fresh updated dataset
  ).lean();

  if (!employee) {
    return (
      <div className={styles.unauthorizedContainer}>
        <div className={styles.alertIcon}>🔍</div>
        <h2>Profile Record Missing</h2>
        <p>No active entry matches the validated identifier: "{cleanId}"</p>
      </div>
    );
  }

  return (
    <div className={styles.verifyWrapper}>
      {/* FontAwesome Link fallback for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <div className={`${styles.statusBanner} ${employee.status === 'Active' ? styles.activeBg : styles.inactiveBg}`}>
        <i className={employee.status === 'Active' ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"} />
        &nbsp;{employee.status.toUpperCase()} EMPLOYEE STATUS VERIFIED
      </div>

      <div className={styles.profileBox}>
        <img src={employee.profilePic|| '/avatar-placeholder.png'} className={styles.profilePic} alt="" />
        <h1>{employee.name}</h1>
        <h3>{employee.designation}</h3>
        
        {/* Core Identification Block */}
        <div className={styles.infoLines}>
          <div className={styles.line}>
            <span>Official ID:</span> <strong>{employee.employeeId}</strong>
          </div>
        </div>

        {/* Dynamic "About / Additional Fields" Profile Segment */}
        {employee.additionalFields && employee.additionalFields.length > 0 && (
          <div className={styles.infoLines} style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <i className="fa-solid fa-user-tag" /> Additional Credentials
            </div>
            {employee.additionalFields.map((field, i) => (
              <div className={styles.line} key={i}>
                <span>{field.label}:</span> <strong>{field.value}</strong>
              </div>
            ))}
          </div>
        )}
        
        {/* Contact/Support Entry */}
        <div className={styles.line} style={{ marginTop: '1rem', justifyContent: 'center', fontSize: '0.9rem' }}>
          <span>📞 01321222170</span> 
        </div>

        <div className={styles.badgeFooter}>
          SmartX Technology Limited (SmartX) Verification Node
        </div>
      </div>
    </div>
  );
}