'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Search, Plus, SlidersHorizontal, AlertTriangle, ArrowDownToLine, ArrowUpToLine, PackageSearch } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function InventarioPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    setLoading(true);
    // Realizar un join con la tabla 'categorias' y 'marcas' si existieran
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias(nombre), marcas(nombre)')
      .order('nombre', { ascending: true });
      
    if (error) {
      console.error('Error fetching productos:', error);
    } else {
      setProductos(data || []);
    }
    setLoading(false);
  }

  // Filtrado local
  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcula el porcentaje de margen de ganancia
  const calcularMargen = (costo, venta) => {
    if (!costo || costo === 0) return 100;
    return (((venta - costo) / costo) * 100).toFixed(1);
  };

  // Determina la clase CSS para el badge según la rentabilidad
  const getRentabilidadBadge = (margen) => {
    if (margen > 30) return styles.badgeGreen;
    if (margen >= 15) return styles.badgeYellow;
    return styles.badgeRed;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerActions}>
        <div className={styles.searchBox}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por código o nombre..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.btnSecondary} title="Ajustes de inventario (Mermas/Correcciones)">
            <SlidersHorizontal size={18} /> Ajustes
          </button>
          <Link href="/inventario/nuevo" className={styles.btnPrimary}>
            <Plus size={18} /> Nuevo Producto
          </Link>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Costo</th>
              <th>Precio Venta</th>
              <th>Rentabilidad</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                  Cargando inventario...
                </td>
              </tr>
            ) : filteredProductos.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <PackageSearch size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                  <br />
                  No se encontraron productos en el inventario.
                </td>
              </tr>
            ) : (
              filteredProductos.map((prod) => {
                const margen = calcularMargen(prod.precio_costo, prod.precio_venta);
                const isStockBajo = prod.stock_actual <= prod.stock_minimo;

                return (
                  <tr key={prod.id}>
                    <td>
                      <div className={styles.productName}>{prod.nombre}</div>
                      <div className={styles.productCode}>{prod.codigo}</div>
                    </td>
                    <td>${prod.precio_costo.toLocaleString()}</td>
                    <td>${prod.precio_venta.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.badge} ${getRentabilidadBadge(margen)}`}>
                        {margen}% Margen
                      </span>
                    </td>
                    <td>
                      <span className={isStockBajo ? styles.stockAlert : styles.stockNormal}>
                        {isStockBajo && <AlertTriangle size={14} />}
                        {prod.stock_actual}
                      </span>
                    </td>
                    <td>
                      <span className={prod.activo ? styles.stockNormal : styles.stockAlert}>
                        {prod.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href={`/inventario/${prod.id}/editar`} style={{ color: 'var(--accent)' }}>Editar</Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
