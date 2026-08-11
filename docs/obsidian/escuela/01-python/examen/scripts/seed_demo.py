"""
seed_demo.py — Generador de datos de demostración para la cafetería.
Crea ventas realistas del último mes para que los reportes se vean espectaculares.
"""
import sys
import os
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import inicializar_bd
from database import conectar
from auth import iniciar_sesion
from pos import crear_venta
from clientes import registrar_cliente, listar_clientes, obtener_cliente
from lealtad import consultar_puntos, canjear_puntos, listar_promociones

# Productos con sus IDs reales (del seed inicial)
PRODUCTOS_SEED = [
    (1, "Americano", 45.00),
    (2, "Capuchino", 55.00),
    (3, "Latte", 60.00),
    (4, "Mocha", 65.00),
    (5, "Espresso", 35.00),
    (6, "Frappé de Café", 70.00),
    (7, "Té Verde", 40.00),
    (8, "Té Chai", 50.00),
    (9, "Chocolate Caliente", 50.00),
    (10, "Smoothie de Frutas", 65.00),
    (11, "Croissant", 35.00),
    (12, "Panini de Jamón", 75.00),
    (13, "Ensalada César", 85.00),
    (14, "Muffin de Arándano", 40.00),
    (15, "Galleta de Chocolate", 25.00),
    (16, "Sándwich Club", 90.00),
    (17, "Jugo de Naranja", 45.00),
    (18, "Agua Mineral", 20.00),
]

# Clientes demo adicionales
DEMO_CLIENTES = [
    ("Laura Vega", "5551112222", "laura@email.com", "1992-05-10"),
    ("Pedro Ramírez", "5553334444", "pedro@email.com", "1985-12-03"),
    ("Sofía Morales", "5555556666", "sofia@email.com", "1998-08-20"),
    ("Diego Torres", "5557778888", "diego@email.com", "1993-01-14"),
    ("Valentina Ruiz", "5559990000", "vale@email.com", "1997-06-30"),
]

# Combos típicos (simulan patrones reales de compra)
COMBOS = [
    [1, 11],           # Café + croissant
    [2, 14],           # Capuchino + muffin
    [3, 15],           # Latte + galleta
    [11, 15, 18],      # Croissant + galleta + agua
    [5],               # Espresso solo
    [6, 15],           # Frappé + galleta
    [7, 11],           # Té + croissant
    [12, 18],          # Panini + agua
    [13, 17],          # Ensalada + jugo
    [16, 17, 15],      # Sándwich + jugo + galleta
]


def generar_ventas_demo(dias=30, ventas_por_dia=(5, 15)):
    """Genera ventas aleatorias realistas del último mes."""
    inicializar_bd()

    # Obtener usuario admin para registrar ventas
    empleado = iniciar_sesion("admin", "admin123")
    if not empleado:
        print("Error: no se pudo iniciar sesión como admin.")
        return 0

    # Registrar clientes demo
    clientes_ids = [c["id"] for c in listar_clientes()]
    for nombre, tel, email, fnac in DEMO_CLIENTES:
        registrar_cliente(nombre, tel, email, fnac)
        from database import conectar as dbcon
        conn = dbcon()
        cid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        clientes_ids.append(cid)

    hoy = datetime.now()
    ventas_generadas = 0

    for dia_offset in range(dias, 0, -1):
        fecha = hoy - timedelta(days=dia_offset)
        num_ventas = random.randint(*ventas_por_dia)

        for _ in range(num_ventas):
            # Elegir combo o productos aleatorios
            if random.random() < 0.6:
                productos = random.choice(COMBOS)
            else:
                productos = [random.choice([p[0] for p in PRODUCTOS_SEED]) for _ in range(random.randint(1, 3))]

            items = [{"id_producto": pid, "cantidad": random.randint(1, 3)} for pid in productos]

            # ~70% de ventas van con cliente registrado
            id_cliente = random.choice(clientes_ids) if random.random() < 0.7 else None

            # A veces canjean puntos
            puntos_canjeados = 0
            descuento = 0
            if id_cliente and random.random() < 0.15:
                saldo = consultar_puntos(id_cliente)
                if saldo and saldo["puntos_disponibles"] > 30:
                    promos = listar_promociones()
                    if promos:
                        promo = random.choice(promos)
                        ex, msg, res = canjear_puntos(id_cliente, promo["id"])
                        if ex and res["promocion"]["tipo_recompensa"] == "descuento":
                            descuento = res["promocion"]["valor_recompensa"]
                            puntos_canjeados = res["puntos_usados"]

            exito, msg, ticket = crear_venta(empleado["id"], items, id_cliente, puntos_canjeados, descuento)
            if exito:
                ventas_generadas += 1

    return ventas_generadas


if __name__ == "__main__":
    print("🌱 Generando datos de demostración...")
    print("   Esto puede tardar unos segundos...")
    n = generar_ventas_demo(dias=30)
    print(f"\n✅ {n} ventas generadas en los últimos 30 días.")
    print("   Ejecuta el sistema y ve a 'Reportes' para ver los resultados.")
