'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { Package, ShoppingCart, DollarSign, LayoutGrid, Wallet, Users, Triangle, Zap, Rocket, Github, ClipboardList } from 'lucide-react';
import Link from 'next/link';

const modules = [
  { id: 'inventario', icon: <Package size={20} />, title: 'Inventario', description: 'Control de stock, ajustes y alertas de mínimo', color: '#00d4aa', status: 'En desarrollo', statusType: 'dev' },
  { id: 'compras', icon: <ShoppingCart size={20} />, title: 'Compras', description: 'Registro de compras a proveedores con factura o guía', color: '#3b82f6', status: 'En desarrollo', statusType: 'dev' },
  { id: 'ventas', icon: <DollarSign size={20} />, title: 'Ventas', description: 'Ventas con descuento automático de inventario', color: '#8b5cf6', status: 'En desarrollo', statusType: 'dev' },
  { id: 'catalogo', icon: <LayoutGrid size={20} />, title: 'Catálogo', description: 'Fichas de productos compartibles con clientes', color: '#f59e0b', status: 'En desarrollo', statusType: 'dev' },
  { id: 'finanzas', icon: <Wallet size={20} />, title: 'Finanzas', description: 'Caja, ingresos, egresos y reportes para el contador', color: '#10b981', status: 'En desarrollo', statusType: 'dev' },
  { id: 'usuarios', icon: <Users size={20} />, title: 'Usuarios', description: 'Gestión de roles y permisos del equipo', color: '#ec4899', status: 'Planificado', statusType: 'planned' },
];

const stats = [
  { label: 'Total Productos', value: '—', icon: <Package size={24} />, color: '#00d4aa' },
  { label: 'Ventas Hoy', value: '—', icon: <DollarSign size={24} />, color: '#8b5cf6' },
  { label: 'Stock Bajo', value: '—', icon: <Triangle size={24} />, color: '#f59e0b' },
  { label: 'Saldo en Caja', value: '—', icon: <Wallet size={24} />, color: '#10b981' },
];

export default function Home() {
  const [hoveredModule, setHoveredModule] = useState(null);

  return (
    <>
      {/* Hero welcome */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}><Rocket size={14} /> Bienvenido al sistema</div>
          <h2 className={styles.heroTitle}>
            K-Store <span className={styles.heroAccent}>Sistema</span>
          </h2>
          <p className={styles.heroDesc}>
            Tu plataforma de administración para inventario, compras, ventas y reportes.
            Los módulos se activarán a medida que avance el desarrollo.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard} style={{ '--accent-color': stat.color }}>
            <div className={styles.statIcon} style={{ color: stat.color }}>{stat.icon}</div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Modules grid */}
      <section className={styles.modulesSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Módulos del Sistema</h3>
          <span className={styles.sectionSub}>En desarrollo — aprobación por etapas</span>
        </div>
        <div className={styles.modulesGrid}>
          {modules.map((mod) => (
            <Link
              key={mod.id}
              href={`/${mod.id}`}
              className={styles.moduleCard}
              style={{ '--mod-color': mod.color }}
              onMouseEnter={() => setHoveredModule(mod.id)}
              onMouseLeave={() => setHoveredModule(null)}
            >
              <div className={styles.moduleIconWrap}>
                <span className={styles.moduleIcon} style={{ color: mod.color }}>{mod.icon}</span>
              </div>
              <div className={styles.moduleInfo}>
                <div className={styles.moduleTitle}>{mod.title}</div>
                <div className={styles.moduleDesc}>{mod.description}</div>
              </div>
              <div
                className={styles.moduleStatus}
                data-type={mod.statusType}
              >
                {mod.status}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stack info */}
      <section className={styles.stackSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Stack tecnológico</h3>
        </div>
        <div className={styles.stackGrid}>
          {[
            { name: 'Next.js', role: 'Frontend', icon: <Triangle size={18} fill="currentColor" /> },
            { name: 'Supabase', role: 'Base de datos', icon: <Zap size={18} fill="currentColor" /> },
            { name: 'Vercel', role: 'Deploy', icon: <Triangle size={18} fill="currentColor" /> },
            { name: 'GitHub', role: 'Repositorio', icon: <Github size={18} /> },
            { name: 'Linear', role: 'Gestión de tareas', icon: <ClipboardList size={18} /> },
          ].map((tech, i) => (
            <div key={i} className={styles.stackCard}>
              <div className={styles.stackIcon}>{tech.icon}</div>
              <div className={styles.stackName}>{tech.name}</div>
              <div className={styles.stackRole}>{tech.role}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
