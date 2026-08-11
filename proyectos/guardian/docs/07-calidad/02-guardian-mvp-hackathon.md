# 🛡️ Guardián — MVP Hackathon (Tópicos de Calidad)

## Proyecto

Sistema detección fraudes digitales para adultos mayores México.
Dos canales: WhatsApp + Email.
Análisis multi-señal + LLM (DeepSeek + Groq fallback).
MVP construido 2026-06-09/10 para hackathon.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 + Tailwind 4 + PWA |
| Backend | Next.js API Routes |
| DB | Supabase (PostgreSQL + Realtime) |
| LLM principal | DeepSeek Chat |
| Fallback LLM | Groq (llama-3.3-70b) |
| WhatsApp | OpenWA (Baileys/web.js) vía Docker |
| Hosting | Vercel |
| Repo | `~/secure/guardian/` |

## Pipeline análisis (6 capas)

1. Resolución URL (redirect chain, max 10 saltos)
2. Score multi-señal (WHOIS, PhishTank, Levenshtein brands MX, SSL, formularios, urgencia)
3. LLM semántico (DeepSeek → fallback Groq)
4. Fusión score + LLM
5. Caché 24h en Supabase
6. Respuesta formateada por canal

## Hardening implementado

- Zod schemas en API routes
- Validación método HTTP (405) + Content-Type (415)
- Sanitización body (control chars, max 100KB)
- Rate limit por IP via Supabase (sha256, 10/min)
- Security headers (X-Content-Type-Options, X-Frame-Options, CSP)
- Prompt injection: delimitadores <CONTENIDO_EXTERNO>, 11 patrones detectados, validation zod
- LLM input truncado: URLs 500 chars, emails 3000 chars
- Errores genéricos (sin stack, sin rutas, sin keys)
- SSRF protection (private ranges bloqueados)

## Endpoints API

- `POST /api/analyze` → pipeline completo (content, channel, userHash)
- `POST /api/webhook/whatsapp` → mensajes entrantes WhatsApp
- `POST /api/webhook/email` → Gmail Pub/Sub
- `GET /api/stats` → estadísticas dashboard

## Schema Supabase

Tablas: `analyses`, `url_cache`, `user_context`, `rate_limits`
Función: `increment_analysis_count`

## WhatsApp

OpenWA (NestJS + whatsapp-web.js) en Docker.
Sesión: `guardian` (UUID), status disconnected.
Número: 5217293011343.
Error: network_mode en Docker. Webhook configurado pero no llega.

## Deploy

Vercel: guardian-indol.vercel.app
Último deploy: 2026-06-10

## Pendientes

- [x] Docker build + container corriendo
- [ ] Escanear QR con WhatsApp (5217293011343)
- [ ] Probar respuesta automática
- [ ] Webhook WhatsApp (Docker network)
- [ ] Dashboard Realtime con Supabase
- [ ] README.md
- [ ] Deck presentación
- [ ] Mapa de calor MX (descartado)

## Apéndice: Keys

- Supabase: hebploezmnsfhtutkouc (3 keys)
- DeepSeek: TU_DEEPSEEK_KEY
- Groq: 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
- OpenWA: dev-admin-key
