# Project Code Graph

Skill para mapear y entender la estructura completa de cualquier proyecto.

## Uso

Cuando necesites entender un proyecto o encontrar dependencias entre módulos:

### 1. Mapa rápido del proyecto
```markdown
- `file_search` para encontrar archivos clave por tipo
- `list_dir` para estructura de directorios
- `grep_files` para encontrar entry points, imports, exports
```

### 2. Análisis de dependencias
Busca patrones de import/require/use entre archivos para construir el grafo.

### 3. Entry points
Identifica: main.rs, index.js, package.json:main, pyproject.toml, etc.

### 4. Reporte
```
📁 Estructura: {n} dirs, {n} files
🔗 Dependencias: {A} → {B}, {C} → {D}
🎯 Entry points: {paths}
⚠️ Archivos huérfanos: {paths}
```

### Herramientas usadas
- `file_search` — búsqueda por nombre/patrón
- `list_dir` — estructura de directorios
- `grep_files` — regex en contenido
- Sub-agentes explore para análisis paralelo de módulos
