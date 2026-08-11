# 🧰 Strix

**Repo:** https://github.com/usestrix/strix
**Ubicación:** pipx (strix-agent v1.4.1) + ~/Projects/strix (no clonado aún)
**Estrellas:** ⭐ 49,580
**Licencia:** Apache 2.0
**Lenguaje:** Python
**Seguridad:** ✅ Seguro (7/7 patrones limpios, 2026-08-07)

## Descripción
Herramienta de pentesting AI autónomo. Agentes que hackean tu app como hackers reales: ejecutan código dinámicamente, encuentran vulnerabilidades y las validan con proofs-of-concept reales. Multi-agente (red team), dashboard local, CI/CD.

## Skills/Agentes
- CLI: `strix --target <local|url|repo>` — escanea código, URLs, APIs (OpenAPI/Swagger/Postman)
- `strix view` — dashboard local
- CI/CD: GitHub Actions integrado
- Modos: standard, quick, diff-scope
- Headless: `strix -n --target ...`

## Requisitos para usar
- **API key obligatoria**: LLM provider (OpenAI, Anthropic, Google Vertex, OpenRouter, Ollama local)
  - Config: `export STRIX_LLM="openai/gpt-5.4" && export LLM_API_KEY="sk-..."`
  - Ya tienes GEMINI_API_KEY — compatible via OpenRouter o Vertex AI
  - Alternativa gratuita: Ollama local (`ollama/llama4`)
- Instalado: `pipx install strix-agent` (v1.4.1 ✅)

## Uso en KREID
Security Auditor (🔒). Auditar la seguridad del store React/Vite, la API de Stripe, Supabase, el checkout. Escanear antes de deploy a producción.

## Asignado a
Orquestador → 🔒 Security Auditor (agente 9)
