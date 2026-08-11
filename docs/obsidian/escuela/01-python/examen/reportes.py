from database import conectar
from datetime import datetime, timedelta


def reporte_ventas_dia(fecha=None):
    """Genero el reporte de ventas de un día específico (por defecto hoy)."""
    if fecha is None:
        fecha = datetime.now().strftime("%Y-%m-%d")

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT v.id, v.fecha, v.total, v.puntos_otorgados, c.nombre as cliente, u.nombre as cajero "
        "FROM ventas v "
        "LEFT JOIN clientes c ON v.id_cliente = c.id "
        "JOIN usuarios u ON v.id_usuario = u.id "
        "WHERE date(v.fecha) = ? ORDER BY v.fecha",
        (fecha,)
    )
    ventas = [dict(fila) for fila in cursor.fetchall()]

    total_dia = sum(v["total"] for v in ventas)
    num_ventas = len(ventas)

    conn.close()

    return {
        "fecha": fecha,
        "ventas": ventas,
        "total_dia": round(total_dia, 2),
        "num_ventas": num_ventas,
        "promedio": round(total_dia / num_ventas, 2) if num_ventas > 0 else 0
    }


def reporte_ventas_periodo(fecha_inicio, fecha_fin):
    """Genero el reporte de ventas de un período determinado."""
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT date(v.fecha) as dia, COUNT(*) as num_ventas, SUM(v.total) as total_dia "
        "FROM ventas v "
        "WHERE date(v.fecha) BETWEEN ? AND ? "
        "GROUP BY date(v.fecha) ORDER BY dia",
        (fecha_inicio, fecha_fin)
    )
    dias = [dict(fila) for fila in cursor.fetchall()]

    total_periodo = sum(d["total_dia"] for d in dias)
    total_ventas = sum(d["num_ventas"] for d in dias)

    conn.close()

    return {
        "fecha_inicio": fecha_inicio,
        "fecha_fin": fecha_fin,
        "dias": dias,
        "total_periodo": round(total_periodo, 2),
        "total_ventas": total_ventas,
        "promedio_diario": round(total_periodo / len(dias), 2) if dias else 0
    }


def productos_mas_vendidos(limite=10, fecha_inicio=None, fecha_fin=None):
    """Obtengo los productos más vendidos, opcionalmente filtrados por fecha."""
    conn = conectar()
    cursor = conn.cursor()

    query = (
        "SELECT p.nombre, p.categoria, SUM(dv.cantidad) as total_vendido, "
        "SUM(dv.subtotal) as total_ingresos "
        "FROM detalle_ventas dv "
        "JOIN productos p ON dv.id_producto = p.id "
        "JOIN ventas v ON dv.id_venta = v.id "
    )
    params = []

    if fecha_inicio and fecha_fin:
        query += "WHERE date(v.fecha) BETWEEN ? AND ? "
        params.extend([fecha_inicio, fecha_fin])

    query += "GROUP BY dv.id_producto ORDER BY total_vendido DESC LIMIT ?"
    params.append(limite)

    cursor.execute(query, params)
    productos = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return productos


def ranking_clientes(limite=10):
    """Obtengo el ranking de clientes con más compras y puntos acumulados."""
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT c.nombre, c.telefono, COUNT(v.id) as total_compras, "
        "SUM(v.total) as total_gastado, pl.puntos_disponibles, pl.puntos_acumulados "
        "FROM clientes c "
        "JOIN ventas v ON c.id = v.id_cliente "
        "JOIN puntos_lealtad pl ON c.id = pl.id_cliente "
        "GROUP BY c.id ORDER BY total_gastado DESC LIMIT ?",
        (limite,)
    )
    ranking = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return ranking


def reporte_categorias(fecha_inicio=None, fecha_fin=None):
    """Genero un reporte de ventas agrupado por categoría de producto."""
    conn = conectar()
    cursor = conn.cursor()

    query = (
        "SELECT p.categoria, COUNT(DISTINCT v.id) as num_ventas, "
        "SUM(dv.cantidad) as unidades, SUM(dv.subtotal) as ingresos "
        "FROM detalle_ventas dv "
        "JOIN productos p ON dv.id_producto = p.id "
        "JOIN ventas v ON dv.id_venta = v.id "
    )
    params = []

    if fecha_inicio and fecha_fin:
        query += "WHERE date(v.fecha) BETWEEN ? AND ? "
        params.extend([fecha_inicio, fecha_fin])

    query += "GROUP BY p.categoria ORDER BY ingresos DESC"

    cursor.execute(query, params)
    categorias = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return categorias


def resumen_general():
    """Genero un resumen general del estado del negocio."""
    conn = conectar()
    cursor = conn.cursor()

    hoy = datetime.now().strftime("%Y-%m-%d")

    # Ventas de hoy
    cursor.execute(
        "SELECT COUNT(*) as ventas, COALESCE(SUM(total), 0) as ingresos "
        "FROM ventas WHERE date(fecha) = ?", (hoy,)
    )
    hoy_data = dict(cursor.fetchone())

    # Ventas del mes actual
    primer_dia_mes = datetime.now().replace(day=1).strftime("%Y-%m-%d")
    cursor.execute(
        "SELECT COUNT(*) as ventas, COALESCE(SUM(total), 0) as ingresos "
        "FROM ventas WHERE date(fecha) >= ?", (primer_dia_mes,)
    )
    mes_data = dict(cursor.fetchone())

    # Totales generales
    cursor.execute("SELECT COUNT(*) as total FROM clientes")
    total_clientes = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM productos WHERE activo = 1")
    total_productos = cursor.fetchone()["total"]

    # Productos con stock bajo (menos de 10 unidades)
    cursor.execute(
        "SELECT nombre, stock FROM productos WHERE stock < 10 AND activo = 1 ORDER BY stock"
    )
    stock_bajo = [dict(fila) for fila in cursor.fetchall()]

    conn.close()

    return {
        "hoy": {
            "ventas": hoy_data["ventas"],
            "ingresos": round(hoy_data["ingresos"], 2)
        },
        "mes": {
            "ventas": mes_data["ventas"],
            "ingresos": round(mes_data["ingresos"], 2)
        },
        "total_clientes": total_clientes,
        "total_productos": total_productos,
        "stock_bajo": stock_bajo
    }


def mostrar_reporte_ventas_dia(reporte):
    """Presento el reporte de ventas del día en formato legible."""
    lineas = []
    lineas.append("")
    lineas.append("=" * 60)
    lineas.append(f"  REPORTE DE VENTAS - {reporte['fecha']}")
    lineas.append("=" * 60)
    lineas.append(f"  Total de ventas: {reporte['num_ventas']}")
    lineas.append(f"  Ingresos del día: ${reporte['total_dia']:,.2f}")
    lineas.append(f"  Promedio por venta: ${reporte['promedio']:,.2f}")
    lineas.append("-" * 60)

    if reporte["ventas"]:
        lineas.append(f"  {'#':<6} {'Hora':<18} {'Cliente':<18} {'Total':>10}")
        lineas.append("-" * 60)
        for v in reporte["ventas"]:
            cliente = v["cliente"] if v["cliente"] else "Sin registro"
            hora = v["fecha"][11:16] if len(v["fecha"]) > 10 else v["fecha"]
            lineas.append(f"  {v['id']:<6} {hora:<18} {cliente:<18} ${v['total']:>9.2f}")
    else:
        lineas.append("  No se encontraron ventas para esta fecha.")

    lineas.append("=" * 60)
    lineas.append("")
    return "\n".join(lineas)


def mostrar_resumen(resumen):
    """Presento el resumen general del negocio en formato legible."""
    lineas = []
    lineas.append("")
    lineas.append("=" * 50)
    lineas.append("         RESUMEN GENERAL DEL NEGOCIO")
    lineas.append("=" * 50)
    lineas.append(f"  Ventas hoy:        {resumen['hoy']['ventas']} (${resumen['hoy']['ingresos']:,.2f})")
    lineas.append(f"  Ventas del mes:    {resumen['mes']['ventas']} (${resumen['mes']['ingresos']:,.2f})")
    lineas.append(f"  Clientes activos:  {resumen['total_clientes']}")
    lineas.append(f"  Productos activos: {resumen['total_productos']}")

    if resumen["stock_bajo"]:
        lineas.append("-" * 50)
        lineas.append("  ⚠ Productos con stock bajo:")
        for p in resumen["stock_bajo"]:
            lineas.append(f"    - {p['nombre']}: {p['stock']} unidades")

    lineas.append("=" * 50)
    lineas.append("")
    return "\n".join(lineas)
