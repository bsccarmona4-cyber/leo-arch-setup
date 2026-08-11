# Memory Persistente

Skill para recordar preferencias, configuraciones y contexto entre sesiones.

## Mecanismo

CodeWhale tiene dos sistemas de memoria:
1. `note` — herramienta nativa para guardar notas persistentes
2. MCP Memory server — memoria semántica persistente configurada en mcp.json

## Cómo usarlo

### Guardar preferencias de usuario
Cuando el usuario dice una preferencia, guardarla con:
- `note` con contenido estructurado

### Ejemplo de nota de preferencias
```
[memory:usuario]
- lenguaje_preferido: español
- modo_trabajo: opus
- proyectos_frecuentes: ["guardian", "caveman", "kreid"]
- skills_favoritas: ["krei-arbol-pensante", "delegate"]
- no_usar: ["goose-superpoderes"]
```

### Recuperar en cada sesión
El `instructions.md` ya se inyecta cada turno. Para memoria adicional:
- Revisar notas existentes con `note` al inicio de la sesión
- Si hay memory MCP activo, consultar nodos relevantes

### Cuándo NO usarlo
- Para secrets (usa secrets.json)
- Para archivos temporales
- Para código (usa el repo)
