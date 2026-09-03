-- ==============================================================================
-- VIBECARGO · ESQUEMA Y SEGURIDAD DE BASE DE DATOS (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. Crear la tabla de cotizaciones (quotes) si no existe
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    stairs INTEGER DEFAULT 0 NOT NULL,
    items TEXT NOT NULL,
    client_name TEXT,
    phone TEXT,
    estimated_total BIGINT NOT NULL,
    breakdown JSONB
);

-- Índices recomendados para búsquedas y ordenamiento
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes (created_at DESC);

-- ==============================================================================
-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Por defecto, una vez activado RLS, se deniegan todas las operaciones a menos
-- que exista una política explícita que las autorice.
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. POLÍTICAS DE ACCESO (POLICIES)
-- ==============================================================================

-- A) PERMITIR INSERCIÓN PÚBLICA (ANON):
-- Permite que los visitantes de tu web (con la clave pública anon) puedan
-- registrar sus cotizaciones generadas.
DROP POLICY IF EXISTS "Permitir a usuarios anonimos crear cotizaciones" ON public.quotes;
CREATE POLICY "Permitir a usuarios anonimos crear cotizaciones"
ON public.quotes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- B) PROTECCIÓN DE LECTURA (SELECT):
-- Por seguridad y privacidad de datos sensibles (nombre, teléfono y direcciones),
-- NO creamos política pública de SELECT para 'anon'.
-- Esto significa que nadie desde el navegador puede listar o espiar las cotizaciones de otros.
--
-- NOTA TÉCNICA SOBRE KEEP-ALIVE:
-- Cuando el endpoint /api/keep-alive consulta "SELECT id FROM quotes LIMIT 1",
-- PostgreSQL ejecuta la consulta y devuelve 0 filas sin error. Esto confirma que
-- el servidor de base de datos está despierto y activo sin comprometer la privacidad.

-- C) PERMITIR LECTURA SOLO A ADMINISTRADORES / USUARIOS AUTENTICADOS (Opcional para panel de control):
DROP POLICY IF EXISTS "Permitir lectura solo a usuarios autenticados" ON public.quotes;
CREATE POLICY "Permitir lectura solo a usuarios autenticados"
ON public.quotes
FOR SELECT
TO authenticated
USING (true);
