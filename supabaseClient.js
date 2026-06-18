import { createClient } from '@supabase/supabase-js'

// read from environment so the project works both locally and on Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'As variáveis de ambiente do Supabase estão faltando. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local ou no ambiente de hospedagem.'
  )
}

// Create client only if keys are available
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(
  supabaseUrl,
  supabaseAnonKey
) : null