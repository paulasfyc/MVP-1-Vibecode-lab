import { createClient } from '@supabase/supabase-js';

// Usamos un patrón de Singleton para evitar múltiples instancias del cliente en desarrollo
let supabaseClient = null;

export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Faltan las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    // Para evitar errores fatales en tiempo de construcción si no están definidas
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
};
