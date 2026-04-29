import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function validateSupabaseEnv() {
  const errors = []

  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL tidak ditemukan dalam .env')
  } else if (supabaseUrl === 'YOUR_SUPABASE_URL') {
    errors.push('VITE_SUPABASE_URL masih menggunakan placeholder (YOUR_SUPABASE_URL)')
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL harus dimulai dengan https://')
  }

  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY tidak ditemukan dalam .env')
  } else if (supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    errors.push('VITE_SUPABASE_ANON_KEY masih menggunakan placeholder')
  } else if (supabaseAnonKey.length < 20) {
    errors.push('VITE_SUPABASE_ANON_KEY tampak tidak valid (terlalu pendek)')
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      message: `Konfigurasi Supabase Tidak Valid:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\nLangkah:\n1. Buka https://app.supabase.com/project/[project-id]/settings/api\n2. Copy 'URL' ke VITE_SUPABASE_URL\n3. Copy 'anon public' ke VITE_SUPABASE_ANON_KEY\n4. Paste ke file .env`
    }
  }

  return {
    isValid: true,
    errors: [],
    message: 'Konfigurasi Supabase valid'
  }
}

const validation = validateSupabaseEnv()
const isConfigured = validation.isValid

if (!isConfigured) {
  console.error(validation.message)
  if (typeof window !== 'undefined') {
    console.warn(
      '[DesaPOS] Aplikasi akan berjalan dalam mode demo tanpa Supabase.\n' +
      'Fitur login dan data persistence tidak akan berfungsi.'
    )
  }
}

const resolvedUrl = isConfigured ? supabaseUrl : ''
const resolvedKey = isConfigured ? supabaseAnonKey : ''

export { isConfigured, validateSupabaseEnv }
export const supabase = createClient(resolvedUrl, resolvedKey)
export const isSupabaseConfigured = isConfigured