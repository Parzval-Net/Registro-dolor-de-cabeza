import { createClient } from '@supabase/supabase-js';
import { HeadacheEntry } from '@/types/headache';

// Helper para obtener credenciales dinámicas de localStorage o variables de entorno
const getSupabaseConfig = () => {
  if (typeof window === 'undefined') {
    return { url: '', key: '' };
  }
  const savedUrl = localStorage.getItem('supabase-url') || '';
  const savedKey = localStorage.getItem('supabase-anon-key') || '';
  
  return {
    url: savedUrl.trim() || import.meta.env.VITE_SUPABASE_URL || '',
    key: savedKey.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
};

const initialConfig = getSupabaseConfig();

// Validar si la base de datos está totalmente configurada en el cliente (como bindings mutables let)
export let isSupabaseConfigured = 
  initialConfig.url.trim() !== '' && 
  initialConfig.key.trim() !== '' &&
  initialConfig.url !== 'tu_supabase_url_aqui' &&
  initialConfig.key !== 'tu_supabase_anon_key_aqui';

// Inicializar el cliente únicamente si las variables son correctas (como let)
export let supabase = isSupabaseConfigured
  ? createClient(initialConfig.url, initialConfig.key)
  : null;

/**
 * Re-inicializa el cliente de Supabase en tiempo de ejecución (ej. tras configurar en el panel de admin)
 */
export function reinitializeSupabase(): boolean {
  const config = getSupabaseConfig();
  const url = config.url.trim();
  const key = config.key.trim();
  
  const configured = 
    url !== '' && 
    key !== '' &&
    url !== 'tu_supabase_url_aqui' &&
    key !== 'tu_supabase_anon_key_aqui';
    
  isSupabaseConfigured = configured;
  supabase = configured ? createClient(url, key) : null;
  return configured;
}

// ========================================================
// SERVICIO DE PERSISTENCIA HÍBRIDA (SUPABASE / LOCAL)
// ========================================================

/**
 * Mapea un registro de HeadacheEntry local al formato de la tabla de Supabase (con snake_case)
 */
const mapToSupabase = (entry: HeadacheEntry, userId: string) => {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    time: entry.time,
    intensity: entry.intensity,
    duration: entry.duration || 0,
    medications: entry.medications,
    triggers: entry.triggers,
    symptoms: entry.symptoms,
    notes: entry.notes || '',
    sleep_hours: entry.sleepHours || null,
    stress_level: entry.stressLevel || 3,
    mood: entry.mood || ''
  };
};

/**
 * Mapea un registro de Supabase (snake_case) al formato HeadacheEntry local
 */
const mapFromSupabase = (row: any): HeadacheEntry => {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    intensity: row.intensity,
    duration: parseFloat(row.duration || 0),
    medications: Array.isArray(row.medications) ? row.medications : [],
    triggers: Array.isArray(row.triggers) ? row.triggers : [],
    symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
    notes: row.notes || '',
    sleepHours: row.sleep_hours !== null ? parseFloat(row.sleep_hours) : undefined,
    stressLevel: parseInt(row.stress_level || 3),
    mood: row.mood || ''
  };
};

/**
 * Obtener todos los episodios registrados para el usuario activo
 */
export async function getHeadacheEntries(userId: string): Promise<HeadacheEntry[]> {
  if (!isSupabaseConfigured || !supabase || userId.includes('@')) {
    return []; // Caer en local silenciosamente si la sesión del usuario es local (email)
  }

  const { data, error } = await supabase
    .from('headaches')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (error) {
    console.error('Error al descargar episodios de Supabase:', error);
    throw error;
  }

  return (data || []).map(mapFromSupabase);
}

/**
 * Guardar o actualizar un episodio en la nube
 */
export async function saveHeadacheEntry(userId: string, entry: HeadacheEntry): Promise<void> {
  if (!isSupabaseConfigured || !supabase || userId.includes('@')) {
    return; // Ignorar si es sesión local
  }

  const payload = mapToSupabase(entry, userId);

  // Utilizar upsert para insertar o actualizar según la clave primaria ID
  const { error } = await supabase
    .from('headaches')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Error al guardar episodio en Supabase:', error);
    throw error;
  }
}

/**
 * Eliminar un episodio en la nube
 */
export async function deleteHeadacheEntry(userId: string, entryId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || userId.includes('@')) {
    return; // Ignorar si es sesión local
  }

  const { error } = await supabase
    .from('headaches')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error al eliminar episodio en Supabase:', error);
    throw error;
  }
}

/**
 * Sincronizar migración masiva de LocalStorage a Supabase en el primer inicio de sesión
 */
export async function syncLocalEntriesToCloud(userId: string, localEntries: HeadacheEntry[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase || userId.includes('@') || localEntries.length === 0) {
    return; // Ignorar si es sesión local o no hay datos
  }

  const payloads = localEntries.map(e => mapToSupabase(e, userId));

  const { error } = await supabase
    .from('headaches')
    .upsert(payloads, { onConflict: 'id' });

  if (error) {
    console.error('Error al sincronizar local a la nube en Supabase:', error);
    throw error;
  }
}
