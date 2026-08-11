"""
FASE 2: TALLER DE MECANISMOS - SALA A
Dev 2 - El Guardián: Bloques de manejo y Captura

Demostración de estructura completa:
- try: Código susceptible a errores.
- except Específicos (ValueError, ZeroDivisionError): Atrapan excepciones concretas.
- except Genérico (Exception): Captura cualquier otra excepción no contemplada previamente.
- else: Se ejecuta ÚNICAMENTE si no ocurrió ninguna excepción en el bloque try.
- finally: Se ejecuta SIEMPRE, haya ocurrido excepción o no (ideal para limpieza de recursos).

¿Por qué importa el orden de los except?
Python evalúa los bloques 'except' de arriba hacia abajo de manera secuencial.
Si colocamos un 'except Exception' (genérico) al principio, este atrapará TODAS las excepciones,
impidiendo que los excepts específicos (como ValueError) se ejecuten jamás.
Las excepciones más específicas siempre deben ir ANTES que las más genéricas.
"""

def solicitar_y_dividir_edad(entrada_raw: str):
    """
    Función helper para probar el manejo completo de bloques con entradas controladas.
    """
    print(f"\n--- Probando entrada: '{entrada_raw}' ---")
    try:
        edad = int(entrada_raw)
        resultado = 10 / edad
    except ValueError as e:
        print(f"[Error de Entrada - ValueError]: Debes ingresar un número entero válido. ({e})")
    except ZeroDivisionError as e:
        print(f"[Error Matemático - ZeroDivisionError]: La edad no puede ser 0 (División por cero). ({e})")
    except Exception as e:
        print(f"[Error Genérico - Exception]: Ha ocurrido un error inesperado de tipo {type(e).__name__}: {e}")
    else:
        print(f"[Éxito - else]: La operación fue exitosa. Resultado (10 / {edad}): {resultado:.2f}")
    finally:
        print("[Limpieza - finally]: Bloque 'finally' finalizado. Liberando recursos / Cerrando ciclo.")


if __name__ == "__main__":
    print("=== DEMOSTRACIÓN DEV 2 (EL GUARDIÁN) ===")
    
    # Caso 1: Entrada no numérica (ValueError)
    solicitar_y_dividir_edad("veinte")
    
    # Caso 2: Cero (ZeroDivisionError)
    solicitar_y_dividir_edad("0")
    
    # Caso 3: Entrada numérica válida (else + finally)
    solicitar_y_dividir_edad("5")
