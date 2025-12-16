
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:');
console.log('  URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ MISSING');
console.log('  Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Faltan las variables de entorno de Supabase!');
  console.error('   Asegúrate de tener .env.local con:');
  console.error('   VITE_SUPABASE_URL=tu_url');
  console.error('   VITE_SUPABASE_ANON_KEY=tu_key');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
console.log('✅ Supabase client created');
