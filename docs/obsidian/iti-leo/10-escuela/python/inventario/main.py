"""
main.py — Demo principal del Sistema de Inventario POO.

EJECUTA CON:  python -m inventario.main   (desde la carpeta python/)
              O bien:  python main.py       (desde la carpeta inventario/)

Demuestra:
    1. Inicialización de BD con SQLite local (sin internet)
    2. Registro de productos
    3. LOS 3 CASOS QUE PEDIRÁ EL PROFESOR en demo
    4. Bloque try-except capturando 4 tipos de excepción
    5. git log --oneline (instrucción al final)
"""

import sys
import os

# Permitir ejecutar desde la carpeta inventario/ directamente
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.db import inicializar_bd
from src.dao import ProductoDAO
from src.servicio import InventarioService
from src.excepciones import (
    StockInsuficienteError,
    ProductoNoEncontradoError,
    PrecioInvalidoError,
)
import sqlite3


# =============================================================================
# HELPERS DE PRESENTACIÓN
# =============================================================================

def encabezado(texto: str) -> None:
    ancho = 60
    print("\n" + "═" * ancho)
    print(f"  {texto}")
    print("═" * ancho)


def separador() -> None:
    print("-" * 60)


def main() -> None:
    print("SISTEMA DE INVENTARIO POO")
    print("      Equipo: LEO & BERE")


    encabezado("SETUP: Base de Datos SQLite Local")
    inicializar_bd()           # Lee DB_PATH de .env
    dao = ProductoDAO()
    servicio = InventarioService(dao)
    print("✓ BD inicializada sin necesidad de internet (SQLite local).")


    encabezado("REGISTRAR PRODUCTOS en BD")
    p_mouse = servicio.registrar_producto("Mouse Inalámbrico", 350.0, 3)
    p_teclado = servicio.registrar_producto("Teclado Mecánico", 1200.0, 10)
    p_monitor = servicio.registrar_producto("Monitor 27\"", 8500.0, 2)

    separador()
    print(" Inventario actual:")
    for p in servicio.listar_productos():
        print(f"   {p.describir()}")


    encabezado("CASO 1 (PROFESOR): Producto(\"Mouse\", -50, 5)")
    print("→ Debe tronar con PrecioInvalidoError\n")

    try:
        servicio.registrar_producto("Mouse", -50, 5)
    except PrecioInvalidoError as e:
        print(f"  ✓ PrecioInvalidoError capturado:")
        print(f"    {e}")
        print(f"    Tipo: {type(e).__name__} → hereda de ValueError → hereda de Exception")

    encabezado("CASO 2 (PROFESOR): Vender 10 cuando hay 3")
    print(f"→ Mouse tiene {dao.buscar_por_id(p_mouse.id).stock} unidades en stock\n")

    try:
        servicio.vender(p_mouse.id, 10)
    except StockInsuficienteError as e:
        print(f"  ✓ StockInsuficienteError capturado:")
        print(f"    {e}")
        print(f"    Stock disponible: {e.stock_disponible} | Pedido: {e.cantidad_pedida}")
        print(f"    El inventario NO se modificó (transacción segura).")

    encabezado("CASO 3 (PROFESOR): Operar sin internet")
    print("→ SQLite es un archivo LOCAL, no requiere red\n")
    total = servicio.vender(p_teclado.id, 2)
    print(f"  ✓ Venta exitosa sin internet: ${total:.2f}")
    print(f"  Stock restante: {dao.buscar_por_id(p_teclado.id).stock} unidades")


    encabezado("BONUS: try-except con 4 tipos de excepción")
    print("→ Capturando de específico a general (buena práctica)\n")

    operaciones = [
        ("Vender cantidad inválida",  lambda: servicio.vender(p_mouse.id, -1)),
        ("Vender ID inexistente",     lambda: servicio.vender(99999, 1)),
        ("Vender más del stock",      lambda: servicio.vender(p_mouse.id, 100)),
        ("Precio inválido",           lambda: servicio.registrar_producto("X", 0, 1)),
    ]

    for descripcion, operacion in operaciones:
        separador()
        print(f"  Operación: {descripcion}")
        try:
            operacion()
        except PrecioInvalidoError as e:          # Más específico primero
            print(f"  [PrecioInvalidoError]       → {e}")
        except StockInsuficienteError as e:        # Excepción custom
            print(f"  [StockInsuficienteError]    → {e}")
        except ProductoNoEncontradoError as e:     # Excepción custom
            print(f"  [ProductoNoEncontradoError] → {e}")
        except ValueError as e:                    # Más general
            print(f"  [ValueError]               → {e}")
        except sqlite3.Error as e:                 # Error de BD
            print(f"  [sqlite3.Error]            → {e}")


    #  DIAGRAMA DE CLASES (texto)                                          #

    encabezado("DIAGRAMA DE CLASES (resumen expo)")
    print("""
    <<abstract>> ItemInventario
         ├── nombre: str        (@property)
         ├── precio: float      (@property + setter con validación)
         └── describir(): str   (abstracto → POLIMORFISMO)
                  │
                  ▼ hereda (HERENCIA)
             Producto
                  ├── stock: int   (@property + setter)
                  ├── id: int      (solo getter → inmutable)
                  └── describir() ← implementación concreta

    ProductoDAO       InventarioService
    ─────────────     ─────────────────
    guardar()         vender()     → 3 raises distintos
    buscar_por_id()   reabastecer()
    actualizar()      registrar_producto()

    Excepciones:
    Exception ─── StockInsuficienteError
              └── ProductoNoEncontradoError
    ValueError ── PrecioInvalidoError
    """)

    encabezado("FIN DE LA DEMO")
    print("  Para ver el historial Git del equipo, ejecuta:")
    print("  git log --oneline --graph --all\n")
    print("  Para correr las pruebas unitarias:")
    print("  python -m unittest discover -v tests/\n")


if __name__ == "__main__":
    main()
