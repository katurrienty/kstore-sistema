'use client';

import { useState } from 'react';
import styles from './layout.module.css';
import { Package, ShoppingCart, DollarSign, LayoutGrid, Wallet, Users, Bike } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const modules = [
  { id: 'dashboard', path: '/', icon: <LayoutGrid size={20} />, title: 'Dashboard', color: '#3b82f6' },
  { id: 'inventario', path: '/inventario', icon: <Package size={20} />, title: 'Inventario', color: '#00d4aa' },
  { id: 'compras', path: '/compras', icon: <ShoppingCart size={20} />, title: 'Compras', color: '#f59e0b' },
  { id: 'ventas', path: '/ventas', icon: <DollarSign size={20} />, title: 'Ventas', color: '#8b5cf6' },
  { id: 'finanzas', path: '/finanzas', icon: <Wallet size={20} />, title: 'Finanzas', color: '#10b981' },
  { id: 'usuarios', path: '/usuarios', icon: <Users size={20} />, title: 'Usuarios', color: '#ec4899' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [hoveredModule, setHoveredModule] = useState(null);

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    const mod = modules.find(m => pathname.startsWith(m.path) && m.path !== '/');
    return mod ? mod.title : 'Sistema';
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}><Bike size={28} /></span>
          <div>
            <div className={styles.logoTitle}>K-Store</div>
            <div className={styles.logoSub}>Sistema</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navLabel}>Módulos</div>
          {modules.map((mod) => {
            const isActive = pathname === mod.path || (pathname.startsWith(mod.path) && mod.path !== '/');
            return (
              <Link
                key={mod.id}
                href={mod.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onMouseEnter={() => setHoveredModule(mod.id)}
                onMouseLeave={() => setHoveredModule(null)}
              >
                <span 
                  className={styles.navIcon} 
                  style={{ color: isActive || hoveredModule === mod.id ? mod.color : undefined }}
                >
                  {mod.icon}
                </span>
                <span className={styles.navText}>{mod.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.versionBadge}>
            <span className={styles.versionDot}></span>
            v0.2.0 — Fase 2
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className={styles.mainWrapper}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
            <span className={styles.pagePath}>/ {pathname.split('/')[1] || 'Inicio'}</span>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>A</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>Auditor</span>
                <span className={styles.userRole}>Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
