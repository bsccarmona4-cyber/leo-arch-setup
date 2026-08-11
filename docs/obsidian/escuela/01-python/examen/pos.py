from database import conectar
from productos import actualizar_stock
from lealtad import calcular_puntos, otorgar_puntos


def crear_venta(id_usuario, items, id_cliente=None, puntos_a_canjear=0, descuento_porcentaje=0):
    """
    Proceso una venta completa en el punto de venta.
    Recibo una lista de items con formato: [{"id_producto": int, "cantidad": int}, ...]
    """
    conn = conectar()
    cursor = conn.cursor()

    try:
        total = 0.0
        detalles = []

        # Calculo el subtotal de cada producto y verifico existencias
        for item in items:
            cursor.execute(
                "SELECT id, nombre, precio, stock FROM productos WHERE id = ? AND activo = 1",
                (item["id_producto"],)
            )
            producto = cursor.fetchone()

            if not producto:
                return False, f"El producto con ID {item['id_producto']} no está disponible.", None

            if producto["stock"] < item["cantidad"]:
                return False, (
                    f"Stock insuficiente para '{producto['nombre']}'. "
                    f"Disponible: {producto['stock']}, solicitado: {item['cantidad']}."
                ), None

            subtotal = producto["precio"] * item["cantidad"]
            total += subtotal
            detalles.append({
                "id_producto": producto["id"],
                "nombre": producto["nombre"],
                "cantidad": item["cantidad"],
                "precio_unitario": producto["precio"],
                "subtotal": subtotal
            })

        # Aplico descuento si hay uno vigente
        descuento = 0
        if descuento_porcentaje > 0:
            descuento = total * (descuento_porcentaje / 100)
            total -= descuento

        # Calculo los puntos que se otorgarán
        puntos_otorgados = 0
        if id_cliente:
            puntos_otorgados = calcular_puntos(total)

        # Registro la venta
        cursor.execute(
            "INSERT INTO ventas (id_usuario, id_cliente, total, puntos_otorgados, puntos_canjeados) "
            "VALUES (?, ?, ?, ?, ?)",
            (id_usuario, id_cliente, round(total, 2), puntos_otorgados, puntos_a_canjear)
        )
        id_venta = cursor.lastrowid

        # Registro el detalle de cada producto vendido
        for detalle in detalles:
            cursor.execute(
                "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) "
                "VALUES (?, ?, ?, ?, ?)",
                (id_venta, detalle["id_producto"], detalle["cantidad"],
                 detalle["precio_unitario"], detalle["subtotal"])
            )

        # Descuento el stock de cada producto
        for item in items:
            cursor.execute(
                "UPDATE productos SET stock = stock - ? WHERE id = ?",
                (item["cantidad"], item["id_producto"])
            )

        conn.commit()

        # Otorgo puntos al cliente si está registrado
        if id_cliente and puntos_otorgados > 0:
            otorgar_puntos(id_cliente, total, id_venta)

        ticket = {
            "id_venta": id_venta,
            "detalles": detalles,
            "subtotal": sum(d["subtotal"] for d in detalles),
            "descuento": round(descuento, 2),
            "total": round(total, 2),
            "puntos_otorgados": puntos_otorgados,
            "puntos_canjeados": puntos_a_canjear,
            "id_cliente": id_cliente
        }
        return True, "Venta registrada correctamente.", ticket

    except Exception as e:
        conn.rollback()
        return False, f"No pude procesar la venta: {e}", None
    finally:
        conn.close()


def imprimir_ticket(ticket):
    """Genero la representación en texto del ticket de venta."""
    lineas = []
    lineas.append("")
    lineas.append("=" * 48)
    lineas.append("           CAFETERÍA - TICKET DE VENTA")
    lineas.append("=" * 48)
    lineas.append(f"  Folio: #{ticket['id_venta']}")

    from datetime import datetime
    lineas.append(f"  Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    lineas.append("-" * 48)
    lineas.append(f"  {'Producto':<20} {'Cant':>5} {'P.U.':>8} {'Subt.':>8}")
    lineas.append("-" * 48)

    for d in ticket["detalles"]:
        nombre = d["nombre"][:20]
        lineas.append(
            f"  {nombre:<20} {d['cantidad']:>5} ${d['precio_unitario']:>7.2f} ${d['subtotal']:>7.2f}"
        )

    lineas.append("-" * 48)
    lineas.append(f"  {'Subtotal:':<35} ${ticket['subtotal']:>7.2f}")

    if ticket["descuento"] > 0:
        lineas.append(f"  {'Descuento:':<35} -${ticket['descuento']:>6.2f}")

    lineas.append(f"  {'TOTAL:':<35} ${ticket['total']:>7.2f}")
    lineas.append("-" * 48)

    if ticket["id_cliente"]:
        lineas.append(f"  Puntos otorgados: +{ticket['puntos_otorgados']}")
        if ticket["puntos_canjeados"] > 0:
            lineas.append(f"  Puntos canjeados: -{ticket['puntos_canjeados']}")

    lineas.append("=" * 48)
    lineas.append("         ¡Gracias por tu preferencia!")
    lineas.append("=" * 48)
    lineas.append("")

    texto_ticket = "\n".join(lineas)
    return texto_ticket


def obtener_venta(id_venta):
    """Consulto los datos de una venta específica."""
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM ventas WHERE id = ?", (id_venta,))
    venta = cursor.fetchone()

    if not venta:
        conn.close()
        return None

    venta_dict = dict(venta)

    cursor.execute(
        "SELECT dv.*, p.nombre FROM detalle_ventas dv "
        "JOIN productos p ON dv.id_producto = p.id "
        "WHERE dv.id_venta = ?",
        (id_venta,)
    )
    venta_dict["detalles"] = [dict(d) for d in cursor.fetchall()]
    conn.close()
    return venta_dict
