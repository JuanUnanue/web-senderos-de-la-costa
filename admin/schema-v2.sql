-- ============================================================
-- SENDEROS DE LA COSTA — Schema v2: Grupos de trabajo
-- Ejecutar en: Supabase → SQL Editor
-- (Requiere haber ejecutado schema.sql primero)
-- ============================================================

-- 1. GRUPOS DE TRABAJO
CREATE TABLE IF NOT EXISTS grupos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL,
    lider       TEXT NOT NULL,
    telefono    TEXT,
    notas       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agregar grupo_id a transacciones
--    Permite identificar qué egreso corresponde a un pago de equipo
ALTER TABLE transacciones
    ADD COLUMN IF NOT EXISTS grupo_id UUID REFERENCES grupos(id) ON DELETE SET NULL;

-- 3. RLS para grupos
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_only" ON grupos FOR ALL TO authenticated USING (true) WITH CHECK (true);
