-- ============================================================
-- SENDEROS DE LA COSTA — Schema de base de datos
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

-- 1. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL,
    telefono    TEXT,
    email       TEXT,
    direccion   TEXT,
    notas       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OBRAS
CREATE TABLE IF NOT EXISTS obras (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id      UUID REFERENCES clientes(id) ON DELETE SET NULL,
    titulo          TEXT NOT NULL,
    descripcion     TEXT,
    direccion       TEXT,
    estado          TEXT DEFAULT 'en_curso' CHECK (estado IN ('en_curso','finalizada','pausada','cancelada')),
    fecha_inicio    DATE,
    fecha_fin       DATE,
    notas           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRESUPUESTOS
CREATE TABLE IF NOT EXISTS presupuestos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id         UUID REFERENCES obras(id) ON DELETE SET NULL,
    cliente_id      UUID REFERENCES clientes(id) ON DELETE SET NULL,
    numero          SERIAL,
    titulo          TEXT NOT NULL,
    condiciones     TEXT DEFAULT '50% al inicio, 50% al finalizar',
    validez         TEXT DEFAULT '30 días',
    notas_internas  TEXT,
    notas_cliente   TEXT DEFAULT 'Precios sin IVA. IVA a cargo del cliente.',
    estado          TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador','enviado','aprobado','rechazado')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ITEMS DEL PRESUPUESTO
CREATE TABLE IF NOT EXISTS presupuesto_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presupuesto_id      UUID REFERENCES presupuestos(id) ON DELETE CASCADE,
    descripcion         TEXT NOT NULL,
    monto               NUMERIC(12,2) NOT NULL DEFAULT 0,
    -- Campos internos (no se muestran al cliente)
    costo_materiales    NUMERIC(12,2),
    costo_mano_obra     NUMERIC(12,2),
    orden               INT DEFAULT 0
);

-- 5. TRANSACCIONES (ingresos y egresos)
CREATE TABLE IF NOT EXISTS transacciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id         UUID REFERENCES obras(id) ON DELETE SET NULL,
    tipo            TEXT NOT NULL CHECK (tipo IN ('ingreso','egreso')),
    categoria       TEXT,
    descripcion     TEXT NOT NULL,
    monto           NUMERIC(12,2) NOT NULL,
    fecha           DATE DEFAULT CURRENT_DATE,
    comprobante     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY — solo usuarios autenticados
-- ============================================================
ALTER TABLE clientes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras             ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones     ENABLE ROW LEVEL SECURITY;

-- Política: solo usuarios autenticados pueden leer/escribir
CREATE POLICY "auth_only" ON clientes         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON obras             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON presupuestos      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON presupuesto_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_only" ON transacciones     FOR ALL TO authenticated USING (true) WITH CHECK (true);
