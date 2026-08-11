from database import conectar


def registrar_cliente(nombre, telefono=None, email=None, fecha_nacimiento=None):
    """Registro a un nuevo cliente frecuente en el sistema."""
    conn = conectar()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO clientes (nombre, telefono, email, fecha_nacimiento) VALUES (?, ?, ?, ?)",
            (nombre, telefono, email, fecha_nacimiento)
        )
        id_cliente = cursor.lastrowid

        # Inicializo su registro de puntos de lealtad
        cursor.execute(
            "INSERT INTO puntos_lealtad (id_cliente) VALUES (?)",
            (id_cliente,)
        )

        conn.commit()
        return True, f"Cliente '{nombre}' registrado con ID {id_cliente}."
    except Exception as e:
        conn.rollback()
        return False, f"No pude registrar al cliente: {e}"
    finally:
        conn.close()


def editar_cliente(id_cliente, nombre=None, telefono=None, email=None, fecha_nacimiento=None):
    """Actualizo la información de un cliente existente."""
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM clientes WHERE id = ?", (id_cliente,))
    cliente = cursor.fetchone()

    if not cliente:
        conn.close()
        return False, "No encontré al cliente indicado."

    nombre = nombre if nombre else cliente["nombre"]
    telefono = telefono if telefono else cliente["telefono"]
    email = email if email else cliente["email"]
    fecha_nacimiento = fecha_nacimiento if fecha_nacimiento else cliente["fecha_nacimiento"]

    cursor.execute(
        "UPDATE clientes SET nombre = ?, telefono = ?, email = ?, fecha_nacimiento = ? WHERE id = ?",
        (nombre, telefono, email, fecha_nacimiento, id_cliente)
    )
    conn.commit()
    conn.close()
    return True, "Datos del cliente actualizados."


def buscar_cliente(termino):
    """Busco clientes por nombre o teléfono."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT c.*, pl.puntos_disponibles FROM clientes c "
        "LEFT JOIN puntos_lealtad pl ON c.id = pl.id_cliente "
        "WHERE c.nombre LIKE ? OR c.telefono LIKE ? ORDER BY c.nombre",
        (f"%{termino}%", f"%{termino}%")
    )
    clientes = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return clientes


def obtener_cliente(id_cliente):
    """Obtengo los datos completos de un cliente, incluyendo su saldo de puntos."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT c.*, pl.puntos_acumulados, pl.puntos_canjeados, pl.puntos_disponibles "
        "FROM clientes c "
        "LEFT JOIN puntos_lealtad pl ON c.id = pl.id_cliente "
        "WHERE c.id = ?",
        (id_cliente,)
    )
    cliente = cursor.fetchone()
    conn.close()
    return dict(cliente) if cliente else None


def listar_clientes():
    """Obtengo la lista completa de clientes con su saldo de puntos."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT c.*, pl.puntos_disponibles FROM clientes c "
        "LEFT JOIN puntos_lealtad pl ON c.id = pl.id_cliente "
        "ORDER BY c.nombre"
    )
    clientes = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return clientes


def historial_compras(id_cliente):
    """Consulto el historial de compras de un cliente específico."""
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT v.id, v.fecha, v.total, v.puntos_otorgados, v.puntos_canjeados "
        "FROM ventas v WHERE v.id_cliente = ? ORDER BY v.fecha DESC",
        (id_cliente,)
    )
    ventas = [dict(fila) for fila in cursor.fetchall()]

    # Para cada venta, obtengo el detalle de productos comprados
    for venta in ventas:
        cursor.execute(
            "SELECT dv.cantidad, dv.precio_unitario, dv.subtotal, p.nombre "
            "FROM detalle_ventas dv "
            "JOIN productos p ON dv.id_producto = p.id "
            "WHERE dv.id_venta = ?",
            (venta["id"],)
        )
        venta["detalle"] = [dict(d) for d in cursor.fetchall()]

    conn.close()
    return ventas


def clientes_cumpleanos_mes(mes=None):
    """Busco los clientes que cumplen años en el mes indicado (o en el mes actual)."""
    conn = conectar()
    cursor = conn.cursor()

    if mes is None:
        from datetime import datetime
        mes = datetime.now().month

    cursor.execute(
        "SELECT c.*, pl.puntos_disponibles FROM clientes c "
        "LEFT JOIN puntos_lealtad pl ON c.id = pl.id_cliente "
        "WHERE CAST(strftime('%m', c.fecha_nacimiento) AS INTEGER) = ? "
        "ORDER BY c.fecha_nacimiento",
        (mes,)
    )
    clientes = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return clientes


def movimientos_puntos_cliente(id_cliente):
    """Consulto los movimientos de puntos de un cliente."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM movimientos_puntos WHERE id_cliente = ? ORDER BY fecha DESC",
        (id_cliente,)
    )
    movimientos = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return movimientos
