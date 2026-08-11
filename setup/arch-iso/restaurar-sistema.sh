#!/usr/bin/env bash
# ============================================================
#  RESTAURAR SISTEMA en la laptop nueva (después de instalar Arch)
#  Uso:  ./restaurar-sistema.sh  (desde la carpeta del backup)
#  Restaura: paquetes oficiales + AUR + home + configs + npm/pip
# ============================================================
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
USUARIO="leo"

echo "▶ [1/4] Paquetes oficiales (esto tarda bastante)..."
sudo pacman -S --needed --noconfirm $(cat "$HERE/paquetes/oficiales.txt") || \
  { echo "⚠ Algunos paquetes fallaron. Reintentando por lotes..."; while read -r p; do sudo pacman -S --needed --noconfirm "$p" || true; done < "$HERE/paquetes/oficiales.txt"; }

echo "▶ [2/4] Helper AUR + paquetes AUR..."
command -v yay >/dev/null || {
  cd /tmp && git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si --noconfirm
}
yay -S --needed --noconfirm $(cat "$HERE/paquetes/aur.txt") || true

echo "▶ [3/4] Restaurando home y configs..."
if [ -f "$HERE/home.tar" ]; then
  echo "   Desempaquetando home.tar (puede tardar)..."
  tar -xf "$HERE/home.tar" -C "/home/$USUARIO/"
  echo "   ✓ home restaurado"
fi
for f in .bashrc .zshrc; do
  [ -f "$HERE/dotfiles/$f" ] && cp "$HERE/dotfiles/$f" "/home/$USUARIO/"
done
[ -d "$HERE/dotfiles/.ssh" ] && cp -a "$HERE/dotfiles/.ssh" "/home/$USUARIO/"
[ -d "$HERE/configs" ] && cp -a "$HERE/configs/." "/home/$USUARIO/" 2>/dev/null || true
sudo chown -R "$USUARIO:$USUARIO" "/home/$USUARIO" 2>/dev/null || true

echo "▶ [4/4] npm y pip globales..."
[ -s "$HERE/paquetes/npm-global.txt" ] && sudo npm i -g $(cat "$HERE/paquetes/npm-global.txt") || true
[ -s "$HERE/paquetes/pip.txt" ] && pip install -r "$HERE/paquetes/pip.txt" 2>/dev/null || true

echo "============================================================"
echo "  RESTAURACIÓN COMPLETA 🎉"
echo "  Sugerencias:"
echo "  - Revisá los servicios: cat $HERE/paquetes/servicios-habilitados.txt"
echo "  - Archivos de sistema: sudo cp $HERE/etc/pacman.conf /etc/"
echo "============================================================"
