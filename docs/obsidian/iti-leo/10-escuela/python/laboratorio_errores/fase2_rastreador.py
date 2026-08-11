"""
FASE 2: TALLER DE MECANISMOS - SALA A
Dev 3 - El Rastreador: Propagación y Análisis de Pila (Stack Trace)

Código base:
def nivel3(): return 10/0
def nivel2(): nivel3()
def nivel1(): nivel2()
nivel1()

¿Cómo viaja la excepción (Propagación)?
1. nivel3() intenta realizar 10/0 -> Ocurre un ZeroDivisionError. Como nivel3 no tiene try/except, la excepción "sube" (se propaga) a la función que la llamó (nivel2).
2. nivel2() tampoco la captura -> La excepción se propaga a nivel1().
3. nivel1() tampoco la captura -> La excepción llega al ámbito principal (main/global).
4. Si nadie la captura arriba, Python interrumpe el programa e imprime el Stack Trace.

¿Cómo leer el Stack Trace?
De ABAJO hacia ARRIBA:
- La ÚLTIMA LÍNEA indica el Tipo de Excepción y el Mensaje directo (ZeroDivisionError: division by zero).
- Subiendo por las líneas superiores se observa la cadena de llamadas (Call Stack), desde el punto de inicio (nivel1) hasta la línea exacta donde ocurrió la falla (nivel3: return 10/0).

¿En qué nivel debe capturarse idealmente?
Idealmente en el nivel superior de control o punto de entrada de la aplicación (`nivel1` o en la interfaz/controlador), porque:
1. Las funciones de bajo nivel (`nivel3`) deben enfocarse en su responsabilidad única sin tomar decisiones de UI o negocio.
2. El nivel superior tiene el contexto suficiente para decidir cómo responder (ej. notificar al usuario, reintentar, registrar logs o realizar un fallback limpio).

Uso de traceback.print_exc():
Al capturar la excepción con `except Exception as e`, la pila completa puede perderse si solo imprimimos `print(e)`. 
Para no perder el rastreo detallado del origen, usamos `traceback.print_exc()`.
"""

import traceback

def nivel3():
    return 10 / 0

def nivel2():
    nivel3()

def nivel1():
    nivel2()

if __name__ == "__main__":
    print("=== DEMOSTRACIÓN DEV 3 (EL RASTREADOR) ===")
    
    print("\n1. Captura en el nivel superior (nivel1) imprimiendo el Stack Trace con traceback.print_exc():\n")
    try:
        nivel1()
    except ZeroDivisionError as e:
        print("[Manejador Nivel 1]: Se atrapó la excepción propagada desde nivel3.")
        print("--- RASTREO COMPLETO DE LA PILA (STACK TRACE) ---")
        traceback.print_exc()
        print("-------------------------------------------------")
