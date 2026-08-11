#!/usr/bin/env bash
# ============================================================
#  INSTALAR ARCH EN LA LAPTOP NUEVA (desde el live USB)
#  Uso (en el live de Arch):
#     ./instalar-arch.sh /dev/nvme0n1   (disco de la laptop nueva)
#  ADVERTENCIA: borra TODO el disco elegido.
# ============================================================
set -euo pipefail

DISCO="${1:-}"
[ -n "$DISCO" ] || { echo "Uso: $0 /dev/sdX   (verificá el disco con lsblk)"; exit 1; }

USUARIO="leo"
HOSTNAME="leo-lap"
ZONA="America/Mexico_City"   # ← ajustá tu zona horaria
IDIOMA="es-MX.UTF-8"
TECLADO="latam"

echo "▶ Disco: $DISCO  (SE VA A BORRAR TODO)"
echo "▶ Presioná Enter para confirmar o Ctrl+C para cancelar"
read -r _

# 1. Reloj y teclado
timedatectl set-ntp true
loadkeys "$TECLADO" 2>/dev/null || true

# 2. Particionado UEFI
echo "▶ Particionando $DISCO..."
wipefs -a "$DISCO"
parted "$DISCO" --script mklabel gpt
parted "$DISCO" --script mkpart ESP fat32 1MiB 513MiB
parted "$DISCO" --script set 1 esp on
parted "$DISCO" --script mkpart ROOT ext4 513MiB 100%
P1="${DISCO}1"
P2="${DISCO}2"
[[ "$DISCO" == /dev/nvme* ]] && P1="${DISCO}p1" && P2="${DISCO}p2"

mkfs.fat -F32 "$P1"
mkfs.ext4 -F "$P2"

# 3. Montar
echo "▶ Montando..."
mount "$P2" /mnt
mkdir -p /mnt/boot
mount "$P1" /mnt/boot

# 4. Instalar base
echo "▶ Instalando sistema base (esto tarda)..."
pacstrap /mnt base linux linux-firmware networkmanager vim sudo bash-completion \
  git base-devel

# 5. fstab y chroot
genfstab -U /mnt >> /mnt/etc/fstab

# 6. Configuración básica
arch-chroot /mnt ln -sf /usr/share/zoneinfo/"$ZONA" /etc/localtime
arch-chroot /mnt hwclock --systohc
sed -i "s/^#$IDIOMA/$IDIOMA/" /mnt/etc/locale.gen
arch-chroot /mnt locale-gen
echo "LANG=$IDIOMA" > /mnt/etc/locale.conf
echo "$TECLADO" > /mnt/etc/vconsole.conf
echo "$HOSTNAME" > /mnt/etc/hostname
cat >> /mnt/etc/hosts <<EOF
127.0.0.1   localhost
::1         localhost
127.0.1.1   $HOSTNAME.localdomain  $HOSTNAME
EOF

# 7. Usuario
arch-chroot /mnt useradd -m -G wheel,audio,video -s /bin/bash "$USUARIO"
echo "▶ Contraseña para el usuario $USUARIO:"
arch-chroot /mnt passwd "$USUARIO"
echo "▶ Contraseña de root:"
arch-chroot /mnt passwd root
sed -i 's/^# %wheel ALL=(ALL:ALL) ALL/%wheel ALL=(ALL:ALL) ALL/' /mnt/etc/sudoers

# 8. Bootloader (GRUB UEFI)
arch-chroot /mnt pacman -S --noconfirm grub efibootmgr
arch-chroot /mnt grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
arch-chroot /mnt grub-mkconfig -o /boot/grub/grub.cfg

# 9. Servicios
arch-chroot /mnt systemctl enable NetworkManager

echo "============================================================"
echo "  INSTALACIÓN BASE COMPLETA."
echo "  Reiniciá (reboot), entrá con $USUARIO y corré:"
echo "     /ruta/restaurar-sistema.sh"
echo "  (restaura paquetes, AUR, home y configs desde el backup)"
echo "============================================================"
