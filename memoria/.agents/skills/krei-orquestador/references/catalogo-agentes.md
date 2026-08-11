# Catálogo de Agentes KREI

17 agentes categorizados por dominio. Cada uno se invoca con `agent` pasando su tipo + skills asociadas.

---

## 🎨 1. Hallmark Designer
- **Tipo**: `plan` o `implementer`
- **Skills**: hallmark, theme-factory, brand-guidelines, canvas-design, image-enhancer, artifacts-builder, open-generative-ai, cast, paint, _jutsu, threejs-aaa-graphics-builder
- **Fuente skills**: hallmark/, composio, anthropic (frontend-design), Anil-matcha/Open-Generative-AI
- **Cuándo usarlo**: Diseño de landing pages, rediseños UI, auditorías visuales, extracción de diseño, branding, paletas de color, tipografía
- **Señales**: "diseña", "rediseña", "landing", "UI", "paleta", "branding", "hero", "CSS", "estilo visual", "audit design", "study this design"
- **Repo integrado**: `Anil-matcha/Open-Generative-AI` (25.8K ⭐) — estudio self-hosted de generación imagen/video, 500+ modelos (Flux, Midjourney, Kling, Sora, Veo), MIT. Para creativos on-brand sin límites de créditos. https://github.com/Anil-matcha/Open-Generative-AI

## ⚛️ 2. Frontend Implementer
- **Tipo**: `implementer`
- **Skills**: react-expert, nextjs-developer, typescript-pro, vue-expert, javascript-pro, cs-frontend-engineer, artifacts-builder, threejs-aaa-graphics-builder, threejs-debug-profiler
- **Fuente skills**: jeffallan, rezvani, composio, majidmanzarpour/threejs-game-skills
- **Cuándo usarlo**: Componentes React/Vue, estilos, layouts, state management, routing, Vite, Next.js
- **Señales**: "componente", "React", "Vue", "JSX", "TSX", "hook", "routing", "estado", "Tailwind", "responsive"

## ⚙️ 3. Backend Engineer
- **Tipo**: `implementer`
- **Skills**: api-designer, postgres-pro, python-pro, fastapi-expert, django-expert, golang-pro, rust-engineer, java-architect, graphql-architect, websocket-engineer, cs-backend-engineer
- **Fuente skills**: jeffallan, rezvani
- **Cuándo usarlo**: APIs REST/GraphQL, bases de datos, servidores, microservicios, Python, Rust, Go, Java
- **Señales**: "API", "endpoint", "base de datos", "SQL", "backend", "servidor", "microservicio", "ORM"

## 📱 4. Fullstack Builder
- **Tipo**: `implementer`
- **Skills**: fullstack-guardian, cs-fullstack-engineer, shopify-expert, wordpress-pro, feature-forge, saas-scaffolder, prototype
- **Fuente skills**: jeffallan, rezvani, mattpocock
- **Cuándo usarlo**: Apps completas front+back, Shopify, WordPress, prototipos rápidos, scaffolding
- **Señales**: "app completa", "Shopify", "WordPress", "fullstack", "prototipo", "scaffold"

## 🤖 5. DevOps Engineer
- **Tipo**: `implementer`
- **Skills**: cloud-architect, terraform-engineer, kubernetes-specialist, sre-engineer, monitoring-expert, chaos-engineer, cs-workspace-admin, docker-development
- **Fuente skills**: jeffallan, rezvani
- **Cuándo usarlo**: Infraestructura, CI/CD, Docker, Kubernetes, cloud (AWS/GCP/Azure), Terraform, monitoreo
- **Señales**: "deploy", "Docker", "Kubernetes", "CI/CD", "cloud", "infra", "Terraform", "monitoreo", "AWS"

## 📊 6. Growth Marketer
- **Tipo**: `plan` o `implementer`
- **Skills**: cs-demand-gen-specialist, cs-aeo, cs-content-creator, cs-growth-strategist, competitive-ads-extractor, competitive-teardown, content-research-writer, twitter-algorithm-optimizer, domain-name-brainstormer, open-seo
- **Fuente skills**: rezvani, composio, every-app/open-seo
- **Cuándo usarlo**: Marketing digital, ads, SEO, contenido, growth, investigación de competidores, estrategia de canales
- **Señales**: "marketing", "ads", "anuncios", "SEO", "contenido", "growth", "competidores", "campaña", "audiencia"
- **Repo integrado**: `every-app/open-seo` (10.8K ⭐) — alternativa open source a Semrush/Ahrefs: keyword research, site audit, backlinks, con MCP. TypeScript, MIT. https://github.com/every-app/open-seo

## 💰 7. Finance Analyst
- **Tipo**: `plan`
- **Skills**: cs-financial-analyst, finance-skills, financial-analyst, saas-metrics-coach, invoice-organizer
- **Fuente skills**: rezvani, composio
- **Cuándo usarlo**: Unit economics, márgenes, ROI, pricing, SaaS metrics, proyecciones financieras
- **Señales**: "finanzas", "margen", "ROI", "pricing", "costo", "unit economics", "proyección", "métrica SaaS"

## 📈 8. Product Manager
- **Tipo**: `plan` o `review`
- **Skills**: cs-product-manager, cs-product-strategist, cs-product-analyst, cs-agile-product-owner, cs-project-manager, product-manager-toolkit, product-strategist, to-prd, to-issues, triage, spec-to-repo, experiment-designer
- **Fuente skills**: rezvani, mattpocock
- **Cuándo usarlo**: PRDs, issues, roadmap, discovery, análisis de producto, experimentación, planificación
- **Señales**: "PRD", "roadmap", "issues", "producto", "discovery", "triage", "historias de usuario", "sprint"

## 🔒 9. Security Auditor
- **Tipo**: `review`
- **Skills**: security-reviewer, secure-code-guardian, cs-compliance-officer, cs-ai-act-compliance, cs-ciso-iso27001, cs-dpo-gdpr, cs-soc2-auditor, trail-of-bits-security, strix
- **Fuente skills**: jeffallan, rezvani, hesreallyhim, usestrix/strix
- **Cuándo usarlo**: Auditorías de seguridad, compliance (ISO, SOC2, GDPR), revisión de vulnerabilidades
- **Señales**: "seguridad", "auditoría", "vulnerabilidad", "compliance", "ISO", "GDPR", "SOC2", "pen test"
- **Repo integrado**: `usestrix/strix` (49.5K ⭐) — pentesting AI autónomo: agentes que hackean tu app, encuentran vulnerabilidades y las validan con PoCs reales. CLI: `strix --target`. Escanea código local, URLs, APIs (OpenAPI/Swagger/Postman), GitHub repos. Dashboard local, CI/CD. Python, Apache 2.0. Instalado vía pipx v1.4.1. https://github.com/usestrix/strix

## 🧪 10. QA Engineer
- **Tipo**: `verifier`
- **Skills**: test-master, playwright-expert, cs-karpathy-reviewer, code-reviewer, qa, tdd, webapp-testing, compound-engineering
- **Fuente skills**: jeffallan, rezvani, mattpocock, composio
- **Cuándo usarlo**: Tests unitarios/integración/E2E, code review, TDD, Playwright, debugging
- **Señales**: "test", "prueba", "QA", "TDD", "cobertura", "code review", "Playwright", "regresión"

## 💼 11. Executive Advisor
- **Tipo**: `plan`
- **Skills**: cs-ceo-advisor, cs-cto-advisor, cs-cfo-advisor, cs-cmo-advisor, solo-founder, startup-cto, the-fool, grill-me, cs-bizops-orchestrator, cs-commercial-orchestrator
- **Fuente skills**: rezvani, jeffallan, mattpocock
- **Cuándo usarlo**: Estrategia de negocio, decisiones ejecutivas, devil's advocate, grill-me sessions
- **Señales**: "estrategia", "negocio", "decisión", "C-level", "fundador", "startup", "devil's advocate", "cuestionar"

## 📝 12. Content Writer
- **Tipo**: `implementer`
- **Skills**: edit-article, writing-beats, writing-fragments, writing-shape, teach, content-strategist, code-documenter, changelog-generator, tailored-resume-generator, no-ai-slop
- **Fuente skills**: mattpocock, rezvani, jeffallan, composio, petergyang/no-ai-slop
- **Cuándo usarlo**: Artículos, documentación, edición, changelogs, currículums, enseñanza
- **Señales**: "artículo", "documentación", "editar", "changelog", "currículum", "escribir", "redactar"
- **Repo integrado**: `petergyang/no-ai-slop` (4.4K ⭐) — elimina 20+ patrones de "AI slop" de cualquier texto (escritura natural, sin clichés de IA). Python, MIT. https://github.com/petergyang/no-ai-slop

## 🔧 13. Productivity Hub
- **Tipo**: `plan` o `implementer`
- **Skills**: cs-capture, cs-andreessen, cs-reflect, cs-inbox-setup, cs-inbox-triage, cs-handoff-author, cs-workflow-architect, cs-skill-author, write-a-skill, file-organizer, meeting-insights-analyzer, superpowers, context-engineering-kit, i-have-adhd
- **Fuente skills**: rezvani, mattpocock, composio, hesreallyhim, ayghri/i-have-adhd
- **Cuándo usarlo**: Workflows, automatización, capture, handoffs, creación de skills, organización
- **Señales**: "workflow", "automatizar", "handoff", "capture", "skill", "organizar", "inbox"
- **Repo integrado**: `ayghri/i-have-adhd` (18K ⭐) — skill transversal: evita que el agente entierre la respuesta; output directo y accionable (ADHD-friendly). Aplica a TODOS los agentes del orquestador. Python, MIT. https://github.com/ayghri/i-have-adhd

## 🧠 14. Research Agent
- **Tipo**: `explore`
- **Skills**: cs-pulse, cs-research, cs-research-ops-orchestrator, cs-litreview, cs-notebooklm, cs-wiki-ingestor, cs-wiki-librarian, lead-research-assistant, langsmith-fetch, obsidian-vault
- **Fuente skills**: rezvani, composio, mattpocock
- **Cuándo usarlo**: Investigación de mercado, papers, wikis, análisis de datos, búsqueda
- **Señales**: "investiga", "research", "paper", "mercado", "datos", "wiki", "fuentes", "bibliografía"

## 🤝 15. Commercial Agent
- **Tipo**: `plan`
- **Skills**: cs-pricing-strategy, cs-deal-review, cs-commercial-policy, cs-channel-econ, cs-grill-commercial, cs-partner-tier, cs-rfp-respond, cs-commercial-forecast
- **Fuente skills**: rezvani
- **Cuándo usarlo**: Pricing, deals, canales, RFPs, forecasting comercial, partners
- **Señales**: "pricing", "deal", "canal", "RFP", "partner", "forecast", "comercial", "cotización"

## 🏗️ 16. MCP Developer
- **Tipo**: `implementer`
- **Skills**: mcp-server-builder, mcp-developer, mcp-builder, build-mcp-server, build-mcp-app, mcp-integration, atlassian-mcp, connect-apps, plugin-dev
- **Fuente skills**: rezvani, jeffallan, composio, anthropic
- **Cuándo usarlo**: Construir MCP servers, plugins, integraciones, APIs de conexión
- **Señales**: "MCP", "plugin", "integración", "server", "conectar", "API externa"

## 🔬 17. Senior Engineer
- **Tipo**: `plan`, `implementer`, o `review`
- **Skills**: cs-senior-engineer, cs-engineering-lead, architecture-designer, cs-karpathy-coder, code-tour, diagnose, improve-codebase-architecture, zoom-out, ubiquitous-language, grill-with-docs, review, migration-planner
- **Fuente skills**: rezvani, jeffallan, mattpocock
- **Cuándo usarlo**: Arquitectura compleja, refactors grandes, debugging profundo, decisiones de ingeniería
- **Señales**: "arquitectura", "refactor", "debugging difícil", "codebase", "migración", "diseño de sistema"
