import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Team from '@/models/Team';
import Contact from '@/models/Contact';
import styles from './dashboard.module.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await connectDB();

  const partnersDoc = await (await import('@/models/Partners')).default.findOne().lean();

  const [productCount, teamCount, totalMsgs, unreadMsgs, recentMsgs] = await Promise.all([
    Product.countDocuments({ published: true }),
    Team.countDocuments({ published: true }),
    Contact.countDocuments(),
    Contact.countDocuments({ read: false }),
    Contact.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const partnerCount = partnersDoc?.partners?.length || 0;
  const clientCount = partnersDoc?.clients?.length || 0;

  const stats = [
    { icon: 'fa-boxes-stacked', label: 'Products',       value: productCount, color: '#0ea5e9', href: '/admin/products' },
    { icon: 'fa-users',         label: 'Team Members',   value: teamCount,    color: '#6366f1', href: '/admin/team' },
    { icon: 'fa-envelope',      label: 'Total Messages', value: totalMsgs,    color: '#10b981', href: '/admin/messages' },
    { icon: 'fa-bell',          label: 'Unread Messages',value: unreadMsgs,   color: '#f59e0b', href: '/admin/messages' },
    { icon: 'fa-handshake',     label: 'Partners',       value: partnerCount, color: '#8b5cf6', href: '/admin/partners' },
    { icon: 'fa-users',         label: 'Clients',        value: clientCount,  color: '#ec4899', href: '/admin/partners' },
  ];

  const quickLinks = [
    { icon: 'fa-image',        label: 'Edit Hero',       href: '/admin/hero',     desc: 'Update headline, stats, background' },
    { icon: 'fa-circle-info',  label: 'Edit About',      href: '/admin/about',    desc: 'Company info, mission, vision' },
    { icon: 'fa-plus-circle',  label: 'Add Product',     href: '/admin/products', desc: 'Add a new DRGEM product' },
    { icon: 'fa-user-plus',    label: 'Add Team Member', href: '/admin/team',     desc: 'Add a new team member' },
    { icon: 'fa-sliders',      label: 'Site Settings',   href: '/admin/settings', desc: 'Colors, fonts, contact info' },
      { icon: 'fa-sliders',      label: 'partner Settings',   href: '/admin/partners', desc: 'Colors, fonts, contact info' },
  ];

  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: `${s.color}22`, color: s.color }}>
              <i className={`fa-solid ${s.icon}`} />
            </div>
            <div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
            {s.label === 'Unread Messages' && unreadMsgs > 0 && (
              <span className={styles.badge}>{unreadMsgs}</span>
            )}
          </Link>
        ))}
      </div>

      <div className={styles.row}>
        {/* Quick Actions */}
        <div className="admin-section" style={{ flex: 1 }}>
          <h2>Quick Actions</h2>
          <div className={styles.quickGrid}>
            {quickLinks.map(q => (
              <Link key={q.href} href={q.href} className={styles.quickCard}>
                <i className={`fa-solid ${q.icon}`} style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{q.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{q.desc}</div>
                </div>
                <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: '0.75rem' }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="admin-section" style={{ flex: 1.4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ marginBottom: 0 }}>Recent Inquiries</h2>
            <Link href="/admin/messages" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {recentMsgs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-xl)' }}>
              No messages yet.
            </div>
          ) : (
            <div className={styles.msgList}>
              {recentMsgs.map(m => (
                <Link key={m._id} href="/admin/messages" className={styles.msgItem}>
                  <div className={`${styles.msgDot} ${!m.read ? styles.unread : ''}`} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                      {m.name}
                      {m.product && <span style={{ fontSize: '0.72rem', background: 'rgba(var(--color-primary-rgb),0.1)', color: 'var(--color-primary)', padding: '1px 7px', borderRadius: '999px' }}>{m.product}</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', flexShrink: 0 }}>
                    {new Date(m.createdAt).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' })}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
