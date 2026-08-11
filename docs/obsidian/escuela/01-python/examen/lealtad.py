from database import conectar
from datetime import datetime

# Defino la tasa de puntos: 1 punto por cada $10 de compra
TASA_PUNTOS = 10


def calcular_puntos(monto_compra):
    """Calculo cuántos puntos corresponden según el monto de la compra."""
    return int(monto_compra // TASA_PUNTOS)


def otorgar_puntos(id_cliente, monto_compra, id_venta=None):
    """Asigno puntos al cliente después de registrar una compra."""
    puntos = calcular_puntos(monto_compra)
    if puntos <= 0:
        return 0

    conn = conectar()
    cursor = conn.cursor()

    try:
        # Actualizo el saldo de puntos del cliente
        cursor.execute(
            "UPDATE puntos_lealtad SET puntos_acumulados = puntos_acumulados + ?, "
            "puntos_disponibles = puntos_disponibles + ? WHERE id_cliente = ?",
            (puntos, puntos, id_cliente)
        )

        # Registro el movimiento
        descripcion = f"Puntos por compra (Venta #{id_venta})" if id_venta else "Puntos por compra"
        cursor.execute(
            "INSERT INTO movimientos_puntos (id_cliente, tipo, puntos, descripcion) VALUES (?, ?, ?, ?)",
            (id_cliente, "acumulacion", puntos, descripcion)
        )

        conn.commit()
        return puntos
    except Exception:
        conn.rollback()
        return 0
    finally:
        conn.close()


def consultar_puntos(id_cliente):
    """Consulto el saldo de puntos disponibles de un cliente."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT puntos_acumulados, puntos_canjeados, puntos_disponibles "
        "FROM puntos_lealtad WHERE id_cliente = ?",
        (id_cliente,)
    )
    saldo = cursor.fetchone()
    conn.close()
    return dict(saldo) if saldo else None


def listar_promociones(solo_activas=True):
    """Obtengo las promociones disponibles para canje de puntos."""
    conn = conectar()
    cursor = conn.cursor()

    if solo_activas:
        hoy = datetime.now().strftime("%Y-%m-%d")
        cursor.execute(
            "SELECT * FROM promociones WHERE activa = 1 AND "
            "(fecha_inicio IS NULL OR fecha_inicio <= ?) AND "
            "(fecha_fin IS NULL OR fecha_fin >= ?) "
            "ORDER BY puntos_requeridos",
            (hoy, hoy)
        )
    else:
        cursor.execute("SELECT * FROM promociones ORDER BY puntos_requeridos")

    promociones = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return promociones


def canjear_puntos(id_cliente, id_promocion):
    """Proceso el canje de puntos de un cliente por una promoción."""
    conn = conectar()
    cursor = conn.cursor()

    try:
        # Verifico la promoción
        cursor.execute("SELECT * FROM promociones WHERE id = ? AND activa = 1", (id_promocion,))
        promocion = cursor.fetchone()

        if not promocion:
            return False, "La promoción no está disponible.", None

        # Verifico que el cliente tenga puntos suficientes
        cursor.execute(
            "SELECT puntos_disponibles FROM puntos_lealtad WHERE id_cliente = ?",
            (id_cliente,)
        )
        saldo = cursor.fetchone()

        if not saldo:
            return False, "No encontré el registro de puntos del cliente.", None

        if saldo["puntos_disponibles"] < promocion["puntos_requeridos"]:
            return False, (
                f"Puntos insuficientes. Se requieren {promocion['puntos_requeridos']} "
                f"y el cliente tiene {saldo['puntos_disponibles']}."
            ), None

        # Realizo el canje
        puntos_requeridos = promocion["puntos_requeridos"]
        cursor.execute(
            "UPDATE puntos_lealtad SET puntos_canjeados = puntos_canjeados + ?, "
            "puntos_disponibles = puntos_disponibles - ? WHERE id_cliente = ?",
            (puntos_requeridos, puntos_requeridos, id_cliente)
        )

        # Registro el movimiento de canje
        cursor.execute(
            "INSERT INTO movimientos_puntos (id_cliente, tipo, puntos, descripcion) VALUES (?, ?, ?, ?)",
            (id_cliente, "canje", puntos_requeridos, f"Canje: {promocion['nombre']}")
        )

        conn.commit()

        resultado = {
            "promocion": dict(promocion),
            "puntos_usados": puntos_requeridos,
            "puntos_restantes": saldo["puntos_disponibles"] - puntos_requeridos
        }
        return True, f"Canje exitoso: {promocion['nombre']}", resultado

    except Exception as e:
        conn.rollback()
        return False, f"No pude procesar el canje: {e}", None
    finally:
        conn.close()


def otorgar_puntos_cumpleanos(id_cliente, puntos_extra=20):
    """Otorgo puntos adicionales a un cliente por su cumpleaños."""
    conn = conectar()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "UPDATE puntos_lealtad SET puntos_acumulados = puntos_acumulados + ?, "
            "puntos_disponibles = puntos_disponibles + ? WHERE id_cliente = ?",
            (puntos_extra, puntos_extra, id_cliente)
        )

        cursor.execute(
            "INSERT INTO movimientos_puntos (id_cliente, tipo, puntos, descripcion) VALUES (?, ?, ?, ?)",
            (id_cliente, "bonificacion", puntos_extra, "Puntos de cumpleaños")
        )

        conn.commit()
        return True, f"Se otorgaron {puntos_extra} puntos de cumpleaños."
    except Exception:
        conn.rollback()
        return False, "No pude otorgar los puntos de cumpleaños."
    finally:
        conn.close()


def crear_promocion(nombre, descripcion, puntos_requeridos, tipo_recompensa, valor_recompensa,
                    fecha_inicio=None, fecha_fin=None):
    """Creo una nueva promoción en el catálogo de recompensas."""
    conn = conectar()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """INSERT INTO promociones 
               (nombre, descripcion, puntos_requeridos, tipo_recompensa, valor_recompensa, fecha_inicio, fecha_fin) 
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (nombre, descripcion, puntos_requeridos, tipo_recompensa, valor_recompensa,
             fecha_inicio, fecha_fin)
        )
        conn.commit()
        return True, "Promoción creada correctamente."
    except Exception as e:
        conn.rollback()
        return False, f"No pude crear la promoción: {e}"
    finally:
        conn.close()
