# Leo Arch Setup — migración a laptop nueva

Repo privado con la **memoria del agente (CodeWhale/Goose), proyectos, documentación
y dotfiles** de Leo — **sin** administradores de pantalla (nada de niri/hyprland/waybar),
**sin** basura del sistema y **sin keys/secretos** (esos van por USB en `.env-keys-backup.txt`).

## Estructura

- `docs/` — Documents, obsidian (3 vaults), libros, scripts, notas cybersec
- `proyectos/` — guardian, caveman, hallmark, kreid, pixelle-video, mcp-servers,
  ia-playground, upvt-campus-explorer, Open-Generative-AI, notion-ux,
  uml-diagrams, SistemaBiblioteca, agenda_project, final-unidad-1/2,
  solidos_revolucion_pro, exercism, open-seo
  *(sin node_modules, .next, dist, venvs, .git, .env)*
- `memoria/` — el agente completo:
  - `.codewhale/` — config, instructions.md, notes.txt, journal.md, skills, automations
  - `.agents/` — skills KREI/Goose (krei-arbol-pensante, caveman, etc.)
  - `.deepseek/` — mcp.json (sanéado)
  - `goose/` — configs KREI (power/lite/opus), top-of-mind.md, skills
- `dotfiles/` — .bashrc, .zshrc, .gitconfig, kitty, rofi, fastfetch, btop, starship, zathura
- `setup/` — scripts:
  - `arch-iso/` — instalar-arch.sh (instala Arch base), restaurar-sistema.sh
  - `exportar-lap.sh`, `exportar-windows.sh`, `RESTAURAR.txt`
  - `paquetes/` — listas oficiales/AUR/pip/npm/servicios (para reinstalar)

## Guía de restauración (laptop nueva)

1. **Instalar Arch base** — arranca con la USB (ISO 2026.08.01) y corré
   `setup/arch-iso/instalar-arch.sh` (usuario `leo`, zona America/Mexico_City, teclado latam)
2. **Montar la partición de datos de la USB** (sdb3, exfat) y extraer el respaldo:
   ```bash
   sudo mount /dev/sdb3 /mnt/usb
   tar -xzf /mnt/usb/leo-arch-setup.tar.gz -C ~/
   ```
   (o clonar este repo: `git clone https://github.com/bsccarmona4-cyber/leo-arch-setup.git`)
3. **Restaurar la memoria del agente** (ya está en el tar.gz, o desde el repo):
   ```bash
   mkdir -p ~/.codewhale ~/.agents ~/.deepseek ~/.config/goose
   cp -a ~/arch-setup/memoria/.codewhale/. ~/.codewhale/
   cp -a ~/arch-setup/memoria/.agents/. ~/.agents/
   cp -a ~/arch-setup/memoria/.deepseek/. ~/.deepseek/
   cp -a ~/arch-setup/memoria/goose/. ~/.config/goose/
   ```
4. **Reconfigurar keys** (desde el USB, `.env-keys-backup.txt`):
   - `~/.codewhale/config.toml` → `api_key`
   - `~/.deepseek/mcp.json` → figma key
   - `.env` de proyectos (guardian, kreid/store) si los necesitás
5. **Instalar CodeWhale** (https://codewhale.dev o copiar el binario `whale`)
6. **Instalar el escritorio que prefieras** (KDE/GNOME/xfce/i3...) — la memoria del
   agente no depende del escritorio

## Notas

- Los secretos NO están en este repo (saneados + escaneados). Respaldo local:
  `/home/leo/.env-keys-backup.txt` (35 variables) y `/home/leo/.codewhale/secrets/`
- El `.env-keys-backup.txt` original queda en la laptop vieja — actualizalo si
  generás keys nuevas
- Para actualizar el repo desde la laptop vieja: `git add -A && git commit && git push`
