# 🛡️ CYBERSEC LOG

## ⚠️ REGLA
Este archivo = contexto PRINCIPAL cuando usuario dice "modo cybersec" o similar.
Ignorar otros proyectos (kreid, guardian, hallmark, etc).

## Sesión: 29 Jun 2026

### Log
1. **strap.sh** descargado desde blackarch.org ✅
2. **sha1sum** verificado contra hash oficial: `00688950aaf5e5804d2abebb8d3d3ea1d28525ed` ✅
3. **sudo ./strap.sh** ejecutado → BlackArch keyring + repo configurado ✅
4. `pacman -Syyu` corrido ✅
5. Red local escaneada:
   - 192.168.1.1 → Router ZTE (DNS, HTTP, HTTPS)
   - 192.168.1.2 → TV Samsung (10 puertos abiertos)
   - 192.168.1.5 → Desconocido (posible WAP)
   - 192.168.1.7 → Leo (MariaDB en 3306, protegido local-only)
   - Celular → presente pero IP no identificada
6. **Práctica SQL:** conexión MariaDB, error 1130, DROP TABLE/DATABASE en DB tienda ✅
7. **Objetivo actual:** identificar IP del celular, posible ataque

### Herramientas instaladas
- nmap ✅
- aircrack-ng ✅
- bettercap ✅
- wireshark-cli + wireshark-qt ✅
- arp-scan (instalado durante sesión)
- BlackArch repo activo, 0 paquetes instalados

### Próximo paso
Identificar IP del celular → ataque
