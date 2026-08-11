"""
FASE 1: RELACIÓN ERRORES vs EXCEPCIONES
Dev 1 - El Clasificador: Identifica y explica tipos de errores en el código.

Código analizado:
-----------------
def calcular_promedio(lista):
    suma = 0
    for i in lista          # <--- 1. Error de Sintaxis (Falta ':' al final del for)
        suma += i
    return suma / len(lista) # <--- 2. Error Lógico y 3. Excepción de Ejecución (División por cero si está vacía)

print(calcular_promedio([]))
"""

# ==========================================
# CÓDIGO CORREGIDO Y DEMOSTRACIÓN DE CAPTURA
# ==========================================

def calcular_promedio(lista):
    """
    Calcula el promedio de una lista de números.
    Maneja el caso de lista vacía para evitar errores lógicos y excepciones descontroladas.
    """
    if not lista:
        # Prevención de error lógico mediante validación previa
        raise ValueError("La lista no puede estar vacía para calcular un promedio.")
    
    suma = 0
    for i in lista: # Corrección de Sintaxis: Se agrega ':'
        suma += i
    
    return suma / len(lista)


if __name__ == "__main__":
    print("--- FASE 1: DEMOSTRACIÓN DEV 1 (EL CLASIFICADOR) ---")
    
    # Prueba 1: Lista válida
    numeros = [10, 20, 30, 40]
    print(f"Promedio de {numeros}: {calcular_promedio(numeros)}")

    # Prueba 2: Captura de la excepción al pasar lista vacía
    try:
        print(calcular_promedio([]))
    except ValueError as e:
        print(f"[EXCEPCIÓN CAPTURADA EN EJECUCIÓN]: {e}")
    except ZeroDivisionError as e:
        print(f"[EXCEPCIÓN CAPTURADA DE DIVISIÓN POR CERO]: {e}")
