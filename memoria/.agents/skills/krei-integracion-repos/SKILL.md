---
name: krei-integracion-repos
description: Protocolo de seguridad para integrar nuevos repositorios de skills/plugins desde GitHub. Escanea malware, documenta y guarda en Obsidian automáticamente.
---

# 🔒 Protocolo de Integración de Repos GitHub

## Paso 1: Inspección previa (sin clonar)
- Revisar: nombre, descripción, autor, ⭐ stars, forks, última actualización
- Verificar reputación del autor (Matt Pocock ✅, Rezvani ✅, Anthropic ✅)
- Buscar issues abiertos sobre seguridad

## Paso 2: Clonar en sandbox (`/tmp/`)
```bash
cd /tmp
git clone <URL_DEL_REPO> repo-inspect
cd repo-inspect
```

## Paso 3: Análisis de malware
Buscar estos patrones en **todos los archivos**:
```bash
# Comandos peligrosos
grep -rn "curl.*|.*bash" --include="*.sh" --include="*.md" --include="*.py" .
grep -rn "wget.*|.*sh" --include="*" .
grep -rn "eval(" --include="*.py" --include="*.js" .
grep -rn "exec(" --include="*.py" --include="*.js" .
grep -rn "base64" --include="*.py" --include="*.js" --include="*.sh" .
grep -rn "chmod.*\+x" --include="*.sh" --include="*.md" .

# Tokens/API keys hardcodeadas
grep -rn "sk_test\|sk_live\|ghp_\|gho_\|AKIA" --include="*" .

# Ofuscación
grep -rn "\\\\x[0-9a-f]" --include="*.py" --include="*.js" .
```

## Paso 4: Ver estructura
```bash
tree -L 2
# Identificar: skills/, agents/, plugins/, scripts/
```

## Paso 5: Decisión
- ✅ **Seguro** → Integrar
- ❌ **Sospechoso** → Reportar y NO integrar

## Paso 6: Guardar en Obsidian
Crear archivo en `/home/leo/obsidian-iti-leo/30-arsenal/<nombre-repo>.md` con:
- URL del repo
- ⭐ Stars
- 📝 Descripción
- 📂 Estructura
- ✅ Estado de seguridad
- 📋 Lista de skills/agentes/plugins encontrados

## Paso 7: Integrar en arsenal maestro
Actualizar `goose-skills-arsenal` para incluir los nuevos skills encontrados.

## Output esperado
```markdown
# 🧰 <Nombre del Repo>

**Repo:** <URL>
**Ubicación:** <path>
**Estrellas:** ⭐ X,XXX
**Seguridad:** ✅ Seguro / ❌ No seguro

## Skills/Agentes
- ...
```
