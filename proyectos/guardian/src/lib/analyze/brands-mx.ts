// Marcas mexicanas más suplantadas + teléfonos oficiales
export const MEXICAN_BRANDS = [
  { name: 'BBVA', domains: ['bbva.mx', 'bbvanet.mx', 'bbva.com.mx'], phone: '800-226-2663' },
  { name: 'Banamex', domains: ['banamex.com', 'banamex.com.mx'], phone: '800-226-2638' },
  { name: 'HSBC', domains: ['hsbc.com.mx'], phone: '800-226-6383' },
  { name: 'Santander', domains: ['santander.com.mx', 'supernet.com.mx'], phone: '800-715-1111' },
  { name: 'Banorte', domains: ['banorte.com', 'banorte.com.mx'], phone: '800-226-6783' },
  { name: 'Walmart', domains: ['walmart.com.mx', 'walmartmx.com'], phone: '800-710-4545' },
  { name: 'Liverpool', domains: ['liverpool.com.mx'], phone: '800-718-8888' },
  { name: 'Amazon', domains: ['amazon.com.mx', 'amazon.mx'], phone: '800-802-0000' },
  { name: 'Mercado Libre', domains: ['mercadolibre.com.mx'], phone: '800-444-4555' },
  { name: 'Oxxo', domains: ['oxxo.com', 'oxxo.com.mx'], phone: '800-718-8888' },
  { name: 'SAT', domains: ['sat.gob.mx'], phone: null },
  { name: 'IMSS', domains: ['imss.gob.mx'], phone: '800-623-2323' },
  { name: 'Telmex', domains: ['telmex.com', 'telmex.com.mx', 'infinitum.com.mx'], phone: '800-123-0000' },
  { name: 'CFE', domains: ['cfe.mx', 'cfegob.mx'], phone: '800-466-9876' },
]

// Palabras de urgencia comunes en estafas MX
export const URGENCY_KEYWORDS = [
  'gratis', 'último día', 'suspendida', 'ganaste', 'premio', 'urgente',
  'limitado', 'sorteo', 'despensa', 'apoyo', 'gobierno', 'bono',
  'cashback', 'devolución', 'reembolso', 'verifica tu cuenta',
  'actualiza tus datos', 'cuenta bloqueada', 'sesión expirada',
  'oportunidad única', 'solo hoy', 'últimas unidades',
]

// Palabras de datos sensibles
export const SENSITIVE_DATA_KEYWORDS = [
  'curp', 'rfc', 'número de tarjeta', 'nip', 'contraseña', 'password',
  'cvv', 'cvc', 'clave interbancaria', 'cuenta bancaria', 'token',
  'ine', 'ife', 'número de seguro social', 'nss',
]
