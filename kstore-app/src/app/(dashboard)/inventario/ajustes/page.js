'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { ArrowLeft, Save, Activity } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AjustesInventario() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    producto_id: '',
    tipo: 'SALIDA',
    cantidad: 1,
    motivo: '',
  });

  useEffect(() => {
    fetchProductos();
    fetchMovimientos();
  }, []);

  async function fetchProductos() {
    const { data } = await supabase.from('productos').select('id, nombre, stock_actual').order('nombre');
    if (data) setProductos(data);
  }

  async function fetchMovimientos() {
    const { data } = await supabase
      .from('movimientos_stock')
      .select('*, productos(nombre)')
      .order('fecha', { ascending: false })
      .limit(10);
    if (data) setMovimientos(data);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.producto_id || !formData.motivo) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    setLoading(true);

    try {
      // 1. Insertar el movimiento
      const { error: movError } = await supabase.from('movimientos_stock').insert([{
        producto_id: formData.producto_id,
        tipo: formData.tipo,
        cantidad: parseInt(formData.cantidad),
        motivo: formData.motivo,
      }]);

      if (movError) throw movError;

      // 2. Actualizar el stock del producto
      const producto = productos.find(p => p.id === formData.producto_id);
      let nuevoStock = producto.stock_actual;
      
      if (formData.tipo === 'ENTRADA') nuevoStock += parseInt(formData.cantidad);
      else if (formData.tipo === 'SALIDA') nuevoStock -= parseInt(formData.cantidad);
      else if (formData.tipo === 'AJUSTE') nuevoStock = parseInt(formData.cantidad); // En ajuste la cantidad es el total exacto

      const { error: updError } = await supabase
        .from('productos')
        .update({ stock_actual: nuevoStock })
        .eq('id', formData.producto_id);

      if (updError) throw updError;

      // Refrescar
      setFormData({ ...formData, cantidad: 1, motivo: '' });
      fetchProductos();
      fetchMovimientos();
      alert("Ajuste registrado con éxito.");

    } catch (error) {
      console.error('Error:', error.message);
      alert('Error al registrar el ajuste: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/inventario" className={styles.backBtn}>
            <ArrowLeft size={16} /> Volver
          </Link>
          <h1 className={styles.title}>Ajustes y Mermas</h1>
        </div>
      </div>

      <div className={styles.formGrid}>
        {/* Formulario */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Registrar Ajuste</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Producto</label>
              <select name="producto_id" required className={styles.select} value={formData.producto_id} onChange={handleChange}>
                <option value="">-- Seleccionar --</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>
                ))}
              </select>
            </div>

            <div className={styles.inputRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Movimiento</label>
                <select name="tipo" className={styles.select} value={formData.tipo} onChange={handleChange}>
                  <option value="SALIDA">Salida (Merma, Daño)</option>
                  <option value="ENTRADA">Entrada (Devolución, Regalo)</option>
                  <option value="AJUSTE">Ajuste Exacto (Fijar stock total)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Cantidad</label>
                <input required type="number" min="1" name="cantidad" className={styles.input} value={formData.cantidad} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Motivo (Obligatorio)</label>
              <textarea required name="motivo" className={styles.textarea} value={formData.motivo} onChange={handleChange} placeholder="Ej: Mercadería dañada en depósito" />
            </div>

            <div className={styles.actions} style={{ marginTop: '8px' }}>
              <button type="submit" disabled={loading} className={styles.btnSave} style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                <Save size={18} /> {loading ? 'Procesando...' : 'Registrar Movimiento'}
              </button>
            </div>
          </form>
        </div>

        {/* Historial Reciente */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> Historial Reciente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {movimientos.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No hay movimientos recientes.</div>
            ) : (
              movimientos.map(mov => (
                <div key={mov.id} style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{mov.productos?.nombre}</strong>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 600,
                      color: mov.tipo === 'ENTRADA' ? '#10b981' : (mov.tipo === 'SALIDA' ? '#ef4444' : '#f59e0b') 
                    }}>
                      {mov.tipo} ({mov.cantidad})
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Motivo: {mov.motivo}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
                    {new Date(mov.fecha).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
