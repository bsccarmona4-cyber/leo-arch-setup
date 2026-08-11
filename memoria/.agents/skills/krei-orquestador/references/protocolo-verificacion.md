# Protocolo de Verificación — Orquestador KREI

El orquestador no da por terminada una tarea hasta que se verifica objetivamente. Este protocolo define cómo.

---

## Niveles de verificación

| Nivel | Descripción | Cuándo aplica |
|-------|-------------|---------------|
| **L1 — Existencia** | ¿El archivo/cambio existe? | Todo cambio de código |
| **L2 — Correctitud estructural** | ¿El código compila/linter pasa? | Cambios de código |
| **L3 — Comportamiento** | ¿La funcionalidad hace lo esperado? | Features, fixes |
| **L4 — Integridad** | ¿No rompió nada existente? | Cambios cross-file, refactors |

---

## Ciclo de verificación

```
AGENTE termina y reporta
        ↓
[L1: ¿Se crearon/modificaron los archivos esperados?]
    NO → Regresar al agente: "El archivo X no existe. Reintenta."
    SÍ ↓
[L2: ¿Compila? ¿Linter pasa?]
    NO → Regresar al agente con el error específico
    SÍ ↓
[L3: ¿La funcionalidad cumple la especificación?]
    NO → Regresar al agente: "Esperaba X, recibí Y. Corrige Z."
    SÍ ↓
[L4: ¿Pruebas existentes pasan? ¿No hay regresiones?]
    NO → Regresar al agente con los tests fallidos
    SÍ ↓
✅ TAREA COMPLETA
```

---

## Reglas de re-intento

1. **Máximo 3 ciclos de corrección por agente.** Al tercer fallo:
   - Si es un error distinto cada vez → dar una instrucción más detallada
   - Si es el mismo error → cambiar de approach o de agente
   - Si el agente parece no entender → reasignar a otro agente del mismo dominio

2. **Corrección atómica.** Cada corrección señala EXACTAMENTE qué falló:
   - ❌ "No funciona" 
   - ✅ "El botón de checkout en Checkout.jsx:204 no redirige a Stripe porque usa `fetch(/api/create-checkout-session)` y el endpoint está configurado para US. Cámbialo a moneda MXN y dirección MX."

3. **Evidencia sobre opinión.** El orquestador verifica con herramientas, no con juicio:
   - ✅ `read_file` para verificar que el cambio existe
   - ✅ `exec_shell` para compilar/linter/tests
   - ✅ `git_diff` para ver qué cambió exactamente
   - ❌ "Parece que está bien"

---

## Criterios de completitud por tipo de tarea

### Código
- [ ] Archivo(s) creados/modificados (L1)
- [ ] Build exitoso o linter limpio (L2)
- [ ] Funcionalidad verificada con test o ejecución (L3)
- [ ] No regresiones en tests existentes (L4)

### Diseño
- [ ] Archivo(s) CSS/JSX creados/modificados (L1)
- [ ] Sin errores de sintaxis CSS/JSX (L2)
- [ ] La paleta/tipografía/layout coincide con lo solicitado (L3)
- [ ] No rompió otras páginas (revisar que otras rutas cargan) (L4)

### Investigación
- [ ] Fuentes citadas con URLs o referencias (L1)
- [ ] Datos verificables (no inventados) (L2)
- [ ] Conclusiones accionables (no vaguedades) (L3)

### Planificación
- [ ] Documento de plan creado (L1)
- [ ] Pasos atómicos y verificables (L2)
- [ ] Cada paso tiene criterio de éxito claro (L3)

---

## Protocolo multi-agente

Cuando una tarea requiere múltiples agentes:

1. **Agentes independientes** → Spawnear en paralelo, verificar cada uno al recibir resultado
2. **Agentes dependientes** → Verificar A antes de spawnear B
3. **Agente integrador** → Un último agente que toma los outputs de todos y produce el entregable final

```
Tarea compleja
    ├── Agente A (independiente) ──→ verificar ──┐
    ├── Agente B (independiente) ──→ verificar ──┤
    └── Agente C (depende de A) ───→ verificar ──┤
                                                   ↓
                                          Agente Integrador
                                                   ↓
                                          Verificación final
```
