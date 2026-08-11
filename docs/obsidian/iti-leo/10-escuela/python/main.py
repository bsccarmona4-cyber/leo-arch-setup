"""
Ejercicio 2: Control de Compilación y Ejecución
================================================
Programa principal que instancia objetos de la clase Producto
y demuestra errores en tiempo de ejecución (equivalente Python
al NullPointerException de Java).

Ejecuta con:  python main.py
"""

import traceback
from ejercicio1.producto import Producto


# =============================================================================
# SECCIÓN 1: Ejecución exitosa (salida estándar esperada)
# =============================================================================

def demo_exitosa() -> None:
    """Demuestra la creación y uso correcto de objetos Producto."""
    print("\n" + "=" * 55)
    print("  SECCIÓN 1: Ejecución exitosa")
    print("=" * 55)

    # Instanciar objetos
    p1 = Producto("Laptop Pro", 18_500.00, 10)
    p2 = Producto("Auriculares BT", 650.50, 25)
    p3 = Producto("Webcam HD", 1_200.00, 8)

    # Mostrar información
    print("\n[Productos registrados]")
    print(f"  • {p1}")
    print(f"  • {p2}")
    print(f"  • {p3}")

    # Operaciones
    print("\n[Operaciones de venta]")
    p1.vender(2)
    p2.vender(5)

    print("\n[Agregar stock]")
    p3.agregar_stock(12)

    # Modificar nombre usando setter
    p1.set_nombre("Laptop Pro Max")
    print(f"\n[Producto renombrado]: {p1.get_nombre()}")

    # Usar setter con validación
    try:
        p2.set_precio(-100)       # Precio negativo → debe lanzar ValueError
    except ValueError as e:
        print(f"[!] Error de validación capturado correctamente: {e}")

    print(f"\n[Total instancias creadas]: {Producto.total_productos_creados()}")
    print("\n✓ Sección 1 finalizada sin errores.")


# =============================================================================
# SECCIÓN 2: NullPointerException en Python (AttributeError / NoneType)
# =============================================================================

def demo_null_pointer() -> None:
    """
    Demuestra el equivalente Python de un NullPointerException de Java.

    En Python no existe el concepto de 'null' como en Java, pero sí 'None'.
    Intentar llamar un método sobre None produce un AttributeError.
    El stack trace resultante es equivalente al NullPointerException.
    """
    print("\n" + "=" * 55)
    print("  SECCIÓN 2: NullPointerException (Python: AttributeError)")
    print("=" * 55)

    # ---- CASO 1: Variable inicializada como None ----
    print("\n[CASO 1] Variable declarada pero NO instanciada:")
    producto_nulo: Producto | None = None   # Nunca se instanció

    print(f"  Valor de 'producto_nulo': {producto_nulo}")
    print("  Intentando llamar .get_nombre() sobre None...")
    print()

    try:
        # Esta línea provoca el error → equivalente al NullPointerException
        nombre = producto_nulo.get_nombre()  # type: ignore[union-attr]
        print(f"  Nombre: {nombre}")
    except AttributeError as e:
        print("  ╔══════════════════════════════════════════════╗")
        print("  ║        STACK TRACE (Pila de llamadas)        ║")
        print("  ╚══════════════════════════════════════════════╝")
        traceback.print_exc()
        print(f"\n  [Resumen del error]: {type(e).__name__}: {e}")
        print("  → Causa: 'producto_nulo' es None (nunca fue instanciado).")
        print("  → Solución: Inicializar con   producto_nulo = Producto(...)")

    # ---- CASO 2: Función que retorna None cuando debería retornar un objeto ----
    print("\n" + "-" * 55)
    print("[CASO 2] Función que retorna None en vez de un Producto:")

    def buscar_producto_por_id(lista: list, id_buscado: int):
        """Simula una búsqueda fallida que retorna None."""
        for p in lista:
            if p.get_id() == id_buscado:
                return p
        return None  # ← Retorna None si no lo encuentra

    inventario = [Producto("Silla Gamer", 3_500.00, 4)]
    encontrado = buscar_producto_por_id(inventario, id_buscado=999)

    print(f"  Resultado de búsqueda: {encontrado}")
    print("  Intentando usar el objeto retornado sin verificar si es None...")
    print()

    try:
        # Sin verificar si encontrado es None → AttributeError
        precio = encontrado.get_precio()  # type: ignore[union-attr]
    except AttributeError as e:
        traceback.print_exc()
        print(f"\n  [Resumen del error]: {type(e).__name__}: {e}")
        print("  → Causa: La búsqueda no encontró el ID=999, retornó None.")
        print("  → Solución: Verificar con   if encontrado is not None:")

    # ---- CORRECCIÓN del CASO 2 ----
    print("\n[CORRECCIÓN del CASO 2] Con verificación defensiva:")
    encontrado2 = buscar_producto_por_id(inventario, id_buscado=999)
    if encontrado2 is not None:
        print(f"  Precio: ${encontrado2.get_precio():.2f}")
    else:
        print("  ✓ Producto no encontrado, manejado correctamente sin crash.")

    print("\n✓ Sección 2 finalizada (errores analizados correctamente).")


# =============================================================================
# PUNTO DE ENTRADA PRINCIPAL
# =============================================================================

if __name__ == "__main__":
    print("\n╔══════════════════════════════════════════════════════╗")
    print("║    Ejercicio 2: Control de Compilación y Ejecución   ║")
    print("╚══════════════════════════════════════════════════════╝")

    demo_exitosa()
    demo_null_pointer()

    print("\n" + "=" * 55)
    print("  FIN DEL PROGRAMA — Revisa el output en la consola.")
    print("=" * 55 + "\n")
