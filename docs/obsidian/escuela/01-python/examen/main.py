import sys
from datetime import datetime

# ─── MÓDULOS DEL SISTEMA ───────────────────────────────────────
from database import inicializar_bd
from auth import iniciar_sesion, registrar_usuario, listar_usuarios, desactivar_usuario
from productos import (
    agregar_producto, editar_producto, listar_productos,
    buscar_producto, listar_categorias, productos_por_categoria, desactivar_producto
)
from clientes import (
    registrar_cliente, editar_cliente, buscar_cliente, obtener_cliente,
    listar_clientes, historial_compras, clientes_cumpleanos_mes, movimientos_puntos_cliente
)
from lealtad import (
    consultar_puntos, listar_promociones, canjear_puntos,
    otorgar_puntos_cumpleanos, crear_promocion
)
from pos import crear_venta
from reportes import (
    reporte_ventas_dia, reporte_ventas_periodo, productos_mas_vendidos,
    ranking_clientes, resumen_general, reporte_categorias
)

# ─── RICH UI ───────────────────────────────────────────────────
from ui import (
    console, header, footer, line, success, error, warning, info,
    ask, ask_int, confirm, pause,
    tabla_productos, tabla_clientes, tabla_ventas, tabla_promociones,
    tabla_ranking, panel_resumen, imprimir_ticket_rich,
)

# ─── SUPER-AGENTE ──────────────────────────────────────────────
from orquestador import Orquestador, INTENCIONES


# ═══════════════════════════════════════════════════════════════════
# LOGIN
# ═══════════════════════════════════════════════════════════════════

def pantalla_login():
    """Pantalla de inicio de sesión con Rich."""
    while True:
        console.clear()
        header("☕ CAFETERÍA POS", "Hackathon Edition — Inicio de Sesión")
        info("admin / admin123   |   maria / cajero123")

        usuario = ask("Usuario")
        contrasena = ask("Contraseña", password=True)

        if not usuario or not contrasena:
            warning("Usuario y contraseña requeridos.")
            pause()
            continue

        empleado = iniciar_sesion(usuario, contrasena)
        if empleado:
            console.clear()
            header(f"¡Bienvenido(a), {empleado['nombre']}!",
                   f"Sesión iniciada como {empleado['rol'].capitalize()}")
            pause()
            return empleado
        else:
            error("Credenciales incorrectas.")
            pause()


# ═══════════════════════════════════════════════════════════════════
# MENÚ PRINCIPAL
# ═══════════════════════════════════════════════════════════════════

def menu_principal(empleado, orquestador):
    """Menú principal con Rich + agente inteligente."""
    while True:
        console.clear()
        header("☕ CAFETERÍA POS", f"{empleado['nombre']}  •  {empleado['rol'].capitalize()}")

        opciones = [
            ("1", "Punto de Venta", "Registrar nueva venta"),
            ("2", "Clientes", "Gestionar clientes frecuentes"),
            ("3", "Lealtad", "Programa de puntos y promociones"),
            ("4", "Productos", "Catálogo de productos"),
            ("5", "Reportes", "Ventas, rankings, resumen"),
        ]
        if empleado["rol"] == "admin":
            opciones.append(("6", "Usuarios", "Administrar empleados"))
        opciones.append(("7", "🤖 Asistente", "Comandos en lenguaje natural"))
        opciones.append(("0", "Salir", "Cerrar sesión"))

        for num, titulo, desc in opciones:
            color = "bright_yellow" if num == "7" else ""
            prefix = f"[{color}]{num}.[/]" if color else f"[bright_yellow]{num}.[/]"
            console.print(f"  {prefix} [bold]{titulo}[/] — [dim]{desc}[/]")

        line()
        opcion = ask("Opción")

        if opcion == "1":
            menu_pos(empleado)
        elif opcion == "2":
            menu_clientes()
        elif opcion == "3":
            menu_lealtad()
        elif opcion == "4":
            menu_productos(empleado)
        elif opcion == "5":
            menu_reportes()
        elif opcion == "6" and empleado["rol"] == "admin":
            menu_usuarios()
        elif opcion == "7":
            menu_asistente(orquestador, empleado)
        elif opcion == "0":
            info("Sesión cerrada.")
            break
        else:
            warning("Opción no válida.")
            pause()


# ═══════════════════════════════════════════════════════════════════
# MENÚ ASISTENTE INTELIGENTE (Super-agente)
# ═══════════════════════════════════════════════════════════════════

def menu_asistente(orquestador, empleado):
    """Chat con el super-agente: comandos en lenguaje natural."""
    console.clear()
    header("🤖 ASISTENTE INTELIGENTE", "Escribe lo que quieras hacer — yo lo resuelvo")

    info("Ejemplos: 'vender 2 capuchinos', 'reporte de hoy', 'buscar cliente carlos'")
    info("Comandos rápidos: /venta, /reporte, /puntos, /productos, /clientes, /help")
    info("Escribe 'salir' o presiona Enter vacío para volver al menú.")
    line()

    while True:
        texto = ask("Tú").strip()

        if not texto or texto.lower() in ("salir", "exit", "volver", "atrás", "regresar"):
            break

        if texto.lower() == "demo":
            _ejecutar_demo(orquestador, empleado)
            continue

        if texto.lower() in ("ayuda", "help", "comandos", "?", "/help", "/ayuda"):
            _mostrar_ayuda()
            continue

        # Interpretar con el orquestador
        cmd = orquestador.interpretar(texto)

        # Mostrar diagnóstico
        console.print(f"  [dim]{orquestador.resumen_comando(cmd)}[/]")

        if cmd.intencion == "desconocido":
            warning(f"No entendí '{texto}'. Escribe 'ayuda' para ver comandos.")
            continue

        # Despachar
        _despachar_comando(cmd, empleado)


def _despachar_comando(cmd, empleado):
    """Ejecuta la acción correspondiente al comando interpretado."""
    intencion = cmd.intencion

    if intencion == "vender":
        _asistente_vender(empleado, cmd.entidades)
    elif intencion == "clientes":
        _asistente_clientes(cmd)
    elif intencion == "lealtad":
        _asistente_lealtad(cmd)
    elif intencion == "productos":
        _asistente_productos(cmd, empleado)
    elif intencion == "reportes":
        _asistente_reportes(cmd)
    elif intencion == "sistema":
        _asistente_sistema(cmd, empleado)


def _mostrar_ayuda():
    """Muestra todos los comandos disponibles."""
    console.clear()
    header("📋 COMANDOS DISPONIBLES")
    for intencion, meta in INTENCIONES.items():
        console.print(f"\n  [bold]{meta['agente']}[/] — {meta['desc']}")
        for ej in meta["ejemplos"]:
            console.print(f"    [dim]• {ej}[/]")
    line()
    pause()


# ─── ASISTENTE: VENTAS ─────────────────────────────────

def _asistente_vender(empleado, entidades):
    """Registra una venta guiada por el asistente."""
    console.clear()
    header("🛒 VENTA ASISTIDA")

    # Buscar cliente
    id_cliente = entidades.get("id_cliente")
    nombre_cliente = entidades.get("nombre_cliente")

    if not id_cliente and nombre_cliente:
        resultados = buscar_cliente(nombre_cliente)
        if resultados:
            tabla_clientes(resultados)
            id_cliente = ask_int("ID del cliente (0 para omitir)")
            if id_cliente == 0:
                id_cliente = None
        else:
            info(f"No encontré '{nombre_cliente}'. Continuo sin cliente.")

    # Seleccionar productos
    productos_disponibles = listar_productos()
    items = []

    if "productos" in entidades and entidades["productos"]:
        # Productos detectados por NLU
        for pdet in entidades["productos"]:
            for prod in productos_disponibles:
                if pdet["nombre"].lower() in prod["nombre"].lower():
                    items.append({"id_producto": prod["id"], "cantidad": pdet["cantidad"]})
                    success(f"Agregado: {pdet['cantidad']}x {prod['nombre']}")
                    break
            else:
                warning(f"No encontré '{pdet['nombre']}' en el catálogo.")

    # Agregar más productos manualmente
    while True:
        if not confirm("¿Agregar más productos?"):
            break

        console.clear()
        tabla_productos(productos_disponibles)
        id_prod = ask_int("ID del producto")
        if id_prod == 0:
            break
        cant = ask_int("Cantidad", default=1)
        items.append({"id_producto": id_prod, "cantidad": cant})

    if not items:
        warning("No hay productos en la orden.")
        pause()
        return

    # Canjear puntos
    descuento = 0
    puntos_canjeados = 0
    if id_cliente:
        saldo = consultar_puntos(id_cliente)
        if saldo and saldo["puntos_disponibles"] > 0:
            info(f"El cliente tiene {saldo['puntos_disponibles']} puntos.")
            if confirm("¿Canjear puntos?"):
                promos = listar_promociones()
                if promos:
                    tabla_promociones(promos)
                    id_promo = ask_int("ID de la promoción")
                    if id_promo > 0:
                        ex, msg, res = canjear_puntos(id_cliente, id_promo)
                        info(msg)
                        if ex and res["promocion"]["tipo_recompensa"] == "descuento":
                            descuento = res["promocion"]["valor_recompensa"]
                            puntos_canjeados = res["puntos_usados"]

    # Procesar venta
    exito, mensaje, ticket = crear_venta(
        empleado["id"], items, id_cliente, puntos_canjeados, descuento
    )

    if exito:
        imprimir_ticket_rich(ticket)
    else:
        error(f"No se pudo procesar: {mensaje}")

    pause()


# ─── ASISTENTE: CLIENTES ───────────────────────────────

def _asistente_clientes(cmd):
    """Gestión de clientes desde el asistente."""
    accion = cmd.accion
    ent = cmd.entidades

    if accion in ("listar",):
        console.clear()
        header("👥 CLIENTES")
        clientes = listar_clientes()
        if clientes:
            tabla_clientes(clientes)
        else:
            info("No hay clientes registrados.")
        pause()

    elif accion == "buscar":
        nombre = ent.get("nombre_cliente") or ask("Buscar cliente")
        resultados = buscar_cliente(nombre)
        if resultados:
            tabla_clientes(resultados)
        else:
            info(f"No encontré clientes que coincidan con '{nombre}'.")
        pause()

    elif accion == "registrar":
        console.clear()
        header("REGISTRAR CLIENTE")
        nombre = ask("Nombre")
        tel = ask("Teléfono") or None
        email = ask("Email") or None
        fnac = ask("Fecha nacimiento (AAAA-MM-DD)") or None
        ex, msg = registrar_cliente(nombre, tel, email, fnac)
        (success if ex else error)(msg)
        pause()

    elif accion == "cumpleaños":
        console.clear()
        header("🎂 CUMPLEAÑOS DEL MES")
        cumple = clientes_cumpleanos_mes()
        if cumple:
            tabla_clientes(cumple)
        else:
            info("No hay cumpleañeros este mes.")
        pause()

    elif accion == "historial":
        id_cliente = ent.get("id_cliente") or ask_int("ID del cliente")
        cliente = obtener_cliente(id_cliente)
        if not cliente:
            error("Cliente no encontrado.")
            pause()
            return
        console.clear()
        header(f"📜 HISTORIAL — {cliente['nombre']}")
        compras = historial_compras(id_cliente)
        if compras:
            for c in compras:
                fecha = c["fecha"][:16] if c["fecha"] else "?"
                console.print(f"  [{fecha}] Venta #{c['id']} — ${c['total']:.2f} "
                              f"[green]+{c['puntos_otorgados']}pts[/]")
                for d in c.get("detalle", []):
                    console.print(f"    [dim]{d['cantidad']}x {d['nombre']}[/]")
        else:
            info("Sin historial de compras.")
        pause()


# ─── ASISTENTE: LEALTAD ────────────────────────────────

def _asistente_lealtad(cmd):
    """Programa de lealtad desde el asistente."""
    accion = cmd.accion
    ent = cmd.entidades

    if accion in ("listar", "consultar"):
        id_cliente = ent.get("id_cliente") or ask_int("ID del cliente")
        saldo = consultar_puntos(id_cliente)
        if saldo:
            console.print(f"\n  [green]Puntos disponibles: {saldo['puntos_disponibles']}[/]")
            console.print(f"  [dim]Acumulados: {saldo['puntos_acumulados']} | Canjeados: {saldo['puntos_canjeados']}[/]")
        else:
            error("Cliente no encontrado.")
        promos = listar_promociones()
        if promos:
            console.print()
            tabla_promociones(promos)
        pause()

    elif accion == "canjear":
        id_cliente = ent.get("id_cliente") or ask_int("ID del cliente")
        promos = listar_promociones()
        tabla_promociones(promos)
        id_promo = ask_int("ID de la promoción")
        ex, msg, res = canjear_puntos(id_cliente, id_promo)
        (success if ex else error)(msg)
        if ex:
            info(f"Puntos restantes: {res['puntos_restantes']}")
        pause()

    elif accion == "crear":
        console.clear()
        header("CREAR PROMOCIÓN")
        nombre = ask("Nombre")
        desc = ask("Descripción")
        pts = ask_int("Puntos requeridos")
        tipo = ask("Tipo (descuento/producto)")
        valor = float(ask("Valor"))
        ex, msg = crear_promocion(nombre, desc, pts, tipo, valor)
        (success if ex else error)(msg)
        pause()


# ─── ASISTENTE: PRODUCTOS ──────────────────────────────

def _asistente_productos(cmd, empleado):
    """Catálogo desde el asistente."""
    accion = cmd.accion
    ent = cmd.entidades

    if accion in ("listar",):
        productos = listar_productos()
        tabla_productos(productos)
        pause()

    elif accion == "buscar":
        termino = ent.get("nombre_cliente") or ask("Buscar producto")
        resultados = buscar_producto(termino)
        if resultados:
            tabla_productos(resultados, f"Búsqueda: {termino}")
        else:
            info(f"No encontré productos con '{termino}'.")
        pause()

    elif accion == "por_categoria":
        cat = ent.get("categoria") or ask("Categoría")
        prods = productos_por_categoria(cat)
        if prods:
            tabla_productos(prods, f"Categoría: {cat}")
        else:
            info(f"No hay productos en '{cat}'.")
        pause()

    elif accion == "agregar":
        console.clear()
        header("AGREGAR PRODUCTO")
        nombre = ask("Nombre")
        cat = ask("Categoría")
        precio = float(ask("Precio"))
        stock = ask_int("Stock inicial")
        ex, msg = agregar_producto(nombre, cat, precio, stock)
        (success if ex else error)(msg)
        pause()

    elif accion == "editar":
        id_prod = ent.get("id_cliente") or ask_int("ID del producto")
        prod = productos_por_categoria("")  # hack: busca por ID
        prods = listar_productos()
        actual = next((p for p in prods if p["id"] == id_prod), None)
        if not actual:
            error("Producto no encontrado.")
            pause()
            return
        console.clear()
        header(f"EDITAR: {actual['nombre']}")
        nombre = ask(f"Nombre [{actual['nombre']}]")
        cat = ask(f"Categoría [{actual['categoria']}]")
        precio_str = ask(f"Precio [{actual['precio']}]")
        stock_str = ask(f"Stock [{actual['stock']}]")
        ex, msg = editar_producto(
            id_prod,
            nombre=nombre or None,
            categoria=cat or None,
            precio=float(precio_str) if precio_str else None,
            stock=int(stock_str) if stock_str else None,
        )
        (success if ex else error)(msg)
        pause()


# ─── ASISTENTE: REPORTES ───────────────────────────────

def _asistente_reportes(cmd):
    """Reportes desde el asistente."""
    accion = cmd.accion
    ent = cmd.entidades

    if accion in ("ventas_dia", "ventas_periodo"):
        console.clear()
        if ent.get("fecha"):
            rep = reporte_ventas_dia(ent["fecha"])
        else:
            rep = reporte_ventas_dia()
        header(f"📊 VENTAS — {rep['fecha']}")

        contenido = (
            f"[green]${rep['total_dia']:,.2f}[/] en {rep['num_ventas']} ventas\n"
            f"Promedio: [cyan]${rep['promedio']:,.2f}[/] por venta"
        )
        console.print(f"\n  {contenido}")
        line()
        if rep["ventas"]:
            tabla_ventas(rep["ventas"], f"Ventas — {rep['fecha']}")
        else:
            info("No hay ventas registradas hoy.")
        pause()

    elif accion == "ranking":
        console.clear()
        header("🏆 RANKING DE CLIENTES")
        ranking = ranking_clientes()
        if ranking:
            tabla_ranking(ranking)
        else:
            info("No hay datos suficientes.")
        pause()

    elif accion == "resumen":
        console.clear()
        console.clear()
        resumen = resumen_general()
        panel_resumen(resumen)
        pause()

    elif accion == "mas_vendidos":
        console.clear()
        header("🔥 PRODUCTOS MÁS VENDIDOS")
        top = productos_mas_vendidos()
        if top:
            from rich.table import Table
            from rich import box
            t = Table(title="Top Productos", box=box.ROUNDED, border_style="bright_yellow")
            t.add_column("#")
            t.add_column("Producto")
            t.add_column("Cat.")
            t.add_column("Vendidos", justify="right")
            t.add_column("Ingresos", justify="right", style="green")
            for i, p in enumerate(top, 1):
                t.add_row(str(i), p["nombre"], p["categoria"],
                          str(p["total_vendido"]), f"${p['total_ingresos']:,.2f}")
            console.print(t)
        else:
            info("No hay datos de ventas.")
        pause()


# ─── ASISTENTE: SISTEMA ────────────────────────────────

def _asistente_sistema(cmd, empleado):
    """Backup y usuarios desde el asistente."""
    accion = cmd.accion

    if accion == "backup" or "backup" in cmd.raw.lower():
        console.clear()
        header("💾 BACKUP")
        from scripts.backup import realizar_respaldo
        exito = realizar_respaldo()
        if exito:
            success("Backup completado.")
        else:
            error("El backup falló.")
        pause()

    else:
        info("Comandos de sistema: backup, usuarios.")
        pause()


# ─── ASISTENTE: DEMO AUTOMÁTICA ────────────────────────

def _ejecutar_demo(orquestador, empleado):
    """Ejecuta una demo automática de ventas para poblar reportes."""
    console.clear()
    header("🎬 DEMO AUTOMÁTICA", "Generando datos de demostración...")

    import random

    productos = listar_productos()
    clientes = listar_clientes()
    if not clientes:
        registrar_cliente("Demo Cliente", "5550000000")
        clientes = listar_clientes()

    cliente_demo = clientes[0]["id"] if clientes else None
    ventas_ok = 0

    for _ in range(15):
        prod = random.choice(productos)
        cant = random.randint(1, 3)
        items = [{"id_producto": prod["id"], "cantidad": cant}]
        ex, msg, ticket = crear_venta(empleado["id"], items, cliente_demo)
        if ex:
            ventas_ok += 1

    success(f"Demo completada: {ventas_ok} ventas generadas.")
    info("Revisa 'Reportes' para ver los resultados.")
    pause()


# ═══════════════════════════════════════════════════════════════════
# MENÚS DE NEGOCIO — Versión Rich
# ═══════════════════════════════════════════════════════════════════

def menu_pos(empleado):
    """Punto de venta con Rich UI."""
    console.clear()
    header("🛒 PUNTO DE VENTA")

    # Cliente
    id_cliente = None
    if confirm("¿El cliente está registrado?"):
        termino = ask("Buscar cliente (nombre o teléfono)")
        resultados = buscar_cliente(termino)
        if resultados:
            tabla_clientes(resultados)
            id_cliente = ask_int("ID del cliente (0 para omitir)")
            if id_cliente == 0:
                id_cliente = None
        else:
            info("No encontré clientes con ese dato.")
            if confirm("¿Registrar nuevo cliente?"):
                nombre = ask("Nombre")
                tel = ask("Teléfono") or None
                email = ask("Email") or None
                fnac = ask("Fecha nacimiento (AAAA-MM-DD)") or None
                exito, msg = registrar_cliente(nombre, tel, email, fnac)
                if exito:
                    from database import conectar
                    conn = conectar()
                    id_cliente = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
                    success(f"Cliente registrado con ID {id_cliente}")
                else:
                    error(msg)

    # Productos
    productos = listar_productos()
    items = []

    while True:
        console.clear()
        header("AGREGAR PRODUCTOS")

        if items:
            subtotal = 0
            for item in items:
                prod = next(p for p in productos if p["id"] == item["id_producto"])
                sub = prod["precio"] * item["cantidad"]
                subtotal += sub
                console.print(f"  • {prod['nombre']} x{item['cantidad']} = [green]${sub:.2f}[/]")
            console.print(f"\n  Subtotal: [bold green]${subtotal:.2f}[/]")
            line()

        categorias = listar_categorias()
        console.print(f"\n  [bold]Categorías:[/]")
        for i, cat in enumerate(categorias, 1):
            console.print(f"    {i}. {cat}")

        opcion = ask("\n  [número] Categoría | [b] Buscar | [f] Finalizar | [c] Cancelar").lower()

        if opcion == "f":
            break
        elif opcion == "c":
            warning("Venta cancelada.")
            pause()
            return
        elif opcion == "b":
            termino = ask("Buscar producto")
            resultados = buscar_producto(termino)
            if resultados:
                item = _seleccionar_producto(resultados)
                if item:
                    items.append(item)
            else:
                info("Producto no encontrado.")
                pause()
        else:
            try:
                idx = int(opcion) - 1
                if 0 <= idx < len(categorias):
                    prods_cat = productos_por_categoria(categorias[idx])
                    item = _seleccionar_producto(prods_cat)
                    if item:
                        items.append(item)
            except ValueError:
                warning("Opción no válida.")
                pause()

    if not items:
        warning("No hay productos en la orden.")
        pause()
        return

    # Canjear puntos
    descuento = 0
    puntos_canjeados = 0
    if id_cliente:
        saldo = consultar_puntos(id_cliente)
        if saldo and saldo["puntos_disponibles"] > 0:
            info(f"Cliente tiene {saldo['puntos_disponibles']} puntos.")
            if confirm("¿Canjear puntos por promoción?"):
                promos = listar_promociones()
                if promos:
                    tabla_promociones(promos)
                    id_promo = ask_int("ID de la promoción (0 para cancelar)")
                    if id_promo > 0:
                        ex, msg, res = canjear_puntos(id_cliente, id_promo)
                        info(msg)
                        if ex and res["promocion"]["tipo_recompensa"] == "descuento":
                            descuento = res["promocion"]["valor_recompensa"]
                            puntos_canjeados = res["puntos_usados"]

    # Procesar
    exito, mensaje, ticket = crear_venta(empleado["id"], items, id_cliente, puntos_canjeados, descuento)
    if exito:
        imprimir_ticket_rich(ticket)
    else:
        error(mensaje)
    pause()


def _seleccionar_producto(productos_lista):
    """Selector de producto con tabla Rich."""
    tabla_productos(productos_lista)
    id_prod = ask_int("ID del producto (0 cancelar)")
    if id_prod == 0:
        return None
    cantidad = ask_int("Cantidad")
    if cantidad <= 0:
        return None
    return {"id_producto": id_prod, "cantidad": cantidad}


# ─── MENÚ CLIENTES ────────────────────────────────────────

def menu_clientes():
    """Gestión de clientes con Rich."""
    while True:
        console.clear()
        header("👥 CLIENTES")
        console.print("  1. Listar clientes")
        console.print("  2. Buscar cliente")
        console.print("  3. Registrar cliente")
        console.print("  4. Editar cliente")
        console.print("  5. Historial de compras")
        console.print("  6. Cumpleaños del mes")
        console.print("  0. Regresar")
        line()

        opcion = ask("Opción")

        if opcion == "1":
            console.clear()
            header("TODOS LOS CLIENTES")
            clientes = listar_clientes()
            if clientes:
                tabla_clientes(clientes)
            else:
                info("No hay clientes registrados.")
            pause()

        elif opcion == "2":
            termino = ask("Buscar cliente")
            resultados = buscar_cliente(termino)
            if resultados:
                tabla_clientes(resultados)
            else:
                info(f"No encontré clientes con '{termino}'.")
            pause()

        elif opcion == "3":
            console.clear()
            header("REGISTRAR CLIENTE")
            nombre = ask("Nombre completo")
            tel = ask("Teléfono") or None
            email = ask("Email") or None
            fnac = ask("Fecha nacimiento (AAAA-MM-DD)") or None
            ex, msg = registrar_cliente(nombre, tel, email, fnac)
            (success if ex else error)(msg)
            pause()

        elif opcion == "4":
            id_cliente = ask_int("ID del cliente")
            cliente = obtener_cliente(id_cliente)
            if not cliente:
                error("No encontré ese cliente.")
                pause()
                continue
            console.clear()
            header(f"EDITAR: {cliente['nombre']}")
            nombre = ask(f"Nombre [{cliente['nombre']}]")
            tel = ask(f"Teléfono [{cliente['telefono'] or ''}]")
            email = ask(f"Email [{cliente['email'] or ''}]")
            fnac = ask(f"Fecha nacimiento [{cliente.get('fecha_nacimiento','')}]")
            ex, msg = editar_cliente(
                id_cliente,
                nombre=nombre or None,
                telefono=tel or None,
                email=email or None,
                fecha_nacimiento=fnac or None,
            )
            (success if ex else error)(msg)
            pause()

        elif opcion == "5":
            id_cliente = ask_int("ID del cliente")
            cliente = obtener_cliente(id_cliente)
            if not cliente:
                error("Cliente no encontrado.")
                pause()
                continue
            console.clear()
            header(f"HISTORIAL — {cliente['nombre']}")
            compras = historial_compras(id_cliente)
            if compras:
                for c in compras:
                    fecha = c["fecha"][:16] if c["fecha"] else "?"
                    console.print(f"\n  [{fecha}] Venta #{c['id']} — [green]${c['total']:.2f}[/]")
                    for d in c.get("detalle", []):
                        console.print(f"    [dim]• {d['cantidad']}x {d['nombre']} @ ${d['precio_unitario']:.2f}[/]")
            else:
                info("Sin compras.")
            pause()

        elif opcion == "6":
            console.clear()
            header("🎂 CUMPLEAÑOS DEL MES")
            cumple = clientes_cumpleanos_mes()
            if cumple:
                tabla_clientes(cumple)
            else:
                info("No hay cumpleañeros este mes.")
            pause()

        elif opcion == "0":
            break


# ─── MENÚ LEALTAD ─────────────────────────────────────────

def menu_lealtad():
    """Programa de lealtad con Rich."""
    while True:
        console.clear()
        header("⭐ PROGRAMA DE LEALTAD")
        console.print("  1. Consultar puntos")
        console.print("  2. Movimientos de puntos")
        console.print("  3. Canjear puntos")
        console.print("  4. Ver promociones")
        console.print("  5. Crear promoción")
        console.print("  0. Regresar")
        line()

        opcion = ask("Opción")

        if opcion == "1":
            console.clear()
            header("CONSULTAR PUNTOS")
            id_c = ask_int("ID del cliente")
            cliente = obtener_cliente(id_c)
            if cliente:
                console.print(f"\n  Cliente: [bold]{cliente['nombre']}[/]")
                console.print(f"  Puntos acumulados: {cliente['puntos_acumulados']}")
                console.print(f"  Puntos canjeados:  {cliente['puntos_canjeados']}")
                console.print(f"  Puntos disponibles: [green]{cliente['puntos_disponibles']}[/]")
            else:
                error("Cliente no encontrado.")
            pause()

        elif opcion == "2":
            id_c = ask_int("ID del cliente")
            movs = movimientos_puntos_cliente(id_c)
            if movs:
                for m in movs:
                    signo = "+" if m["tipo"] == "acumulacion" else "-"
                    color = "green" if signo == "+" else "yellow"
                    console.print(f"  [{m['fecha'][:19]}] [{color}]{signo}{m['puntos']}[/] — {m['descripcion']}")
            else:
                info("Sin movimientos.")
            pause()

        elif opcion == "3":
            console.clear()
            header("CANJEAR PUNTOS")
            id_c = ask_int("ID del cliente")
            saldo = consultar_puntos(id_c)
            if saldo:
                info(f"Puntos disponibles: {saldo['puntos_disponibles']}")
                promos = listar_promociones()
                if promos:
                    tabla_promociones(promos)
                    id_promo = ask_int("ID de la promoción")
                    ex, msg, res = canjear_puntos(id_c, id_promo)
                    (success if ex else error)(msg)
                else:
                    info("No hay promociones.")
            else:
                error("Cliente no encontrado.")
            pause()

        elif opcion == "4":
            console.clear()
            header("PROMOCIONES")
            promos = listar_promociones()
            if promos:
                tabla_promociones(promos)
            else:
                info("No hay promociones activas.")
            pause()

        elif opcion == "5":
            console.clear()
            header("CREAR PROMOCIÓN")
            nombre = ask("Nombre")
            desc = ask("Descripción")
            pts = ask_int("Puntos requeridos")
            tipo = ask("Tipo (descuento/producto)")
            valor = float(ask("Valor"))
            ex, msg = crear_promocion(nombre, desc, pts, tipo, valor)
            (success if ex else error)(msg)
            pause()

        elif opcion == "0":
            break


# ─── MENÚ PRODUCTOS ───────────────────────────────────────

def menu_productos(empleado):
    """Catálogo con Rich."""
    while True:
        console.clear()
        header("📦 PRODUCTOS")
        console.print("  1. Listar productos")
        console.print("  2. Buscar producto")
        console.print("  3. Agregar producto")
        console.print("  4. Editar producto")
        console.print("  5. Ver por categoría")
        if empleado["rol"] == "admin":
            console.print("  6. Desactivar producto")
        console.print("  0. Regresar")
        line()

        opcion = ask("Opción")

        if opcion == "1":
            productos = listar_productos()
            tabla_productos(productos)
            pause()

        elif opcion == "2":
            termino = ask("Buscar")
            resultados = buscar_producto(termino)
            if resultados:
                tabla_productos(resultados, f"Búsqueda: {termino}")
            else:
                info(f"No encontré '{termino}'.")
            pause()

        elif opcion == "3":
            console.clear()
            header("AGREGAR PRODUCTO")
            nombre = ask("Nombre")
            cat = ask("Categoría")
            precio = float(ask("Precio"))
            stock = ask_int("Stock")
            ex, msg = agregar_producto(nombre, cat, precio, stock)
            (success if ex else error)(msg)
            pause()

        elif opcion == "4":
            id_prod = ask_int("ID del producto")
            prods = listar_productos()
            actual = next((p for p in prods if p["id"] == id_prod), None)
            if not actual:
                error("No encontrado.")
                pause()
                continue
            console.clear()
            header(f"EDITAR: {actual['nombre']}")
            nombre = ask(f"Nombre [{actual['nombre']}]")
            cat = ask(f"Categoría [{actual['categoria']}]")
            precio_str = ask(f"Precio [{actual['precio']}]")
            stock_str = ask(f"Stock [{actual['stock']}]")
            ex, msg = editar_producto(
                id_prod,
                nombre=nombre or None,
                categoria=cat or None,
                precio=float(precio_str) if precio_str else None,
                stock=int(stock_str) if stock_str else None,
            )
            (success if ex else error)(msg)
            pause()

        elif opcion == "5":
            cats = listar_categorias()
            for i, c in enumerate(cats, 1):
                console.print(f"  {i}. {c}")
            try:
                idx = ask_int("Categoría número") - 1
                if 0 <= idx < len(cats):
                    prods = productos_por_categoria(cats[idx])
                    tabla_productos(prods, f"Categoría: {cats[idx]}")
            except (ValueError, IndexError):
                warning("Selección no válida.")
            pause()

        elif opcion == "6" and empleado["rol"] == "admin":
            id_prod = ask_int("ID del producto a desactivar")
            if confirm("¿Confirmar desactivación?"):
                desactivar_producto(id_prod)
                success("Producto desactivado.")
            pause()

        elif opcion == "0":
            break


# ─── MENÚ REPORTES ────────────────────────────────────────

def menu_reportes():
    """Reportes con Rich UI."""
    while True:
        console.clear()
        header("📊 REPORTES")
        console.print("  1. Ventas del día")
        console.print("  2. Ventas por período")
        console.print("  3. Productos más vendidos")
        console.print("  4. Ranking de clientes")
        console.print("  5. Resumen general")
        console.print("  0. Regresar")
        line()

        opcion = ask("Opción")

        if opcion == "1":
            rep = reporte_ventas_dia()
            console.clear()
            header(f"VENTAS — {rep['fecha']}")
            console.print(f"  [green]${rep['total_dia']:,.2f}[/] en {rep['num_ventas']} ventas")
            if rep["ventas"]:
                tabla_ventas(rep["ventas"], f"Ventas — {rep['fecha']}")
            else:
                info("No hay ventas.")
            pause()

        elif opcion == "2":
            inicio = ask("Fecha inicio (AAAA-MM-DD)")
            fin = ask("Fecha fin (AAAA-MM-DD)")
            rep = reporte_ventas_periodo(inicio, fin)
            console.clear()
            header(f"VENTAS: {inicio} → {fin}")
            console.print(f"  Total: [green]${rep['total_periodo']:,.2f}[/] en {rep['total_ventas']} ventas")
            for d in rep["dias"]:
                console.print(f"  {d['dia']}: {d['num_ventas']} ventas, ${d['total_dia']:,.2f}")
            pause()

        elif opcion == "3":
            console.clear()
            header("PRODUCTOS MÁS VENDIDOS")
            top = productos_mas_vendidos(15)
            if top:
                from rich.table import Table
                from rich import box
                t = Table(box=box.ROUNDED, border_style="bright_yellow")
                t.add_column("#")
                t.add_column("Producto")
                t.add_column("Vendidos", justify="right")
                t.add_column("Ingresos", justify="right", style="green")
                for i, p in enumerate(top, 1):
                    t.add_row(str(i), p["nombre"], str(p["total_vendido"]), f"${p['total_ingresos']:,.2f}")
                console.print(t)
            else:
                info("No hay datos.")
            pause()

        elif opcion == "4":
            console.clear()
            header("RANKING DE CLIENTES")
            ranking = ranking_clientes()
            if ranking:
                tabla_ranking(ranking)
            else:
                info("No hay datos suficientes.")
            pause()

        elif opcion == "5":
            console.clear()
            resumen = resumen_general()
            panel_resumen(resumen)
            pause()

        elif opcion == "0":
            break


# ─── MENÚ USUARIOS ────────────────────────────────────────

def menu_usuarios():
    """Admin de usuarios con Rich (solo admin)."""
    while True:
        console.clear()
        header("👤 ADMINISTRAR USUARIOS")
        console.print("  1. Listar usuarios")
        console.print("  2. Registrar usuario")
        console.print("  3. Desactivar usuario")
        console.print("  0. Regresar")
        line()

        opcion = ask("Opción")

        if opcion == "1":
            usuarios = listar_usuarios()
            from rich.table import Table
            from rich import box
            t = Table(box=box.ROUNDED, border_style="bright_yellow")
            t.add_column("ID")
            t.add_column("Nombre")
            t.add_column("Usuario")
            t.add_column("Rol")
            t.add_column("Estado")
            for u in usuarios:
                estado = "[green]Activo[/]" if u["activo"] else "[red]Inactivo[/]"
                t.add_row(str(u["id"]), u["nombre"], u["usuario"], u["rol"], estado)
            console.print(t)
            pause()

        elif opcion == "2":
            console.clear()
            header("REGISTRAR USUARIO")
            nombre = ask("Nombre completo")
            usuario = ask("Nombre de usuario")
            contrasena = ask("Contraseña", password=True)
            rol = ask("Rol (admin/cajero)")
            if rol not in ("admin", "cajero"):
                rol = "cajero"
            ex, msg = registrar_usuario(nombre, usuario, contrasena, rol)
            (success if ex else error)(msg)
            pause()

        elif opcion == "3":
            id_u = ask_int("ID del usuario a desactivar")
            if confirm("¿Confirmar desactivación?"):
                desactivar_usuario(id_u)
                success("Usuario desactivado.")
            pause()

        elif opcion == "0":
            break


# ═══════════════════════════════════════════════════════════════════
# PUNTO DE ENTRADA
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Inicializar BD
    inicializar_bd()

    # Inicializar super-agente
    orquestador = Orquestador()
    modo_asistente = "--asistente" in sys.argv

    console.clear()
    header("☕ CAFETERÍA POS v2.0", "Hackathon Edition • SQLite + Rich + IA")
    info("Iniciando sistema...")

    if modo_asistente:
        console.print("\n  [bold cyan]Modo Asistente Inteligente activado[/]")
        console.print("  [dim]Escribe tus comandos en lenguaje natural.[/]\n")

    while True:
        empleado = pantalla_login()

        if modo_asistente:
            console.clear()
            header(f"🤖 ASISTENTE — {empleado['nombre']}",
                   "Escribe 'menu' para ir al menú tradicional, 'salir' para cerrar sesión")
            while True:
                texto = ask("Tú")
                if texto.lower() in ("salir", "exit"):
                    break
                if texto.lower() == "menu":
                    menu_principal(empleado, orquestador)
                    break
                if texto.lower() in ("ayuda", "help", "?"):
                    _mostrar_ayuda()
                    continue
                if texto.lower() == "demo":
                    _ejecutar_demo(orquestador, empleado)
                    continue
                cmd = orquestador.interpretar(texto)
                console.print(f"  [dim]{orquestador.resumen_comando(cmd)}[/]")
                if cmd.intencion != "desconocido":
                    _despachar_comando(cmd, empleado)
                else:
                    warning(f"No entendí. Escribe 'ayuda' para ver comandos.")
        else:
            menu_principal(empleado, orquestador)

        if not confirm("¿Iniciar sesión con otra cuenta?"):
            break

    console.clear()
    header("☕ ¡Hasta luego!")
    info("Cafetería POS v2.0 — Hackathon Edition")
