'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { ArrowLeft, Image as ImageIcon, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function EditarProducto() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    marca_id: '',
    precio_costo: '',
    precio_venta: '',
    stock_actual: '0',
    stock_minimo: '5',
    activo: true,
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  async function fetchData() {
    setLoading(true);
    
    // Fetch catálogos
    const { data: catData } = await supabase.from('categorias').select('id, nombre');
    const { data: marData } = await supabase.from('marcas').select('id, nombre');
    if (catData) setCategorias(catData);
    if (marData) setMarcas(marData);

    // Fetch producto
    const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
    if (data) {
      setFormData({
        codigo: data.codigo || '',
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        categoria_id: data.categoria_id || '',
        marca_id: data.marca_id || '',
        precio_costo: data.precio_costo || '',
        precio_venta: data.precio_venta || '',
        stock_actual: data.stock_actual || 0,
        stock_minimo: data.stock_minimo || 5,
        activo: data.activo,
      });
      if (data.foto_url) {
        setFotoPreview(data.foto_url);
      }
    } else {
      console.error(error);
      alert('Producto no encontrado');
      router.push('/inventario');
    }
    
    setLoading(false);
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const calcularMargen = () => {
    const costo = parseFloat(formData.precio_costo);
    const venta = parseFloat(formData.precio_venta);
    if (!costo || !venta || costo === 0) return 0;
    return (((venta - costo) / costo) * 100);
  };

  const margen = calcularMargen();
  let margenStyle = styles.marginRed;
  if (margen > 30) margenStyle = styles.marginGreen;
  else if (margen >= 15) margenStyle = styles.marginYellow;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let foto_url = fotoPreview; // keep original url if not changed
      
      // Subir nueva foto si existe archivo
      if (fotoFile) {
        const fileExt = fotoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(filePath, fotoFile);

        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('productos')
          .getPublicUrl(filePath);
          
        foto_url = publicUrlData.publicUrl;
      }

      // Actualizar producto
      const { error } = await supabase.from('productos').update({
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        categoria_id: formData.categoria_id || null,
        marca_id: formData.marca_id || null,
        precio_costo: parseFloat(formData.precio_costo),
        precio_venta: parseFloat(formData.precio_venta),
        stock_actual: parseInt(formData.stock_actual),
        stock_minimo: parseInt(formData.stock_minimo),
        foto_url: foto_url,
        activo: formData.activo,
      }).eq('id', id);

      if (error) throw error;
      
      router.push('/inventario');
    } catch (error) {
      console.error('Error al guardar:', error.message);
      alert('Error al actualizar el producto: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) {
      setSaving(true);
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (!error) {
        router.push('/inventario');
      } else {
        alert('Error al eliminar: ' + error.message);
        setSaving(false);
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando producto...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/inventario" className={styles.backBtn}>
            <ArrowLeft size={16} />
          </Link>
          <h1 className={styles.title}>Editar Producto</h1>
        </div>
        
        <button type="button" onClick={handleDelete} className={styles.btnCancel} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <Trash2 size={16} /> Eliminar
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        {/* Columna Izquierda - Info General */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Información Básica</h3>
            
            <div className={styles.inputRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Código (SKU)</label>
                <input required type="text" name="codigo" className={styles.input} value={formData.codigo} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre del producto</label>
                <input required type="text" name="nombre" className={styles.input} value={formData.nombre} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Descripción</label>
              <textarea name="descripcion" className={styles.textarea} value={formData.descripcion} onChange={handleChange} />
            </div>

            <div className={styles.inputRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Categoría</label>
                <select name="categoria_id" className={styles.select} value={formData.categoria_id} onChange={handleChange}>
                  <option value="">-- Seleccionar --</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Marca</label>
                <select name="marca_id" className={styles.select} value={formData.marca_id} onChange={handleChange}>
                  <option value="">-- Seleccionar --</option>
                  {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
            </div>
            
            <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <input type="checkbox" name="activo" id="activo" checked={formData.activo} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="activo" className={styles.label} style={{ cursor: 'pointer' }}>Producto activo (visible en catálogo y ventas)</label>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Precios y Rentabilidad</h3>
            
            <div className={styles.inputRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Precio de Costo ($)</label>
                <input required type="number" step="0.01" name="precio_costo" className={styles.input} value={formData.precio_costo} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Precio de Venta ($)</label>
                <input required type="number" step="0.01" name="precio_venta" className={styles.input} value={formData.precio_venta} onChange={handleChange} />
              </div>
            </div>

            <div className={`${styles.marginIndicator} ${margenStyle}`}>
              <span>Margen de Ganancia:</span>
              <span>{margen > 0 ? margen.toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Foto y Stock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Fotografía</h3>
            <label className={styles.photoUploader}>
              <input type="file" accept="image/*" className={styles.fileInput} onChange={handleFotoChange} />
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview" className={styles.photoPreview} />
              ) : (
                <>
                  <ImageIcon size={32} color="var(--text-muted)" />
                  <span className={styles.uploadText}>Haz clic para actualizar imagen JPG/PNG</span>
                </>
              )}
            </label>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Control de Stock</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Stock Actual</label>
              <input required type="number" name="stock_actual" className={styles.input} value={formData.stock_actual} onChange={handleChange} />
            </div>
            
            <div className={styles.formGroup} style={{ marginTop: '12px' }}>
              <label className={styles.label}>Alerta de Stock Mínimo</label>
              <input required type="number" name="stock_minimo" className={styles.input} value={formData.stock_minimo} onChange={handleChange} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Se mostrará una alerta cuando el stock baje de este umbral.</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={() => router.back()} className={styles.btnCancel}>Cancelar</button>
            <button type="submit" disabled={saving} className={styles.btnSave}>
              <Save size={18} /> {saving ? 'Actualizando...' : 'Actualizar Producto'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
