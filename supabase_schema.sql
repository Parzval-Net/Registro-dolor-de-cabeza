-- =====================================================================
-- ESQUEMA DE BASE DE DATOS DE SUPABASE PARA MIGRACARE (ESTÁNDAR PRO)
-- =====================================================================
--
-- Ejecuta este script en el editor SQL de tu panel de Supabase
-- (SQL Editor > New Query) para estructurar tu base de datos y configurar
-- las políticas de seguridad de nivel de fila (Row Level Security - RLS).
--

-- ==========================================
-- 1. TABLA DE PERFILES DE PACIENTES (public.profiles)
-- ==========================================
-- Sincroniza y almacena de forma estructurada los metadatos de los usuarios
-- registrados a través de Supabase Auth (nombre, foto de perfil, etc.)

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Paciente',
    avatar TEXT NOT NULL DEFAULT 'calm-mind',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en la tabla de perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para la tabla public.profiles
CREATE POLICY "Permitir lectura de perfiles propios y públicos" 
ON public.profiles FOR SELECT 
USING (true); -- Cualquiera puede ver nombres públicos de pacientes

CREATE POLICY "Permitir a cada usuario actualizar su propio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- ==========================================
-- 2. TABLA DE EPISODIOS CLÍNICOS (public.headaches)
-- ==========================================
-- Almacena todo el historial de dolores de cabeza, medicamentos, triggers y síntomas.

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

-- Habilitar RLS en la tabla de dolores
ALTER TABLE public.headaches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para public.headaches (Datos Médicos Confidenciales)
CREATE POLICY "Permitir lectura de episodios propios" 
ON public.headaches FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserción de episodios propios" 
ON public.headaches FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir actualización de episodios propios" 
ON public.headaches FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- D. Política de Eliminación (Delete): Un usuario solo puede borrar sus propios episodios
CREATE POLICY "Permitir eliminación de episodios propios" 
ON public.headaches FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para optimizar búsquedas por usuario y ordenación de fecha
CREATE INDEX IF NOT EXISTS headaches_user_id_idx ON public.headaches (user_id);
CREATE INDEX IF NOT EXISTS headaches_date_idx ON public.headaches (date DESC);

-- ==========================================
-- 3. GESTOR DE CREACIÓN AUTOMÁTICA DE PERFILES (TRIGGER & FUNCTION)
-- ==========================================
-- Cuando un usuario se registra en Supabase Auth, esta función captura sus metadatos
-- (Name y Avatar) e inserta automáticamente una fila estructurada en public.profiles.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Paciente'),
        COALESCE(new.raw_user_meta_data->>'avatar', 'calm-mind')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador que ejecuta la función al insertar un usuario en auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
