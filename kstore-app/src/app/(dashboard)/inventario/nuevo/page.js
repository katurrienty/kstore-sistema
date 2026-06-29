'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { ArrowLeft, Image as ImageIcon, Save, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function NuevoProducto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    stock_minimo: '5'
  });

  useEffect(() => {
    fetchCatalogs();
  }, []);

  async function fetchCatalogs() {
    const { data: catData } = await supabase.from('categorias').select('id, nombre');
    const { data: marData } = await supabase.from('marcas').select('id, nombre');
    if (catData) setCategorias(catData);
    if (marData) setMarcas(marData);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    setLoading(true);

    try {
      let foto_url = null;
      
      // Subir foto si existe
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

      // Insertar producto
      const { error } = await supabase.from('productos').insert([{
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
      }]);

      if (error) throw error;
      
      router.push('/inventario');
    } catch (error) {
      console.error('Error al guardar:', error.message);
      alert('Error al guardar el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/inventario" className={styles.backBtn}>
          <ArrowLeft size={16} /> Volver a Inventario
        </Link>
        <h1 className={styles.title}>Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        {/* Columna Izquierda - Info General */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Información Básica</h3>
            
            <div className={styles.inputRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Código (SKU)</label>
                <input required type="text" name="codigo" className={styles.input} value={formData.codigo} onChange={handleChange} placeholder="Ej: SHI-105-001" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre del producto</label>
                <input required type="text" name="nombre" className={styles.input} value={formData.nombre} onChange={handleChange} placeholder="Ej: Pata de cambio Shimano 105" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Descripción</label>
              <textarea name="descripcion" className={styles.textarea} value={formData.descripcion} onChange={handleChange} placeholder="Detalles, compatibilidad, etc." />
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
                  <span className={styles.uploadText}>Haz clic para subir una imagen JPG/PNG</span>
                </>
              )}
            </label>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Control de Stock</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Stock Inicial</label>
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
            <button type="submit" disabled={loading} className={styles.btnSave}>
              <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
