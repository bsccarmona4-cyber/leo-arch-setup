#!/usr/bin/env bash
# ============================================================
#  EXPORTAR LAP — migración a laptop nueva (Arch Linux)
#  Sin dependencias externas (tar/cp) y sin sudo.
#  Uso:  ./exportar-lap.sh                 → backup en ~/backup-lap-FECHA
#        ./exportar-lap.sh /mnt/usb        → backup directo a disco USB
# ============================================================
set -euo pipefail

FECHA=$(date +%Y%m%d-%H%M)
DEST="${1:-$HOME/backup-lap-$FECHA}"
echo "▶ Destino: $DEST"
mkdir -p "$DEST"/{paquetes,dotfiles,etc,configs}

# 1/6 LISTAS DE PAQUETES
echo "▶ [1/6] Guardando listas de paquetes..."
pacman -Qqn > "$DEST/paquetes/oficiales.txt" 2>/dev/null || true
pacman -Qqm > "$DEST/paquetes/aur.txt" 2>/dev/null || true
pacman -Qqe > "$DEST/paquetes/explícitos.txt" 2>/dev/null || true
npm ls -g --depth=0 2>/dev/null | tail -n +2 | awk '{print $2}' | cut -d@ -f1 > "$DEST/paquetes/npm-global.txt" || true
pip freeze > "$DEST/paquetes/pip.txt" 2>/dev/null || pip list --format=freeze > "$DEST/paquetes/pip.txt" 2>/dev/null || true
systemctl list-unit-files --state=enabled --no-legend 2>/dev/null | awk '{print $1}' > "$DEST/paquetes/servicios-habilitados.txt" || true
echo "   ✓ $(wc -l < "$DEST/paquetes/oficiales.txt") oficiales, $(wc -l < "$DEST/paquetes/aur.txt") AUR"

# 2/6 DOTFILES
echo "▶ [2/6] Copiando dotfiles..."
for f in .bashrc .zshrc .profile .xinitrc .gitconfig .gitignore_global; do
  [ -f "$HOME/$f" ] && cp "$f" "$DEST/dotfiles/" && echo "   ✓ $f"
done
[ -d "$HOME/.ssh" ] && cp -a "$HOME/.ssh" "$DEST/dotfiles/" && echo "   ✓ .ssh"
[ -d "$HOME/.gnupg" ] && cp -a "$HOME/.gnupg" "$DEST/dotfiles/" && echo "   ✓ .gnupg"

# 3/6 CONFIGS DE HERRAMIENTAS (CodeWhale, Goose, MCP, skills)
echo "▶ [3/6] Copiando configs de herramientas..."
for d in .codewhale .agents .deepseek .config .local/bin .local/share/mcp-servers; do
  if [ -e "$HOME/$d" ]; then
    mkdir -p "$DEST/configs/$(dirname "$d")"
    cp -a "$HOME/$d" "$DEST/configs/$d" && echo "   ✓ $d"
  fi
done

# 4/6 ARCHIVOS DE SISTEMA (/etc) — probar sin contraseña
echo "▶ [4/6] Intentando copiar /etc (sin sudo)..."
for f in pacman.conf hosts fstab mkinitcpio.conf; do
  if [ -r "/etc/$f" ]; then cp "/etc/$f" "$DEST/etc/" && echo "   ✓ /etc/$f"; else echo "   ⚠ /etc/$f (no accesible, copialo a mano)"; fi
done

# 5/6 HOME COMPLETO en un solo archivo tar (excluye cachés y basura)
echo "▶ [5/6] Empaquetando /home/leo completo (esto puede tardar)..."
tar -cf "$DEST/home.tar" -C "$HOME" \
  --exclude='.cache' \
  --exclude='.npm' \
  --exclude='.local/share/Trash' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='backup-lap-*' \
  --exclude='arch-iso' \
  .
echo "   ✓ home.tar creado: $(du -h "$DEST/home.tar" | cut -f1)"

# 6/6 RESUMEN
echo "▶ [6/6] ¡Exportación completa!"
cp /home/leo/RESTAURAR.txt "$DEST/RESTAURAR.txt" 2>/dev/null || true
echo
echo "============================================================"
du -sh "$DEST"
echo "  BACKUP LISTO EN: $DEST"
echo "  Para restaurar, leé $DEST/RESTAURAR.txt"
echo "============================================================"
