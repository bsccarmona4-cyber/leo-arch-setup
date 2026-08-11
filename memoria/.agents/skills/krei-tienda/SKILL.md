---
name: krei-tienda
description: Storefront KREI en React + Vite + Stripe + Supabase. Desarrollo de páginas, carrito, checkout y conexión con APIs.
---

# 🛒 KREI — Tienda Dropshipping

## Stack
- **Frontend**: React 19 + Vite 6 + React Router 7
- **Pagos**: Stripe (test mode)
- **Base de datos**: Supabase
- **Estilo**: Dark mode, tema KREI (púrpura + cyan)
- **Host**: `localhost:3000` (dev)

## Rutas definidas
| Ruta | Página | Estado |
|---|---|---|
| `/` | Home | ❌ No existe |
| `/products` | Catálogo | ❌ No existe |
| `/products/:id` | Detalle producto | ❌ No existe |
| `/cart` | Carrito | ❌ No existe |
| `/checkout` | Checkout con Stripe | ❌ No existe |
| `/success` | Confirmación pago | ❌ No existe |

## APIs configuradas en `.env`
- Supabase (URL + anon key)
- Stripe (publishable + secret)
- GitHub token

## Pendiente CJ Dropshipping
- Crear tienda en CJ para liberar API key
- Sync automático de productos

## Skills/agentes relacionados
- `frontend-design` (Anthropic) para UI
- `feature-dev` (Anthropic) para desarrollo
- `cs-fullstack-engineer` para implementación
