-- =====================================================================
-- ESQUEMA DE BASE DE DATOS DE SUPABASE PARA MIGRACARE
-- =====================================================================
--
-- Ejecuta este script en el editor SQL de tu panel de Supabase
-- (SQL Editor > New Query) para crear la tabla y configurar
-- las políticas de seguridad (Row Level Security - RLS).
--

-- 1. Crear la tabla de episodios de migraña (headaches)
CREATE TABLE IF NOT EXISTS public.headaches (
    id TEXT PRIMARY KEY,                       -- ID único del episodio (UUID generado en el cliente o texto)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Relación con el usuario autenticado
    date DATE NOT NULL,                        -- Fecha del episodio
    time TEXT NOT NULL,                        -- Hora del episodio
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10), -- Intensidad del dolor (1-10)
    duration NUMERIC NOT NULL DEFAULT 0,       -- Duración en horas
    medications TEXT[] NOT NULL DEFAULT '{}',  -- Arreglo de medicamentos consumidos
    triggers TEXT[] NOT NULL DEFAULT '{}',     -- Arreglo de desencadenantes
    symptoms TEXT[] NOT NULL DEFAULT '{}',     -- Arreglo de síntomas experimentados
    notes TEXT DEFAULT '',                     -- Notas adicionales
    sleep_hours NUMERIC,                       -- Horas de sueño previas (opcional)
    stress_level INTEGER DEFAULT 3 CHECK (stress_level >= 1 AND stress_level <= 5), -- Nivel de estrés (1-5)
    mood TEXT DEFAULT '',                      -- Estado de ánimo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL -- Marca de tiempo de registro
);

-- 2. Habilitar la seguridad de nivel de fila (Row Level Security - RLS)
ALTER TABLE public.headaches ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Seguridad RLS para asegurar los datos médicos confidenciales del usuario

-- A. Política de Lectura (Select): Un usuario solo puede leer sus propios episodios
CREATE POLICY "Permitir lectura individual de episodios" 
ON public.headaches 
FOR SELECT 
USING (auth.uid() = user_id);

-- B. Política de Inserción (Insert): Un usuario solo puede registrar episodios asignados a su propio UID
CREATE POLICY "Permitir inserción de episodios propios" 
ON public.headaches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- C. Política de Actualización (Update): Un usuario solo puede modificar sus propios episodios
CREATE POLICY "Permitir actualización de episodios propios" 
ON public.headaches 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- D. Política de Eliminación (Delete): Un usuario solo puede borrar sus propios episodios
CREATE POLICY "Permitir eliminación de episodios propios" 
ON public.headaches 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Crear índices para optimizar búsquedas por usuario y fecha
CREATE INDEX IF NOT EXISTS headaches_user_id_idx ON public.headaches (user_id);
CREATE INDEX IF NOT EXISTS headaches_date_idx ON public.headaches (date DESC);
