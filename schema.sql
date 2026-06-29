-- ========================================================================================
-- K-STORE SISTEMA - ESQUEMA DE BASE DE DATOS (Fase 2: Inventario)
-- Ejecutar en el SQL Editor de Supabase
-- ========================================================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: categorias
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA: marcas
CREATE TABLE marcas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: productos
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL,
    precio_costo NUMERIC(10, 2) NOT NULL DEFAULT 0,
    precio_venta NUMERIC(10, 2) NOT NULL DEFAULT 0,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 5, -- Nivel de alerta por producto
    foto_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: movimientos_stock (Para Mermas, Ingresos y Ajustes)
CREATE TABLE movimientos_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    cantidad INTEGER NOT NULL, -- Positivo o Negativo
    motivo TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    usuario_id UUID -- Se vinculará con auth.users cuando se active la autenticación
);

-- ========================================================================================
-- POLÍTICAS RLS (Row Level Security) - MODO DESARROLLO
-- (Permiten acceso total para la etapa de prototipado sin trabas)
-- ========================================================================================
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL on categorias" ON categorias FOR ALL USING (true);
CREATE POLICY "Allow ALL on marcas" ON marcas FOR ALL USING (true);
CREATE POLICY "Allow ALL on productos" ON productos FOR ALL USING (true);
CREATE POLICY "Allow ALL on movimientos_stock" ON movimientos_stock FOR ALL USING (true);

-- Insertar algunas categorías base
INSERT INTO categorias (nombre, descripcion) VALUES 
('Transmisión', 'Cadenas, piñones, descarriladores'),
('Frenos', 'Pastillas, discos, líquidos, calipers'),
('Ruedas', 'Llantas, rayos, mazas, cámaras'),
('Accesorios', 'Luces, candados, caramañolas');

-- Insertar algunas marcas base
INSERT INTO marcas (nombre) VALUES 
('Shimano'),
('SRAM'),
('Maxxis'),
('KMC');
