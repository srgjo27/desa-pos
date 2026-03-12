import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured =
  supabaseUrl &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

if (!isConfigured) {
  console.warn(
    '[DesaPOS] ⚠️  Supabase belum dikonfigurasi.\n' +
    'Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env\n' +
    'Aplikasi berjalan dalam mode demo — login tidak akan berfungsi.'
  )
}

// Gunakan placeholder URL yang valid agar Supabase client tidak crash
// ketika env vars belum diisi (development awal / demo mode)
const resolvedUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co'
const resolvedKey = isConfigured ? supabaseAnonKey : 'placeholder-anon-key'

export const supabase = createClient(resolvedUrl, resolvedKey)
export const isSupabaseConfigured = isConfigured
