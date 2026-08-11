"""
Ejercicio 1 - Errores de Sintaxis Intencionales
================================================a
Este archivo muestra errores comunes de sintaxis en Python
que los IDEs modernos (VS Code, PyCharm) detectan ANTES de ejecutar.

INSTRUCCIONES:
  Abre este archivo en tu IDE y observa cómo se subrayan los errores.
  Luego corrígelos uno por uno usando las sugerencias del editor.

NOTA: Este archivo NO está diseñado para ejecutarse con errores activos.
      Descomenta cada bloque de "VERSIÓN CON ERROR" para ver el efecto.
"""

# =============================================================================
# ERROR 1: Paréntesis sin cerrar
# =============================================================================
# VERSIÓN CON ERROR (descomenta la línea siguiente):
# print("Hola mundo"     # <-- falta cerrar el paréntesis

# VERSIÓN CORREGIDA:
print("Hola mundo")  # ✓ Paréntesis cerrado correctamente


# =============================================================================
# ERROR 2: Indentación incorrecta
# =============================================================================
def saludar(nombre: str) -> str:
    # VERSIÓN CON ERROR:
    # return f"Hola, {nombre}"   # Sin sangría correcta causaría IndentationError
    # (en este archivo la dejamos correcta para poder ejecutarlo)

    # VERSIÓN CORREGIDA:
    return f"Hola, {nombre}"  # ✓ Indentación de 4 espacios


# =============================================================================
# ERROR 3: Variable no definida (NameError)
# =============================================================================
# VERSIÓN CON ERROR (descomenta):
# resultado = precio_total * 2   # <-- 'precio_total' no está definido

# VERSIÓN CORREGIDA:
precio_total: float = 99.99
resultado: float = precio_total * 2  # ✓ Variable declarada antes de usarse


# =============================================================================
# ERROR 4: Tipo de dato incorrecto (TypeError en tiempo de ejecución)
# =============================================================================
def sumar(a: int, b: int) -> int:
    return a + b


# VERSIÓN CON ERROR (descomenta):
# valor = sumar("10", 5)   # <-- str + int → TypeError

# VERSIÓN CORREGIDA:
valor: int = sumar(10, 5)  # ✓ Ambos argumentos son enteros


# =============================================================================
# ERROR 5: Dos puntos faltantes en definición de clase/función/bloque
# =============================================================================
# VERSIÓN CON ERROR (descomenta):
# class MiClase    # <-- falta ':'
#     pass

# VERSIÓN CORREGIDA:
class MiClase:  # ✓ Dos puntos al final
    pass


# =============================================================================
# ERROR 6: Usar una variable antes de asignarla dentro de una función
# =============================================================================
def calcular_descuento(precio: float, porcentaje: float) -> float:
    # VERSIÓN CON ERROR:
    # return precio - descuento   # <-- 'descuento' no está asignado aún

    # VERSIÓN CORREGIDA:
    descuento: float = precio * (porcentaje / 100)
    return precio - descuento  # ✓ Primero calcula, luego retorna


# =============================================================================
# DEMOSTRACIÓN DE AUTOCOMPLETADO
# =============================================================================
# Escribe "MiClase." en tu IDE y observa las sugerencias de métodos.
# Escribe "precio_total." para ver los métodos disponibles de float.

instancia = MiClase()

if __name__ == "__main__":
    print("=== Demostración de Errores de Sintaxis ===")
    print(saludar("Estudiante"))
    print(f"Precio original: ${precio_total:.2f}")
    print(f"Resultado x2: ${resultado:.2f}")
    print(f"Suma: {valor}")
    print(f"Precio con 15% descuento: ${calcular_descuento(precio_total, 15):.2f}")
    print("✓ Todos los errores han sido corregidos exitosamente.")
