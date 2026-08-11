# Cybersec Context

## Identity
- leo, Arch Linux, aprende ciberseguridad desde 0
- Enfoque: práctico, atacante real, lab local
- BlackArch sobre Arch
- ~/secure/ = project home
- guardián: ignorar siempre

## Protocol Herramientas (fijo)
1. Verificar checksum/firma oficial SIEMPRE
2. Source original, no mirrors random
3. Preferir pacman oficial > AUR > pip/gem
4. AUR: aur-check antes de yay
5. Si duda: contenedor primero

## State (30 Jun 2026 06:56)
- BlackArch: repo ACTIVO ✅
- Paquetes BlackArch instalados: 0
- Herramientas: nmap, aircrack-ng, bettercap, wireshark-cli, wireshark-qt
- Docker: instalado

## Red local descubierta
- 192.168.1.1 — Router (ZTE, Linux 3.x/4.x) — DNS, HTTP, HTTPS abiertos
- 192.168.1.2 — TV Samsung (Linux 3.x/4.x) — 10 puertos (7676,8001,8002,8080,9080,9999,32768-32771)
- 192.168.1.5 — Desconocido (MAC Unknown, posible WAP/repetidor)
- 192.168.1.7 — Leo (Arch, MariaDB puerto 3306 abierto/protegido local)
- Celular — IP no identificada aún

## Lecciones cubiertas
1. nmap -sn (descubrimiento hosts)
2. nmap -O (OS fingerprinting)
3. nmap -A (servicios, versiones, scripts, traceroute)
4. Red local: MAC → fabricante, puertos abiertos → servicios
5. MySQL/MariaDB: conexión remota, error 1130 (permisos host), error TLS
6. DROP TABLE / DROP DATABASE (destrucción controlada)
7. arp-scan para identificar dispositivos por MAC

## Pendiente
- Identificar IP del celular en la red
- Posible ataque a celular
- tools_vuln/ estructura
- Lab vulnerable Docker
