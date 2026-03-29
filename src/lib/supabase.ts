import { createClient } from '@supabase/supabase-js';

// 🔍 DEBUG: check if env variables are coming
console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🚨 if missing → show error
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase ENV variables missing 🚨");
}

// ✅ create client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
