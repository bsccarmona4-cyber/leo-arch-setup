# Leo Arch Setup — migración a laptop nueva (Arch + niri)

Repo privado con TODO lo que Leo necesita en la laptop nueva: **documentación,
proyectos, memoria del agente (CodeWhale/Goose) y dotfiles** — sin basura del
sistema y **sin keys/secretos** (esos van por USB en `.env-keys-backup.txt`).

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
- `dotfiles/` — .bashrc, .zshrc, .gitconfig, .config/{kitty,rofi,waybar,swaync,wlogout,fastfetch,btop,zathura}, starship, hypr-ref (referencia)
- `setup/` — scripts de instalación:
  - `instalar-niri.sh` — instala niri + stack + restaura todo
  - `config-niri/config.kdl` — config niri adaptada de tu hyprland.conf
  - `arch-iso/` — instalar-arch.sh, restaurar-sistema.sh
  - `exportar-lap.sh`, `exportar-windows.sh`, `RESTAURAR.txt`
  - `paquetes/` — listas oficiales/AUR/pip/npm/servicios (para reinstalar)

## Guía de restauración (laptop nueva)

1. **Instalar Arch base** — seguí `setup/arch-iso/instalar-arch.sh` (usuario `leo`)
2. **Clonar este repo** (privado, necesitás tu token GitHub):
   ```bash
   git clone https://github.com/LEO/leo-arch-setup.git ~/arch-setup
   cd ~/arch-setup
   ```
3. **Instalar niri + restaurar todo**:
   ```bash
   ./setup/instalar-niri.sh
   ```
4. **Reconfigurar keys** (desde el USB, `.env-keys-backup.txt`):
   - `~/.codewhale/config.toml` → `api_key`
   - `~/.deepseek/mcp.json` → figma key
   - `.env` de proyectos (guardian, kreid/store) si los necesitás
5. **Instalar CodeWhale** (https://codewhale.dev o copiar el binario `whale`)
6. **Probar**: `niri-session` desde el TTY, y `whale` para verificar skills

## Notas

- Los secretos NO están en este repo (saneados + escaneados). Respaldo local:
  `/home/leo/.env-keys-backup.txt` (22 variables) y `/home/leo/.codewhale/secrets/`
- El `.env-keys-backup.txt` original queda en la laptop vieja — actualizalo si
  generás keys nuevas
- Para actualizar el repo desde la laptop vieja: `git add -A && git commit && git push`
