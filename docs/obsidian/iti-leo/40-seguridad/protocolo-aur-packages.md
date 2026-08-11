---
tags: [seguridad, protocolo, aur, arch-linux]
---

# 🔒 Protocolo de Instalación AUR Segura

**Skill asociada:** `krei-aur-seguro`

## Flujo completo

1. Leo pide instalar paquete AUR
2. Goose ejecuta protocolo antes de `yay -S`
3. Si ✅ → instala
4. Si ❌ → reporta y no instala

## Checklist pre-instalación

### 1. Reputación
- [ ] Mantenedor conocido / paquetes previos legítimos
- [ ] Votos > 10 (preferible > 50)
- [ ] Popularidad positiva en `pikaur -Pp` o AUR评论区
- [ ] Paquete existe > 30 días (no recién creado)

### 2. PKGBUILD — Red flags automáticas
- [ ] `source` apunta a dominio no oficial / acortador / random
- [ ] `sha256sums` = `SKIP`
- [ ] `curl \| bash` o `wget -O- \| sh` en build() o package()
- [ ] Descarga binarios desde URL que no es el release oficial del proyecto
- [ ] `source` usa `https://github.com/<randomuser>/<repo>/releases/...` (no verificable)
- [ ] Dependencias extrañas no relacionadas al proyecto

### 3. Para paquetes `-bin`
- [ ] Source = web oficial del proyecto (Brave → github.com/brave, Google → dl.google.com)
- [ ] SHA256 coincide con el release checksum oficial
- [ ] No hay script injection en package() (solo copia binarios)

### 4. Para paquetes que compilan desde fuente (`git`, sin sufijo)
- [ ] PKGBUILD build() no llama URLs externas
- [ ] No hay patches descargados de fuentes no oficiales
- [ ] Validar que la URL de git clone es el repo oficial del proyecto

## Comandos útiles

```bash
# Ver PKGBUILD sin instalar
git clone https://aur.archlinux.org/<paquete>.git /tmp/aur-check
cat /tmp/aur-check/PKGBUILD

# Buscar red flags
grep -E "^(source=|sha256sums|curl |wget |\|\s*(bash|sh))" /tmp/aur-check/PKGBUILD

# Ver metadata del paquete
yay -Qi <paquete> | grep -E "Packager|Version|Repository"
# si dice "aur" → del AUR
# Packager debe ser "Unknown Package" (AUR) o un dev conocido

# Ver votos
# Con yay: revisar comentarios en aur.archlinux.org/packages/<paquete>
```

## Acción post-breach (12 Jun 2026)

Si instalaste paquete AUR durante breach (12 Jun), también reinstalar:

```bash
yay -Sua  # Actualiza solo AUR packages
yay -Yc   # Limpia caché viejo
```

## Skills integradas (AUR paquetes en este equipo)

| Paquete | Tipo | Votos | Última verificación |
|---------|------|-------|-------------------|
| brave-bin | -bin | Alto | Pre-breach ✅ |
| google-chrome | -bin | Alto | Pre-breach ✅ |
| visual-studio-code-bin | -bin | Alto | Pre-breach ✅ |
| ngrok | -bin | Alto | Pre-breach ✅ |
| eww | fuente | Medio | Pre-breach ✅ |
| swayosd-git | -git | Medio | Pre-breach ✅ |
| yay | fuente | Alto | Pre-breach ✅ |

## Herramientas futuras por construir

- [ ] Script `aur-check` que clona PKGBUILD + escanea red flags automático
- [ ] Integrar en `cavecrew` como subagente `krei-aur-seguro`
