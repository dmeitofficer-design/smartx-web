'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../../globals.css';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: 'fa-gauge-high',     label: 'Dashboard' },
  { href: '/admin/hero',      icon: 'fa-image',           label: 'Hero Section' },
  { href: '/admin/about',     icon: 'fa-circle-info',     label: 'About' },
  { href: '/admin/partners',  icon: 'fa-handshake',        label: 'Partners' },
  { href: '/admin/employees',  icon: 'fa-users',           label: 'Employees' },
  { href: '/admin/products',  icon: 'fa-boxes-stacked',   label: 'Products' },
  { href: '/admin/team',      icon: 'fa-users',           label: 'Team' },
  { href: '/admin/messages',  icon: 'fa-envelope',        label: 'Messages' },
  { href: '/admin/settings',  icon: 'fa-sliders',         label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHead}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}><i className="fa-brands fa-whmcs"></i></span>
            <span className={styles.logoText}>SmartX CMS</span>
          </Link>
          <button className={styles.closeMobile} onClick={() => setSidebarOpen(false)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.active : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className={`fa-solid ${item.icon} ${styles.navIcon}`} />
                <span>{item.label}</span>
                {active && <span className={styles.activeDot} />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <Link href="/" target="_blank" className={styles.viewSite}>
            <i className="fa-solid fa-arrow-up-right-from-square" /> View Website
          </Link>
          <Link 
    href="/admin/change-password" 
    className="btn btn-outline btn-sm"
    title="Change Password"
    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
  >
    <i className="fa-solid fa-key" />
    <span>Update</span>
  </Link>
          <button className={`btn btn-danger btn-sm ${styles.logoutBtn}`} onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <i className="fa-solid fa-bars" />
          </button>
          <div className={styles.topbarRight}>
            <span className={styles.adminBadge}>
              <i className="fa-solid fa-user-shield" /> Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
