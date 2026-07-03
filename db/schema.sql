-- ============================================================
-- AutoYa — Schema SQL (pegar en Supabase SQL Editor)
-- ============================================================

-- 1. Tabla de usuarios (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  rol        TEXT NOT NULL CHECK (rol IN ('role_admin','role_ventas','role_gestoria')),
  activo     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de vehículos
CREATE TABLE IF NOT EXISTS public.vehiculos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand       TEXT NOT NULL,
  model       TEXT NOT NULL,
  version     TEXT,
  year        INT,
  condition   TEXT CHECK (condition IN ('0km','Usado')),
  km          INT DEFAULT 0,
  body_type   TEXT,
  fuel_type   TEXT,
  precio_ars  BIGINT NOT NULL,  -- SIEMPRE INTEGER, nunca float
  color       TEXT,
  estado      TEXT DEFAULT 'disponible' CHECK (estado IN ('disponible','reservado','vendido')),
  image_url   TEXT,
  featured    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Trámites de transferencia
CREATE TABLE IF NOT EXISTS public.tramites_legales (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id  UUID REFERENCES public.vehiculos(id),
  comprador_nombre TEXT,
  comprador_dni    TEXT,
  comprador_cuil   TEXT,
  comprador_email  TEXT,
  estado       TEXT DEFAULT 'reserva' CHECK (estado IN ('reserva','validacion','formulario08','finalizado')),
  dni_data     JSONB,        -- JSON extraído por OCR de Gemini
  storage_path TEXT,         -- ruta privada en Supabase Storage
  notas        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE public.usuarios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramites_legales ENABLE ROW LEVEL SECURITY;

-- vehiculos: lectura pública, escritura solo admin
CREATE POLICY "vehiculos_public_read"  ON public.vehiculos FOR SELECT USING (true);
CREATE POLICY "vehiculos_admin_write"  ON public.vehiculos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'role_admin'));

-- tramites_legales: solo gestoria y admin
CREATE POLICY "tramites_gestoria_admin" ON public.tramites_legales FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol IN ('role_gestoria','role_admin')
  ));

-- usuarios: solo admin puede ver/editar todos; cada usuario ve el suyo
CREATE POLICY "usuarios_self_read" ON public.usuarios FOR SELECT USING (id = auth.uid());
CREATE POLICY "usuarios_admin_all" ON public.usuarios FOR ALL
  USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'role_admin'));

-- ── Supabase Storage: bucket privado para DNIs ────────────────
-- Crear en: Storage → New Bucket → nombre: "documentos" → Private ✅
-- La policy se configura en el dashboard de Supabase Storage.

-- ── Función: auto-update updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehiculos_updated_at
  BEFORE UPDATE ON public.vehiculos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tramites_updated_at
  BEFORE UPDATE ON public.tramites_legales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Memoria Vectorial (pgvector) para Asesor Premium ──────────
-- Habilitar extensión de vectores si no está habilitada
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.chat_memoria (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL,
  mensaje     TEXT NOT NULL,
  rol         TEXT NOT NULL CHECK (rol IN ('user','assistant')),
  embedding   vector(768),   -- vector para text-embedding-004 de Gemini
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Índice de coseno similitud para acelerar consultas vectoriales
CREATE INDEX IF NOT EXISTS chat_memoria_embedding_idx 
  ON public.chat_memoria 
  USING ivfflat (embedding vector_cosine_ops);

-- Función RPC para buscar recuerdos por distancia coseno
CREATE OR REPLACE FUNCTION public.buscar_memorias_chat (
  query_session_id TEXT,
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  mensaje TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chat_memoria.id,
    chat_memoria.mensaje,
    1 - (chat_memoria.embedding <=> query_embedding) AS similarity
  FROM chat_memoria
  WHERE chat_memoria.session_id = query_session_id
    AND chat_memoria.rol = 'user'
    AND chat_memoria.embedding IS NOT NULL
    AND 1 - (chat_memoria.embedding <=> query_embedding) > match_threshold
  ORDER BY chat_memoria.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
