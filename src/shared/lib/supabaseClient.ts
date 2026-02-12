import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validación de variables de entorno en desarrollo
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ Supabase configuration warning:\n' +
      'VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not set.\n' +
      'The application will work with mock data only.'
    );
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper seguro para usar Supabase
 * Lanza error descriptivo si Supabase no está configurado
 */
export const safeSupabase = () => {
  if (!supabase) {
    throw new Error(
      'Supabase client is not initialized. ' +
      'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
  }
  return supabase;
};
