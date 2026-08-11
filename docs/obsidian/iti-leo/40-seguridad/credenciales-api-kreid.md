# 🔐 Credenciales de API — Proyecto KREID

> **⚠️ Este archivo es SOLO para referencia.** Las keys reales están en `/home/leo/goose-dropshipping/.env` (protegido por `.gitignore`).

## 📋 Resumen de APIs Configuradas

| Servicio | Key/ID | Ubicación | Estado |
|----------|--------|-----------|--------|
| **Supabase** | URL + anon key | `.env` | ✅ Activa |
| **Stripe** (test) | `sk_test_...` | `.env` | ✅ Activa |
| **CJ Dropshipping** | App Key + Access Token | `.env` | ✅ Activa |
| **GitHub** | Token personal | `.env` | ✅ Activo |
| **Gemini API** (NanoBanana) | API Key | `.env` | ✅ Activa |
| **Google Cloud** (Stitch) | Project ID + OAuth ADC | `.env` + `~/.config/gcloud/` | ✅ Activo |

---

## 🖼️ NanoBanana (Gemini Image Generation)

- **Servicio:** Google Gemini API
- **MCP Server:** `@mindstone/mcp-server-nano-banana` v0.3.2
- **Key en:** `.env` → `GEMINI_API_KEY`
- **Tools:** `nano_banana_generate`, `nano_banana_edit`, `configure_nano_banana_api_key`
- **Modelos:** `gemini-3.1-flash-image-preview` (Nano Banana 2), `gemini-3-pro-image-preview` (Pro)
- **Consigue key:** https://aistudio.google.com/api-keys
- **Instalación:** `npm install @mindstone/mcp-server-nano-banana`

---

## 🎨 Google Stitch (UI/UX Design)

- **Servicio:** Google Stitch API (AI-powered UI/UX design)
- **MCP Server:** `stitch-mcp` v1.3.2
- **Project ID en:** `.env` → `GOOGLE_CLOUD_PROJECT`
- **Autenticación:** OAuth via `gcloud auth application-default login`
- **Project ID:** `daring-charmer-493018-n4`
- **API:** Stitch API (ya habilitada en Google Cloud Console)
- **Tools:** 16 tools (crear proyectos, generar screens, design systems, variantes)
- **Endpoint API:** `https://stitch.googleapis.com/mcp`
- **Instalación:** `npm install stitch-mcp`

---

## 🛒 CJ Dropshipping

- **App Key:** `CJ5454517`
- **Email:** `api@80a329ca12224b7b95e2174b2f5ca5e8`
- **Access Token:** Generado automáticamente (en `.env`)
- **Refresh Token:** En `.env`
- **API Base:** `https://developers.cjdropshipping.com/api2.0/v1/`
- **Rate Limit:** ~1 req/1.5s
- **Endpoints útiles:**
  - `POST /authentication/getAccessToken` — Obtener token JWT
  - `GET /product/list` — Listar productos
  - `GET /product/listV2` — Versión alt

---

## 💳 Stripe (Test)

- **Public Key:** `pk_test_51TbpDb...`
- **Secret Key:** `sk_test_51TbpDb...`
- **Modo:** Test
- **Endpoints:** Checkout Session estándar

---

## 🗄️ Supabase

- **URL:** `https://tvntylcgdjvgvvjcavkp.supabase.co`
- **Anon Key:** En `.env` (pública por diseño, protegida por RLS)
- **Service Role Key:** ⚠️ **NO GUARDAR AQUÍ** — Solo en `.env` para scripts internos
- **DB Password:** ⚠️ **NO GUARDAR AQUÍ** — Solo en el dashboard de Supabase
- **Tablas:** `products`, `orders`, `profiles`, `order_items`, `analytics_daily`, `product_analytics`, `alerts_config`, `alerts_log`, `site_visits`, `abandoned_carts`
- **Seguridad:** RLS policies activas en todas las tablas

---

## 🐙 GitHub

- **Token:** `ghp_...` en `.env`
- **Repo local:** `/home/leo/goose-dropshipping/`
- **Pendiente:** Crear repo remoto y pushear

---

## 🛡️ Seguridad

- ✅ `.env` está en `.gitignore`
- ✅ Keys solo en máquina local
- ⚠️ **No compartir, no subir, no exponer**
- ⚠️ Si una key se compromete → revocar inmediatamente desde el panel del servicio
