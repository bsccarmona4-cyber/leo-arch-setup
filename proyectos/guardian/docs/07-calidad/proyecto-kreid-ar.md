# 🏛️ Proyecto: KREID Design Studio (AR + Web)

> **Materia:** Tópicos de Calidad para el Diseño de Software
> **Estado:** ✅ Entregado
> **Fecha:** Mayo 2026
> **Tecnologías:** A-Frame, AR.js, Three.js, HTML/CSS, QR codes

## 📋 Descripción
Página web de un estudio de diseño con experiencia de Realidad Aumentada. El proyecto incluye:
- Landing page con servicios (Diseño Gráfico, Branding, Editorial, Web, Packaging, Audiovisual)
- Logo 3D interactivo
- Experiencia AR basada en marcador (Hiro)
- Visor 3D tipo "showroom" con pedestales interactivos
- Código QR para acceder desde el celular

## 🛠️ Archivos del proyecto
Está en `~/Desktop/imagen/`
- `index.html` → Landing page principal
- `ar.html` → Experiencia de Realidad Aumentada
- `viewer.html` → Showroom 3D interactivo
- `qr-ar.html` → Página QR para escanear
- `style.css` → Estilos
- `assets/kreid-logo.svg` → Logo
- `libs/` → Librerías (A-Frame, Three.js, AR.js)

## 🔧 Problemas resueltos
- Logo 3D con demasiada profundidad → se redujo `depth` y `height` de 0.015 a 0.002
- Deepseek rompió el código → se restauró y corrigió manualmente

## 💡 Tecnología usada
- **A-Frame + AR.js** para realidad aumentada en navegador
- **Three.js** para modelo 3D del logo y showroom
- **TextGeometry** para texto 3D extrusionado
- **QRCode.js** para generar QR dinámicos

## 📝 Notas
- Leo dice que estos proyectos de RA en Tópicos de Calidad son "cosas inútiles" pero hay que hacerlos para pasar la materia
- El proyecto ya fue entregado
