# Reporte Técnico: Laboratorio de Errores y Excepciones con IA

**Asignatura / Ámbito:** Escuela - Proyecto Python  
**Líder / Ejecutor de Roles:** Agente IA (Asumiendo Dev 1, Dev 2, Dev 3 y Dev 4)  
**Ubicación de Código:** `/home/leo/obsidian/iti-leo/10-escuela/python/laboratorio_errores/`

---

## 1. FASE 1: Relación entre Errores y Excepciones (Entregable 1 - Dev 1 El Clasificador)

El código analizado presentaba fallas en tres niveles distintos del ciclo de vida del programa:

```python
def calcular_promedio(lista):
    suma = 0
    for i in lista           # 1. Error de Sintaxis (Falta ':')
        suma += i
    return suma / len(lista)  # 2. Error Lógico y 3. Excepción en Tiempo de Ejecución

print(calcular_promedio([]))
```

### Tabla Comparativa de Clasificación de Errores

| Tipo de Error | Cuándo ocurre | Ejemplo en el Código | ¿Se puede capturar con `try/except`? |
| :--- | :--- | :--- | :--- |
| **1. Error de Sintaxis** | **Compilación / Análisis Léxico-Sintáctico (Parse Time)** | `for i in lista` (falta el carácter `:` obligatorio al final). | **NO.** Python detiene la ejecución antes de interpretar o ejecutar cualquier bloque `try/except`. |
| **2. Error Lógico** | **Tiempo de Ejecución (Comportamiento)** | Asumir que la lista siempre tendrá elementos sin validar si `len(lista) == 0`. | **NO directamente.** El código se ejecuta sin crash aparente hasta que choca con un estado inválido o da resultados erróneos. Se evita con validación de condiciones de guardia (`if not lista:`). |
| **3. Excepción en Tiempo de Ejecución** | **Tiempo de Ejecución (Runtime)** | `suma / len([])` resulta en `0 / 0`, lanzando `ZeroDivisionError`. | **SÍ.** Puede atraparse mediante `except ZeroDivisionError:` para evitar el crash del programa. |

---

## 2. FASE 2: Taller de Mecanismos (Salas A y B)

### SALA A - Manejo y Rastreo

#### Tarea A1: Bloques de Manejo y Captura (Dev 2 - El Guardián)
En [fase2_guardian.py](file:///home/leo/obsidian/iti-leo/10-escuela/python/laboratorio_errores/fase2_guardian.py), se refactorizó la entrada de usuario integrando la estructura completa de control:

- `try`: Encierra las operaciones riesgosas (`int(input)` y la división `10 / edad`).
- `except ValueError`: Atrapa entradas alfanuméricas o flotantes no válidas.
- `except ZeroDivisionError`: Atrapa divisiones por cero.
- `except Exception`: Captura de respaldo para cualquier error no anticipado.
- `else`: Se ejecuta únicamente si la división se realizó sin lanzar ninguna excepción.
- `finally`: Garantiza la ejecución de código de cierre/limpieza de recursos sin importar el resultado.

> **Importancia del orden de los `except`:**  
> Python evalúa los bloques de captura en orden top-down. Si un `except Exception` genérico se ubica al principio, atrapará todas las excepciones (incluyendo `ValueError`), haciendo inalcanzables los manejadores específicos. **Regla de oro:** Capturar siempre desde lo más específico hacia lo más general.

#### Tarea A2: Propagación y Análisis de Pila (Dev 3 - El Rastreador)
En [fase2_rastreador.py](file:///home/leo/obsidian/iti-leo/10-escuela/python/laboratorio_errores/fase2_rastreador.py), se analizó la pila de llamadas con la cadena `nivel1() -> nivel2() -> nivel3()`:

1. **Propagación:** Al ocurrir `10 / 0` en `nivel3()`, como no hay un bloque `try/except` local, la excepción se propaga hacia `nivel2()`, de ahí a `nivel1()`, y finalmente al ámbito global.
2. **Lectura del Stack Trace:** Se lee de **ABAJO hacia ARRIBA**. La última línea indica el tipo de excepción exacta (`ZeroDivisionError: division by zero`). Subiendo por la lista se identifican los archivos, líneas y funciones involucradas.
3. **Nivel ideal de captura:** Debe capturarse en el nivel superior de control (`nivel1` o en la vista/controlador). Las funciones internas (`nivel3`) deben ser agnósticas a la presentación o manejo de fallas.
4. **Preservación con `traceback.print_exc()`:** Permite imprimir o almacenar la traza completa del error en los logs sin interrumpir la ejecución del proceso.

---

### SALA B - Creación y Lanzamiento

#### Tarea B1: Excepciones Personalizadas (Dev 4 - El Arquitecto)
En [fase2_arquitecto.py](file:///home/leo/obsidian/iti-leo/10-escuela/python/laboratorio_errores/fase2_arquitecto.py), se diseñó la clase de excepción de negocio:

```python
class SaldoInsuficienteError(Exception):
    def __init__(self, saldo, monto):
        super().__init__(f"Saldo {saldo} insuficiente para retirar {monto}")
        self.saldo = saldo
        self.monto = monto

def retirar(saldo, monto):
    if monto > saldo:
        raise SaldoInsuficienteError(saldo, monto)
    return saldo - monto
```

---

## 3. FASE 3: Reto Final Integrador - Cajero Automático (Dev 1, 2, 3 y 4)

El script [cajero_automatico.py](file:///home/leo/obsidian/iti-leo/10-escuela/python/laboratorio_errores/cajero_automatico.py) integra todos los roles en una aplicación robusta a prueba de fallos (*Zero-Crash Guarantee*).

### Mapeo de Conceptos en el Cajero Automático:
1. **Creación (Dev 4):** Se define `SaldoInsuficienteError` con datos contextuados (`saldo` y `monto`).
2. **Lanzamiento (Dev 4):** `retirar()` lanza la excepción si `monto > saldo`.
3. **Propagación en 2 Niveles (Dev 3):** `procesar_transaccion_cajero` (Nivel 1) llama a `procesar_debito_cuenta` (Nivel 2) que llama a `retirar` (Nivel 3). La excepción fluye de Nivel 3 a Nivel 1.
4. **Bloques y Captura (Dev 2):** Captura diferenciada de `ValueError`, `SaldoInsuficienteError` y `Exception`, con ejecución de `else` en retiros exitosos y `finally` con mensaje de cierre.
5. **Clasificación (Dev 1):** Documentación explícita mediante comentarios en código del tipo de error que representa cada escenario.

### Captura en Vivo del Stack Trace y Salida del Sistema

```text
=================================================================
       BIENVENIDO AL CAJERO AUTOMÁTICO SEGURO (LAB IA)
=================================================================

>>> ESCENARIO: 1. Prueba de Entrada Inválida (Texto)
Saldo Actual: $1000.00 | Entrada Digitada: 'Ciento Cincuenta'

⚠️ [ERROR DE ENTRADA]: Escribe un número válido (ej. 50, 100.50).
ℹ️ [SISTEMA]: Gracias por usar el cajero automático.
-----------------------------------------------------------------

>>> ESCENARIO: 2. Prueba de Saldo Insuficiente (Retiro > Saldo)
Saldo Actual: $1000.00 | Entrada Digitada: '1500.00'

❌ [ERROR DE NEGOCIO]: Saldo actual ($1000.00) insuficiente para retirar $1500.00
2026-07-29 10:23:36,951 - [WARNING] - Intento de retiro fallido: Saldo=$1000.0, Monto=$1500.0
ℹ️ [SISTEMA]: Gracias por usar el cajero automático.
-----------------------------------------------------------------

>>> ESCENARIO: 3. Prueba de Transacción Exitosa
Saldo Actual: $1000.00 | Entrada Digitada: '300.00'

✅ [TRANSACCIÓN EXITOSA]: Ha retirado $300.00.
💰 Nuevo Saldo Disponible: $700.00
ℹ️ [SISTEMA]: Gracias por usar el cajero automático.
-----------------------------------------------------------------

[FIN DE LA DEMOSTRACIÓN]: Todos los escenarios fueron procesados sin ningún crash.
```

---

## 4. Estructura de Archivos del Entregable

```text
/home/leo/obsidian/iti-leo/10-escuela/python/laboratorio_errores/
├── fase1_clasificador.py                 # Dev 1: Clasificación y solución del código roto
├── fase2_guardian.py                     # Dev 2: Bloques completos try/except/else/finally
├── fase2_rastreador.py                   # Dev 3: Propagación de pila y traceback.print_exc()
├── fase2_arquitecto.py                   # Dev 4: Excepción personalizada SaldoInsuficienteError
├── cajero_automatico.py                  # FASE 3: Programa integrador libre de crashes
└── Documento_Laboratorio_Errores_y_Excepciones.md # Documento del reporte final
```
