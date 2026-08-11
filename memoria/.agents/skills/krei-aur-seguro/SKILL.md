---
name: krei-aur-seguro
description: Protocolo de seguridad para instalar paquetes AUR en Arch Linux. Inspecciona PKGBUILD, detecta malware, y decide GO/NO_GO antes de instalar.
---

# 🔒 Protocolo de Instalación AUR Segura - krei-aur-seguro

## Contexto
Tras breach masivo del AUR (12 Jun 2026, ~1,579 paquetes comprometidos), cada instalación AUR requiere inspección previa.

## Flujo

### Paso 1: Reputación (sin clonar)
- Ir a `https://aur.archlinux.org/packages/<paquete>`
- Verificar: mantenedor, votos (>10 preferible), popularidad, fecha creación
- Preferir mantenedores conocidos vs cuentas nuevas (<30 días)
- Leer comentarios del paquete (AUR评论区) —¿reportes de malware?

### Paso 2: Clonar PKGBUILD en sandbox
```bash
cd /tmp
git clone https://aur.archlinux.org/<paquete>.git aur-inspect
cd aur-inspect
cat PKGBUILD
```

### Paso 3: Escanear malware (red flags automáticas)
```bash
# 1. Source URL sospechosa
grep -E "^source=" PKGBUILD | grep -vE "github\.com|gitlab\.com|aur\.archlinux|pypi\.org"

# 2. SHA256 vacío o SKIP
grep "sha256sums.*SKIP\|sha256sums='(''" PKGBUILD

# 3. curl/wget pipe a shell en build() o package()
grep -E "curl.*\|.*bash\|wget.*\|.*sh\|curl.*\|.*sh" PKGBUILD

# 4. Descarga desde URL random (no dominio oficial)
grep -E "(bit\.ly|tinyurl|raw\.githubusercontent\.com/[a-z])" PKGBUILD

# 5. Archivos extraños en source (instaladores .exe, .sh no verificables)
grep "source=" PKGBUILD | grep -E "\.exe|\.sh|installer"

# 6. Ofuscación en scripts auxiliares
find . -type f -name "*.sh" -o -name "*.py" -o -name "*.patch" | xargs grep -l "base64\|eval\|exec\|\\\\x[0-9a-f]" 2>/dev/null
```

### Paso 4: Para paquetes `-bin` (pre-compilados)
- Source debe apuntar a **release oficial** del proyecto
- Ejemplo bueno: `brave-bin` → `https://github.com/brave/brave-browser/releases/...`
- Ejemplo malo: `https://random-cdn.xyz/download/package.deb`
- Verificar que SHA256 coincida con checksum oficial del proyecto

### Paso 5: Decisión
| Flags encontradas | Decisión |
|---|---|
| 0 | ✅ **GO** — instalar |
| 1-2 menores (sha256=SKIP pero source oficial) | ⚠️ **CONDICIONAL** — preguntar a Leo |
| 3+ o cualquier red flag de curl\|bash | 🛑 **NO_GO** — reportar y no instalar |

### Paso 6: Documentar en Obsidian (solo si GO)
Registrar en `/home/leo/obsidian-iti-leo/40-seguridad/aur-instalados.md`:
```markdown
| <paquete> | <tipo> | <votos> | <fecha-instalación> | ✅ |
```

### Paso 7: Script helper (futuro)
```bash
# ~/bin/aur-check <paquete>
# - clona PKGBUILD en /tmp/
# - corre todas las grep de red flags
# - imita score: 0-10 (10 = seguro)
```

## Output esperado

```markdown
# 🔒 AUR Check: <paquete>

**Paquete:** <nombre>
**Mantenedor:** <user>
**Votos:** ⭐ N
**Creado:** <fecha>

## PKGBUILD Analysis
- source=✅ Oficial / ❌ Sospechoso
- sha256sums=✅ Presente / ⚠️ SKIP / ❌ Ausente
- curl|bash=✅ No / ❌ Sí

## Red Flags
- (lista de hallazgos o "Ninguna")

## Decisión
**GO** / **NO_GO**
```

## Referencias
- Breach 12 Jun 2026: 1,579 paquetes AUR comprometidos
- Protocolo original: [[protocolo-integracion-repos]]
- Lista mantenida en: `40-seguridad/aur-instalados.md`
