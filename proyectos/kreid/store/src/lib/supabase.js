import { createClient } from '@supabase/supabase-js'

const supabaseRawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseUrl = supabaseRawUrl.replace(/\/rest\/v1\/?$/, '')
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Auth ───────────────────────────────────────
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session, event)
  })
}

// ─── Products ────────────────────────────────────
export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*')
  if (error) throw error
  return data || []
}

export async function getProductById(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

// ─── Orders ──────────────────────────────────────
export async function createOrder(order) {
  const { data, error } = await supabase.from('orders').insert(order).select().single()
  if (error) throw error
  return data
}

export async function getMyOrders(userId) {
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ─── CJ Tracking ─────────────────────────────────
export async function getOrderTracking(orderId) {
  const { data, error } = await supabase.from('cj_orders').select('*').eq('order_id', orderId).maybeSingle()
  if (error) throw error
  return data
}

export async function getMyOrdersWithTracking(userId) {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, cj_orders(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return orders || []
}

// ─── Coupon ───────────────────────────────────────
export async function getCoupon(code) {
  const { data, error } = await supabase.from('coupons').select('*').eq('code', code).single()
  if (error) throw error
  return data
}

// ─── Profiles ────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  // Solo permite actualizar campos seguros (no id, no referral_code, no loyalty)
  const allowed = ['full_name', 'phone', 'address']
  const safe = {}
  for (const key of allowed) {
    if (key in updates) safe[key] = updates[key]
  }
  const { data, error } = await supabase
    .from('profiles')
    .update(safe)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function lookupReferralCode(code) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, referral_code')
    .eq('referral_code', code.toUpperCase())
    .single()
  if (error) return null
  return data
}

export async function applyReferralCode(userId, code) {
  const { error } = await supabase
    .from('profiles')
    .update({ referral_used: code.toUpperCase() })
    .eq('id', userId)
  if (error) throw error
}

export async function getLoyaltyStatus(userId) {
  // Verificar inactividad (21 días sin compra → reset)
  await supabase.rpc('check_loyalty_inactivity', { user_id: userId })

  const { data, error } = await supabase
    .from('profiles')
    .select('loyalty_points, loyalty_rewards_claimed')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function claimLoyaltyReward(userId) {
  const { data, error } = await supabase.rpc('claim_loyalty_reward', { user_id: userId })
  if (error) throw error
  return data
}
