# 🖼️ KREI — Prompts para Imágenes Realistas

## Configuración
- **Modelo**: Gemini 3.1 Flash Image Preview / Gemini 3 Pro Image Preview
- **Herramienta**: NanoBanana MCP (local) o AI Studio: https://aistudio.google.com/

## Estilo General
| Elemento | Especificación |
|---|---|
| Estilo | Ultra realista, estilo Amazon Premium / Apple |
| Iluminación | Natural difusa o estudio suave |
| Fondo hero | Blanco puro (#FFFFFF) con sombras suaves |
| Fondo lifestyle | Contexto real (coche, tablero, baúl) |
| Ángulo | 3/4 para hero, lifestyle shots realistas |
| Resolución | 1200x1200px o superior |

## Productos y Prompts

### 1. CD Slot Phone Mount ($33.35)
**Lifestyle**: Product photography of a sleek black CD slot phone mount installed in a modern car dashboard. Phone securely mounted showing navigation. Golden hour lighting, leather interior, shallow DOF. Ultra realistic, 8K.

**Hero**: Ultra realistic commercial product photography of a black universal CD slot phone mount. Isolated on clean white background. Studio lighting, soft shadows. Detailed grip mechanism, 360° joint, rubber padding. 8K, 100mm macro.

### 2. Car Air Vent Phone Holder ($37.83)
**Lifestyle**: Extreme close-up of a black air vent phone holder clipped onto a modern car AC vent. Phone mounted showing maps. Car interior blurred background. Natural window light.

**Hero**: Premium black car air vent phone mount on stark white background. Three-quarter angle showing clamp mechanism and anti-slip silicone pad. Studio lighting.

### 3. Car Magnetic Phone Holder ($43.57)
**Lifestyle**: Dynamic product photography of a phone being snapped onto a magnetic car phone mount. Car dashboard background, natural light.

**Hero**: Premium black magnetic phone holder with smartphone attached. Isolated on white. Studio lighting highlighting N52 magnet area. Sharp detail on metal/silicone.

### 4. Car Charger PD 36W ($33.38)
**Lifestyle**: 36W PD USB-C car charger plugged into a car's 12V power socket. Phone connected charging rapidly. Dim car interior with dashboard ambient lighting.

**Hero**: Premium 36W PD dual-port car charger on white background. Brushed aluminum finish, USB-C and USB-A ports visible. Soft shadows.

### 5. Car Charger PD 30W ($29.71)
**Lifestyle**: Slim 30W PD car charger in car power outlet. Compact design barely protruding. Natural daylight through car window.

**Hero**: Black 30W dual-port car charger on pure white. 45-degree angle showing both ports. Studio lighting with soft gradient shadow.

### 6. Car Trunk Organizer ($26.12) — GO
**Lifestyle**: Heavy-duty car trunk organizer in SUV trunk. Three compartments: groceries, soccer ball, emergency kit. Natural daylight, outdoor background through open trunk.

**Hero**: Black heavy-duty trunk organizer, folded flat on white background. Studio lighting highlighting waterproof fabric texture, zippers, handles.

### 7. Portable Jump Starter 2000A ($97.33) — GO
**Lifestyle**: Jump starter connected to car battery under hood. Red/black clamps on terminals. LED light on. Late afternoon golden hour.

**Hero**: Black 2000A portable jump starter on white background. Three-quarter angle showing USB ports, LED light, battery indicator. 8K.

### 8. Jump Starter Power Bank Pro 3000A ($118.80) — GO
**Lifestyle**: Premium 3000A jump starter connected to truck battery. Metallic finish, dusk atmosphere. Phone charging from power bank port. Digital display showing battery level.

**Hero**: 3000A jump starter pro on white background. 20000mAh capacity unit with digital display, dual USB, heavy-duty clamps. Dramatic shadows for premium feel.

### Bundles
**Road Trip Essential ($84.99)**: Flat lay of CD mount + 36W charger + trunk organizer on light wood. Coffee cup and sunglasses as props.

**Daily Driver ($59.99)**: Vent mount + 30W charger on dark slate. Side angle, soft studio lighting.

## Orden de prioridad
1. 🔴 Jump Starter Pro 3000A
2. 🔴 Jump Starter 2000A
3. 🟡 CD Slot Phone Mount
4. 🟡 Car Trunk Organizer
5. 🟢 Car Magnetic Phone Holder
6. 🟢 Car Air Vent Phone Holder
7. 🟢 Car Charger PD 36W
8. 🟢 Car Charger PD 30W

## Estructura de archivos
```
public/images/productos/
├── NOMBRE-PRODUCTO/
│   ├── hero.jpg       ← fondo blanco
│   ├── lifestyle.jpg  ← en uso
│   └── variante.jpg   ← flat lay / detalle
└── bundles/
    ├── road-trip-essential.jpg
    └── daily-driver.jpg
```
