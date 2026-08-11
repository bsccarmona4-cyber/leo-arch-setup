"""
Ejercicio 3: Depuración Paso a Paso
=====================================
Este módulo está diseñado específicamente para practicar el debugger.

INSTRUCCIONES PARA VS CODE:
  1. Abre este archivo en VS Code.
  2. Coloca un breakpoint (punto rojo) en las líneas marcadas con: # ← BREAKPOINT
  3. Presiona F5 (o clic en "Run and Debug") para iniciar en modo depuración.
  4. Usa los controles:
       F10 (Step Over)  → Avanza línea por línea SIN entrar en funciones.
       F11 (Step Into)  → Entra DENTRO del código de la función llamada.
       F5  (Continue)   → Continúa hasta el próximo breakpoint.
  5. Observa el panel "Variables" o "Watch" en la barra lateral izquierda.

INSTRUCCIONES PARA PyCharm:
  - Los atajos son F8 (Step Over), F7 (Step Into), F9 (Continue).
"""

from ejercicio1.producto import Producto


# =============================================================================
# Clase auxiliar para la práctica de debug
# =============================================================================

class Inventario:
    """Gestiona una colección de productos."""

    def __init__(self, nombre_tienda: str) -> None:
        self.nombre_tienda: str = nombre_tienda
        self._productos: list[Producto] = []

    def agregar(self, producto: Producto) -> None:
        """Agrega un producto al inventario."""
        self._productos.append(producto)

    def calcular_valor_total(self) -> float:
        """
        Calcula el valor total del inventario.

        ← COLOCA UN BREAKPOINT AQUÍ (línea del for).
        Observa cómo 'total' cambia en cada iteración del bucle.
        """
        total: float = 0.0
        for producto in self._productos:   # ← BREAKPOINT RECOMENDADO
            valor_item = producto.calcular_valor_inventario()
            total += valor_item
        return total

    def aplicar_descuento_general(self, porcentaje: float) -> list[dict]:
        """
        Aplica un descuento a todos los productos y retorna el resumen.

        ← COLOCA UN BREAKPOINT EN EL 'for' Y USA Step Into
          para entrar dentro de 'calcular_nuevo_precio' y ver su lógica.
        """
        resumen: list[dict] = []
        for prod in self._productos:   # ← BREAKPOINT RECOMENDADO
            precio_original = prod.get_precio()
            precio_nuevo = self._calcular_nuevo_precio(precio_original, porcentaje)
            resumen.append({
                "producto": prod.get_nombre(),
                "precio_original": precio_original,
                "precio_nuevo": precio_nuevo,
                "ahorro": precio_original - precio_nuevo,
            })
        return resumen

    def _calcular_nuevo_precio(self, precio: float, porcentaje: float) -> float:
        """
        Calcula el precio con descuento.

        ← Entra aquí con Step Into (F11) desde aplicar_descuento_general.
        Observa el valor de 'precio', 'porcentaje', 'descuento' y 'resultado'.
        """
        descuento = precio * (porcentaje / 100)   # ← Observa este valor en Watch
        resultado = precio - descuento
        return round(resultado, 2)

    def buscar_por_nombre(self, nombre: str) -> Producto | None:
        """
        Busca un producto por nombre (búsqueda lineal O(n)).

        ← COLOCA UN BREAKPOINT EN EL IF para ver cómo funciona
          la comparación en cada iteración.
        """
        for prod in self._productos:
            if prod.get_nombre().lower() == nombre.lower():   # ← BREAKPOINT
                return prod
        return None

    def listar(self) -> None:
        """Imprime todos los productos del inventario."""
        print(f"\n  Inventario de '{self.nombre_tienda}':")
        for i, prod in enumerate(self._productos, 1):
            print(f"    {i}. {prod}")


# =============================================================================
# Función con bucle complejo para depuración
# =============================================================================

def generar_reporte(inventario: Inventario, descuento: float) -> None:
    """
    Genera un reporte completo del inventario con descuentos.

    ← COLOCA UN BREAKPOINT EN LA PRIMERA LÍNEA DE ESTA FUNCIÓN
      y usa Step Over (F10) para recorrerla completa.
    """
    print("\n" + "═" * 55)
    print(f"  REPORTE: {inventario.nombre_tienda}")
    print("═" * 55)

    inventario.listar()

    valor_original = inventario.calcular_valor_total()   # ← Step Into aquí
    print(f"\n  Valor total del inventario: ${valor_original:,.2f}")

    print(f"\n  Aplicando descuento del {descuento}%:")
    resumen = inventario.aplicar_descuento_general(descuento)   # ← Step Into aquí

    for item in resumen:   # ← BREAKPOINT RECOMENDADO: observa 'item' en Variables
        print(
            f"    • {item['producto']:20s} "
            f"${item['precio_original']:>8.2f} → "
            f"${item['precio_nuevo']:>8.2f}  "
            f"(ahorro: ${item['ahorro']:.2f})"
        )

    valor_final = sum(i["precio_nuevo"] for i in resumen)
    print(f"\n  Valor estimado con descuento: ${valor_final:,.2f}")
    print(f"  Ahorro total: ${valor_original - valor_final:,.2f}")
    print("═" * 55)


# =============================================================================
# Punto de entrada principal
# =============================================================================

if __name__ == "__main__":
    print("╔══════════════════════════════════════════════╗")
    print("║   Ejercicio 3: Depuración Paso a Paso        ║")
    print("╚══════════════════════════════════════════════╝")
    print("\n[!] Ejecuta este programa en modo DEBUG de tu IDE.")
    print("    Coloca breakpoints en las líneas marcadas con  ← BREAKPOINT")

    # ── Crear inventario y productos ────────────────────────────────────────
    tienda = Inventario("TechStore México")

    # ← COLOCA UN BREAKPOINT AQUÍ para ver los objetos al crearse
    p1 = Producto("Monitor 4K", 7_500.00, 3)
    p2 = Producto("Laptop Ultrabook", 22_000.00, 6)
    p3 = Producto("Tablet Pro", 9_800.00, 10)
    p4 = Producto("Smartphone X", 12_500.00, 15)
    p5 = Producto("SSD 1TB", 1_850.00, 30)

    tienda.agregar(p1)
    tienda.agregar(p2)
    tienda.agregar(p3)
    tienda.agregar(p4)
    tienda.agregar(p5)

    # ── Generar reporte (múltiples breakpoints sugeridos dentro) ────────────
    generar_reporte(tienda, descuento=12.5)   # ← Step Into para entrar aquí

    # ── Búsqueda ────────────────────────────────────────────────────────────
    print("\n[Búsqueda de producto]")
    nombre_buscar = "SSD 1TB"
    encontrado = tienda.buscar_por_nombre(nombre_buscar)   # ← Step Into aquí

    if encontrado:
        print(f"  ✓ Encontrado: {encontrado}")
        encontrado.vender(5)
    else:
        print(f"  ✗ '{nombre_buscar}' no está en el inventario.")

    # ── Bucle de simulación de ventas ───────────────────────────────────────
    print("\n[Simulación de ventas múltiples]")
    ventas_simuladas = [
        ("Monitor 4K", 1),
        ("Tablet Pro", 3),
        ("Smartphone X", 2),
    ]

    total_recaudado: float = 0.0
    for nombre_prod, qty in ventas_simuladas:   # ← BREAKPOINT RECOMENDADO
        prod = tienda.buscar_por_nombre(nombre_prod)
        if prod is not None:
            try:
                recaudado = prod.vender(qty)
                total_recaudado += recaudado
            except ValueError as e:
                print(f"  [!] No se pudo vender '{nombre_prod}': {e}")

    print(f"\n  Total recaudado en simulación: ${total_recaudado:,.2f}")
    print("\n✓ Programa finalizado. Revisa el panel de Variables en tu IDE.")
