#!/usr/bin/env bash
# ============================================================
#  EXPORTAR PARA WINDOWS — solo tus datos y proyectos
#  Uso:  ./exportar-windows.sh /media/USB   (USB exFAT/NTFS)
#  Copia proyectos, documentos, fotos, notas... en formato
#  que Windows lee directo. Excluye cosas de Linux (configs,
#  node_modules reinstalables, venvs, cachés).
# ============================================================
set -euo pipefail

DEST="${1:?Uso: $0 /media/USB}"

DIRS="Documents Downloads Pictures Music Videos Imagenes Imágenes libros \
obsidian obsidian-escuela obsidian-iti-leo \
guardian kreid hallmark caveman pixelle-video notion-ux uml-diagrams \
ia-playground Projects final-unidad-1 upvt-campus-explorer \
solidos_revolucion_pro SistemaBiblioteca agenda_project exercism \
mcp-servers Open-Generative-AI scripts"

mkdir -p "$DEST"
echo "▶ Destino: $DEST"
echo "▶ Copiando (sin node_modules/venvs/cachés)..."
for d in $DIRS; do
  if [ -e "$HOME/$d" ]; then
    echo "   → $d"
    tar -cf - -C "$HOME" \
      --exclude='node_modules' \
      --exclude='venv' \
      --exclude='aider-venv' \
      --exclude='__pycache__' \
      --exclude='*.pyc' \
      --exclude='.cache' \
      --exclude='.next' \
      --exclude='dist' \
      "$d" 2>/dev/null | tar -xf - -C "$DEST"
  fi
done

# Configs de apps multiplataforma (CodeWhale, VSCode, git)
echo "▶ Configs portables..."
for d in .config/Code .gitconfig; do
  [ -e "$HOME/$d" ] && mkdir -p "$DEST/configs/$(dirname "$d")" && cp -a "$HOME/$d" "$DEST/configs/$d" && echo "   → $d"
done

echo "============================================================"
echo "  LISTO: $DEST"
echo "  Conectá la USB a la laptop Windows y copiá lo que quieras."
echo "  (7-Zip abre home.tar del otro backup si lo necesitás)"
echo "============================================================"
