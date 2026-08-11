#!/usr/bin/env bash
# ============================================================
#  INSTALAR NIRI — laptop nueva con Arch Linux
#  Instala niri + stack Wayland, restaura dotfiles y memoria.
#  Uso:  ./instalar-niri.sh   (desde la raíz del repo clonado)
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ [1/5] Instalando paquetes (niri + stack Wayland)..."
PACOTES="niri waybar swaync wlogout rofi kitty swaybg swayosd cliphist \
grim slurp swappy wl-clipboard polkit-gnome playerctl fastfetch btop \
starship thunar firefox pipewire pipewire-pulse wireplumber \
xdg-desktop-portal-gnome qt5-wayland qt6-wayland"
sudo pacman -S --needed $PACOTES

echo "▶ [2/5] Asegurando helper AUR (yay)..."
command -v yay >/dev/null 2>&1 || {
    git clone https://aur.archlinux.org/yay.git /tmp/yay-build
    (cd /tmp/yay-build && makepkg -si --noconfirm)
    rm -rf /tmp/yay-build
}

echo "▶ [3/5] Restaurando dotfiles y config de niri..."
mkdir -p ~/.config/niri
cp -a dotfiles/.config/* ~/.config/ 2>/dev/null || true
cp setup/config-niri/config.kdl ~/.config/niri/config.kdl
[ -f dotfiles/.config/hypr-ref/montana.jpg ] && cp dotfiles/.config/hypr-ref/montana.jpg ~/.config/niri/montana.jpg
[ -f dotfiles/.bashrc ] && cp dotfiles/.bashrc ~/
[ -f dotfiles/.zshrc ] && cp dotfiles/.zshrc ~/
[ -f dotfiles/.gitconfig ] && cp dotfiles/.gitconfig ~/

# Waybar: cambiar módulo de workspaces (hyprland → niri)
if [ -f ~/.config/waybar/config.jsonc ] && grep -q 'hyprland/workspaces' ~/.config/waybar/config.jsonc; then
    sed -i 's/"hyprland\/workspaces"/"niri\/workspaces"/' ~/.config/waybar/config.jsonc
    echo "   ✓ waybar: módulo workspaces cambiado a niri"
fi

echo "▶ [4/5] Restaurando memoria del agente (CodeWhale/Goose/MCP)..."
mkdir -p ~/.codewhale ~/.agents ~/.deepseek ~/.config/goose
cp -a memoria/.codewhale/. ~/.codewhale/
cp -a memoria/.agents/. ~/.agents/
cp -a memoria/.deepseek/. ~/.deepseek/
cp -a memoria/goose/. ~/.config/goose/

echo "▶ [5/5] Dependencias de MCP servers..."
if [ -d proyectos/mcp-servers ]; then
    (cd proyectos/mcp-servers && npm install 2>/dev/null || echo "   ⚠ npm install falló — revisar manualmente")
fi

echo
echo "============================================================"
echo "  LISTO. Pasos manuales:"
echo "  1) Reconfigurar API keys (ver .env-keys-backup.txt en tu USB)"
echo "     - CodeWhale:  editar ~/.codewhale/config.toml (api_key)"
echo "     - Figma MCP:  editar ~/.deepseek/mcp.json (figma key)"
echo "     - Proyectos:  copiar .env desde el USB si los necesitas"
echo "  2) Instalar CodeWhale: https://codewhale.dev (o copiar binario whale)"
echo "  3) Probar: niri-session  (desde TTY:  exec niri-session)"
echo "============================================================"
