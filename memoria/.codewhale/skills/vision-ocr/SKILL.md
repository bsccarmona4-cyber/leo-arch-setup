# Vision & OCR

Skill para trabajar con imágenes, screenshots y OCR en CodeWhale.

## Capacidades

### 1. Leer imágenes con OCR
`read_file` extrae texto de imágenes vía OCR cuando está disponible:
```markdown
read_file path="screenshot.png"
→ Devuelve el texto extraído de la imagen
```

### 2. Casos de uso
- Leer texto de screenshots de UI/webs
- Extraer texto de memes, carteles, documentos escaneados
- Ver qué dice una imagen sin tener que abrirla

### 3. Limitaciones
- Solo texto (no interpreta colores, formas, layout visual)
- Depende de OCR local instalado (tesseract, etc.)
- No puede generar imágenes

### 4. Formato del resultado
```
[OCR extract from path/to/image]
---
Texto extraído aquí...
---
```
