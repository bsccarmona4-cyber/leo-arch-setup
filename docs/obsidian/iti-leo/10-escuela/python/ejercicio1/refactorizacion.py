"""
Ejercicio 1 - Refactorización con el IDE
=========================================
Este archivo demuestra cómo refactorizar código usando herramientas del IDE.

PRÁCTICA DE REFACTORIZACIÓN (Renombrado Automático):
====================================================
1. En VS Code: Clic derecho sobre el nombre de una función o clase → "Rename Symbol" (F2)
2. En PyCharm: Clic derecho → "Refactor" → "Rename" (Shift+F6)

Intenta renombrar:
  - La clase  'CarritoTemporal'  →  'CarritoDeCompras'
  - El método 'agregar_item'     →  'agregar_producto'
  - El atributo '_lista'         →  '_productos'

Observa cómo el IDE actualiza TODAS las referencias automáticamente.
"""

from ejercicio1.producto import Producto


class CarritoTemporal:
    """
    Clase que representa un carrito de compras temporal.

    NOTA: El nombre 'CarritoTemporal' es intencional.
          Practica renombrarlo a 'CarritoDeCompras' usando F2 en tu IDE.
    """

    def __init__(self, cliente: str) -> None:
        self._cliente: str = cliente
        self._lista: list[Producto] = []   # ← Practica renombrar a '_productos'
        self._total: float = 0.0

    def agregar_item(self, producto: Producto, cantidad: int) -> None:
        """
        Agrega un producto al carrito.

        NOTA: Practica renombrar este método a 'agregar_producto'.
              El IDE debería actualizar la llamada en mostrar_resumen() también.
        """
        self._lista.append(producto)
        subtotal = producto.get_precio() * cantidad
        self._total += subtotal
        print(f"  [+] {cantidad}x '{producto.get_nombre()}' → subtotal: ${subtotal:.2f}")

    def mostrar_resumen(self) -> None:
        """Muestra un resumen del carrito."""
        print(f"\n{'='*45}")
        print(f" Carrito de: {self._cliente}")
        print(f"{'='*45}")
        if not self._lista:
            print(" El carrito está vacío.")
        else:
            for idx, prod in enumerate(self._lista, start=1):
                print(f" {idx}. {prod.get_nombre()} — ${prod.get_precio():.2f}")
        print(f"{'='*45}")
        print(f" TOTAL: ${self._total:.2f}")
        print(f"{'='*45}\n")

    def vaciar(self) -> None:
        """Vacía el carrito."""
        self._lista.clear()
        self._total = 0.0
        print(f"[✓] Carrito de '{self._cliente}' vaciado.")


# -----------------------------------------------------------------------
# Demostración de uso (practica aquí la refactorización)
# -----------------------------------------------------------------------
if __name__ == "__main__":
    # Crear productos
    laptop = Producto("Laptop Gamer", 15_999.99, 5)
    mouse = Producto("Mouse Inalámbrico", 349.00, 20)
    teclado = Producto("Teclado Mecánico", 899.50, 12)

    # Crear carrito
    carrito = CarritoTemporal("Leo García")    # ← Referencia a la clase
    carrito2 = CarritoTemporal("Ana López")    # ← Otra referencia

    # Agregar items usando agregar_item (el método a refactorizar)
    print("Agregando productos al carrito de Leo:")
    carrito.agregar_item(laptop, 1)
    carrito.agregar_item(mouse, 2)
    carrito.mostrar_resumen()

    print("Agregando productos al carrito de Ana:")
    carrito2.agregar_item(teclado, 1)
    carrito2.agregar_item(mouse, 1)
    carrito2.mostrar_resumen()

    # Total de productos creados (usa el método de clase)
    print(f"Total de productos creados en el sistema: {Producto.total_productos_creados()}")
