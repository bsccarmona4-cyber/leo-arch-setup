# 💻 Diagramas UML — Guía Rápida

> Para la materia de Programación

## ¿Qué es UML?
**UML** = Unified Modeling Language. Es la forma "estándar" de dibujar cómo funciona un sistema de software antes de programarlo.

## Diagramas principales

### 1. Diagrama de Casos de Uso 🎭
Muestra **quién** hace **qué** en el sistema.

```
[Cliente] ──(Comprar)──> ⚪ Sistema
[Cliente] ──(Pagar)───> ⚪ Sistema
[Admin]   ──(Gestionar)─> ⚪ Sistema
```

**Clave:** Actores (personas/sistemas) → Use cases (acciones)

### 2. Diagrama de Clases 📦 ← *Este es el que vieron hoy*
Muestra las **clases** y cómo se **relacionan**.

```
┌─────────────────┐
│     Persona      │
├─────────────────┤
│ - nombre: String │
│ - edad: int      │
├─────────────────┤
│ + caminar()      │
│ + hablar()       │
└─────────────────┘
        ▲
        │ herencia
┌─────────────────┐
│   Estudiante     │
├─────────────────┤
│ - matricula      │
├─────────────────┤
│ + estudiar()     │
└─────────────────┘
```

### 3. Diagrama de Secuencia ⏱️
Muestra el **orden** de las interacciones en el tiempo.

```
Cliente     Sistema      BD
   │          │          │
   │──pide───>│          │
   │          │──busca──>│
   │          │<──resp──│
   │<──result─│          │
```

## Relaciones clave (Diagrama de Clases)

| Relación | Flecha | Significado |
|---|---|---|
| **Asociación** | ——► | "Usa" / "Tiene un" |
| **Composición** | ◆——► | "Está hecho de" (fuerte) |
| **Agregación** | ◇——► | "Tiene varios" (débil) |
| **Herencia** | ——▷ | "Es un tipo de" |
| **Dependencia** | - - -► | "Depende temporalmente de" |

## Tip: La regla para pasar UML a código

```
1. Clases → se vuelven class en código
2. Atributos → son las variables de la clase
3. Métodos → son las funciones de la clase
4. Relaciones → son referencias entre clases
```

---

*Pégame el código que vieron hoy y te ayudo a descifrarlo línea por línea.* 🔥
