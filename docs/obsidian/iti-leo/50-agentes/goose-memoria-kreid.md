# 🧠 GOOSE — Memoria del Proyecto KREID

## 📍 Fecha: 2026-06-01
## 📍 Última sesión activa: 2026-05-28 ~21:25 (Sesión 9 ✅ FINALIZADA)

---

## 🚀 ESTADO DEL PROYECTO — 100% FUNCIONAL

| Componente | URL | Estado |
|---|---|---|
| **Tienda** | https://goose-dropshipping.vercel.app | ✅ 200 OK |
| **Dashboard** | /dashboard | ✅ 200 OK |
| **Account** | /account | ✅ Login/registro + órdenes expandibles |
| **Checkout** | Stripe Checkout Session (test mode) | ✅ PCI-DSS compliant |
| **Webhook** | POST /api/webhook | ✅ Guarda órdenes en Supabase automáticamente |
| **GA4** | G-59P7VZSRYE | ✅ 8 eventos de tracking |
| **GitHub** | https://github.com/bsccarmona4-cyber/kreid-store | ✅ Último commit: `eabda7c` |

---

## ✅ ÚLTIMOS FIXES APLICADOS (Sesión 9)

| Bug | Fix |
|---|---|
| Carrito no se limpiaba post-compra | ✅ `clearCart()` forzado al montar Success |
| Scroll no volvía arriba al cambiar de página | ✅ Componente `ScrollToTop` en cada ruta |
| Diseño roto (Home.jsx refactorizado) | ✅ Restaurado Home.jsx original del commit `1d345ca` |

---

## 🔧 APIs y Keys

| API | Tipo | ¿Expuesta? |
|---|---|---|
| Supabase anon key | `"role": "anon"` | ✅ En frontend (segura por RLS) |
| Supabase service_role | `"role": "service_role"` | ❌ Solo serverless (`api/webhook.js`) |
| Stripe publishable (test) | `pk_test_...` | ✅ En frontend |
| Stripe secret (test) | `sk_test_...` | ❌ Solo serverless |
| Stripe webhook secret | `whsec_BAyFmVGlqVVD8afmHbgbIrRaPB8K0F9c` | ❌ Solo serverless |
| CJ Dropshipping | Access + Refresh Token | ❌ Solo scripts locales |
| Gemini API (NanoBanana) | API Key | ❌ Solo local |
| Google Cloud (Stitch) | Proyecto + OAuth | ❌ Solo local |

**Backup de keys críticas:** `/home/leo/.env-keys-backup.txt`

---

## 🛒 Productos — 8 CJ Reales

| Producto | Costo CJ | Precio Venta | Margen | Pedidos CJ |
|---|---|---|---|---|
| CD Slot Phone Mount | $11.91 | $33.35 | 48.5% | 547 |
| Car Air Vent Phone Holder | $13.51 | $37.83 | 50.0% | 456 |
| Car Magnetic Phone Holder | $15.56 | $43.57 | 51.5% | 321 |
| Car Charger PD 36W | $11.92 | $33.38 | 48.5% | 394 |
| Car Charger PD 30W | $10.61 | $29.71 | 46.9% | 331 |
| Car Trunk Organizer | $9.33 | $26.12 | 44.9% | 429 |
| Portable Jump Starter 2000A | $34.76 | $97.33 | 61.1% | 197 |
| Jump Starter Power Bank Pro 3000A | $42.43 | $118.80 | 61.1% | 194 |

**Fórmula:** Precio = costo CJ × 2.8 | Free shipping ≥ $45 | Margen mínimo 35%

---

## 🔒 Seguridad aplicada

| Medida | Detalle |
|---|---|
| Anon key corregida | Se reemplazó service_role por la anon real ✅ |
| CORS restringido | Solo goose-dropshipping.vercel.app y localhost ✅ |
| Headers seguridad | nosniff, DENY, XSS-Protection, Referrer-Policy ✅ |
| Webhook firma | constructEvent OBLIGATORIO (sin fallback dev) ✅ |
| service_role key | Solo en serverless, no en frontend ✅ |
| Secrets | .env en .gitignore, backup en /home/leo/ ✅ |

---

## 📋 PENDIENTES — Próxima sesión

| # | Prioridad | Tarea |
|---|---|---|
| 🖼️ | **Alta** | Generar imágenes realistas para 8 productos con Gemini (NanoBanana) |
| 💳 | **Alta** | Activar Stripe producción (pk_live_ + sk_live_) |
| 🚚 | **Alta** | Conectar CJ Dropshipping — órdenes automáticas + tracking en /account |

---

## 📁 Datos del proyecto

| Recurso | Ruta |
|---|---|
| **Código** | `/home/leo/goose-dropshipping/` |
| **Scripts** | `scripts/buscar-productos-cj.py`, `generar-imagenes-gemini.py`, `unit-economics.py`, `insertar-productos-supabase.py` |
| **Último commit** | `eabda7c` — ScrollToTop + Success fix + vercel.json |
| **Prompts imágenes** | `20-dropshipping/prompts-imagenes.md` |
| **Análisis competitivo** | `20-dropshipping/analisis-competitivo-amazon.md` |

---

## 📁 Notas relacionadas en esta bóveda

- `50-agentes/historial-sesiones.md` — Cronología completa de todas las sesiones
- `50-agentes/00-indice-agentes.md` — Skills y subagentes instalados
- `20-dropshipping/vision-general.md` — Visión del proyecto KREI
- `20-dropshipping/01-grill-dropshipping.md` — Notas de dropshipping
- `20-dropshipping/psicologia-color-ecommerce.md` — Psicología del color aplicada
- `30-arsenal/` — Skills externos instalados
