import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hebploezmnsfhtutkouc.supabase.co'
const supabaseKey = 'TU_SUPABASE_ANON_KEY'

async function test() {
  console.log('Connecting to Supabase...')
  const db = createClient(supabaseUrl, supabaseKey)
  console.log('Querying last 5 analyses...')
  try {
    const { data, error } = await db
      .from('analyses')
      .select('id, url_original, score, verdict, threat_type, brand_spoofed, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    if (error) {
      console.log('Supabase Error:', error.message)
    } else {
      console.log('Supabase Success! Data:', JSON.stringify(data, null, 2))
    }
  } catch (err) {
    console.error('Exception:', err.message)
  }
}

test()

