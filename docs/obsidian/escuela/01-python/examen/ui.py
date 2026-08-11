"""
ui.py — Interfaz de terminal con Rich.
Transforma el POS en una experiencia visual de hackathon.
"""
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.align import Align
from rich.text import Text
from rich import box
from rich.columns import Columns
from rich.prompt import Prompt, Confirm, IntPrompt
from datetime import datetime

console = Console()

# ─── PALETA DE COLORES ───────────────────────────────────────────

CAFE = "bright_yellow"
CAFE_CLARO = "yellow"
TEXTO = "white"
TITULO_STYLE = "bold bright_yellow on #2d1f0e"
PANEL_STYLE = "bright_yellow"
EXITO = "green"
ERROR = "red"
ADVERTENCIA = "yellow"
INFO = "cyan"


# ═══════════════════════════════════════════════════════════════════
# ENCABEZADOS Y PIE
# ═══════════════════════════════════════════════════════════════════

def header(titulo: str, subtitulo: str = ""):
    """Panel de encabezado con estilo cafetería."""
    texto = f"[bold bright_yellow]{titulo}[/]"
    if subtitulo:
        texto += f"\n[dim]{subtitulo}[/]"
    console.print(Panel(texto, border_style=CAFE, box=box.HEAVY))


def footer(texto: str = "Cafetería POS v2.0 — Hackathon Edition"):
    """Pie de pantalla."""
    console.print(f"\n[dim]{texto}[/]")


def line():
    """Línea separadora."""
    console.print(f"[{CAFE}]─[/]" * 60)


def success(msg: str):
    console.print(f"[{EXITO}]✔ {msg}[/]")


def error(msg: str):
    console.print(f"[{ERROR}]✖ {msg}[/]")


def warning(msg: str):
    console.print(f"[{ADVERTENCIA}]⚠ {msg}[/]")


def info(msg: str):
    console.print(f"[{INFO}]ℹ {msg}[/]")


# ═══════════════════════════════════════════════════════════════════
# PROMPTS (reemplazan los input() nativos)
# ═══════════════════════════════════════════════════════════════════

def ask(texto: str, password: bool = False) -> str:
    """Prompt con estilo Rich."""
    return Prompt.ask(f"[{TEXTO}]{texto}[/]", password=password).strip()


def ask_int(texto: str, default: int = 0) -> int:
    """Prompt numérico."""
    return IntPrompt.ask(f"[{TEXTO}]{texto}[/]", default=default)


def confirm(texto: str) -> bool:
    """Confirmación sí/no."""
    return Confirm.ask(f"[{TEXTO}]{texto}[/]")


def pause():
    """Espera a que el usuario presione Enter."""
    console.input(f"\n  [{INFO}]Presiona Enter para continuar...[/]")


# ═══════════════════════════════════════════════════════════════════
# TABLAS
# ═══════════════════════════════════════════════════════════════════

def tabla_productos(productos: list, titulo: str = "Catálogo"):
    """Tabla Rich de productos."""
    t = Table(title=f"[bold]{titulo}[/]", box=box.ROUNDED, border_style=CAFE)
    t.add_column("ID", style="dim", width=5)
    t.add_column("Producto", style="white")
    t.add_column("Categoría", style="yellow")
    t.add_column("Precio", justify="right", style="green")
    t.add_column("Stock", justify="right", style="cyan")
    for p in productos:
        t.add_row(str(p["id"]), p["nombre"], p["categoria"],
                  f"${p['precio']:.2f}", str(p["stock"]))
    console.print(t)


def tabla_clientes(clientes: list):
    """Tabla Rich de clientes."""
    t = Table(title="[bold]Clientes[/]", box=box.ROUNDED, border_style=CAFE)
    t.add_column("ID", style="dim", width=4)
    t.add_column("Nombre", style="white")
    t.add_column("Teléfono", style="yellow")
    t.add_column("Puntos", justify="right", style="green")
    for c in clientes:
        pts = c.get("puntos_disponibles", 0) or 0
        t.add_row(str(c["id"]), c["nombre"], c.get("telefono", "-"), str(pts))
    console.print(t)


def tabla_ventas(ventas: list, titulo: str = "Ventas"):
    """Tabla Rich de ventas."""
    t = Table(title=f"[bold]{titulo}[/]", box=box.ROUNDED, border_style=CAFE)
    t.add_column("#", style="dim", width=5)
    t.add_column("Hora", style="cyan", width=10)
    t.add_column("Cliente", style="white")
    t.add_column("Total", justify="right", style="green")
    for v in ventas:
        hora = v["fecha"][11:16] if len(v.get("fecha", "")) > 10 else v.get("fecha", "")
        cliente = v.get("cliente") or "Sin registro"
        t.add_row(str(v.get("id", "")), hora, cliente, f"${v.get('total', 0):.2f}")
    console.print(t)


def tabla_promociones(promociones: list):
    """Tabla Rich de promociones."""
    t = Table(title="[bold]Promociones Disponibles[/]", box=box.ROUNDED, border_style=CAFE)
    t.add_column("ID", style="dim", width=4)
    t.add_column("Promoción", style="white")
    t.add_column("Puntos", justify="right", style="green")
    t.add_column("Tipo", style="yellow")
    for p in promociones:
        t.add_row(str(p["id"]), p["nombre"], str(p["puntos_requeridos"]), p["tipo_recompensa"])
    console.print(t)


def tabla_ranking(ranking: list):
    """Tabla Rich de ranking de clientes."""
    t = Table(title="[bold]Ranking de Clientes[/]", box=box.ROUNDED, border_style=CAFE)
    t.add_column("#", style="dim", width=4)
    t.add_column("Cliente", style="white")
    t.add_column("Compras", justify="right", style="cyan")
    t.add_column("Total", justify="right", style="green")
    t.add_column("Puntos", justify="right", style="yellow")
    for i, c in enumerate(ranking, 1):
        t.add_row(str(i), c["nombre"], str(c["total_compras"]),
                  f"${c['total_gastado']:,.2f}", str(c.get("puntos_disponibles", 0)))
    console.print(t)


# ═══════════════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════════════

def panel_resumen(resumen: dict):
    """Panel resumen general con métricas del negocio."""
    hoy = resumen["hoy"]
    mes = resumen["mes"]
    contenido = (
        f"[bold bright_yellow]📊 Resumen del Negocio[/]\n\n"
        f"[bold]Hoy:[/]      {hoy['ventas']} ventas  |  [green]${hoy['ingresos']:,.2f}[/]\n"
        f"[bold]Este mes:[/] {mes['ventas']} ventas  |  [green]${mes['ingresos']:,.2f}[/]\n"
        f"[bold]Clientes:[/] {resumen['total_clientes']} registrados\n"
        f"[bold]Productos:[/] {resumen['total_productos']} activos\n"
    )
    if resumen.get("stock_bajo"):
        contenido += f"\n[{ADVERTENCIA}]⚠ Stock bajo:[/]\n"
        for p in resumen["stock_bajo"]:
            contenido += f"  • {p['nombre']}: [red]{p['stock']} unidades[/]\n"
    console.print(Panel(contenido, border_style=CAFE, box=box.ROUNDED))


# ═══════════════════════════════════════════════════════════════════
# TICKET
# ═══════════════════════════════════════════════════════════════════

def imprimir_ticket_rich(ticket: dict):
    """Ticket de venta con estilo Rich."""
    lineas = []
    lineas.append(f"\n  {'═' * 52}")
    lineas.append(f"  [bold bright_yellow]☕ CAFETERÍA POS[/] — Ticket #{ticket['id_venta']}")
    lineas.append(f"  Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    lineas.append(f"  {'─' * 52}")

    for d in ticket["detalles"]:
        nombre = d["nombre"][:24]
        sub = d["subtotal"]
        lineas.append(
            f"  {nombre:<24} x{d['cantidad']:>3}  ${d['precio_unitario']:>7.2f}  ${sub:>7.2f}"
        )

    lineas.append(f"  {'─' * 52}")
    lineas.append(f"  Subtotal: {' ' * 31} ${ticket['subtotal']:>7.2f}")

    if ticket.get("descuento", 0) > 0:
        lineas.append(f"  [yellow]Descuento:[/] {' ' * 30} -${ticket['descuento']:>6.2f}")

    lineas.append(f"  [bold green]TOTAL:[/] {' ' * 35} [bold green]${ticket['total']:>7.2f}[/]")
    lineas.append(f"  {'─' * 52}")

    if ticket.get("id_cliente"):
        lineas.append(f"  [green]Puntos +{ticket['puntos_otorgados']}[/]")
        if ticket.get("puntos_canjeados", 0) > 0:
            lineas.append(f"  [yellow]Puntos -{ticket['puntos_canjeados']}[/]")

    lineas.append(f"  {'═' * 52}")
    lineas.append(f"  [italic]¡Gracias por tu preferencia![/]")

    console.print("\n".join(lineas))


# ═══════════════════════════════════════════════════════════════════
# MENÚ PRINCIPAL
# ═══════════════════════════════════════════════════════════════════

def menu_principal(empleado: dict) -> str:
    """Menú principal con Rich. Retorna la opción seleccionada."""
    console.clear()
    header("☕ CAFETERÍA POS", f"Bienvenido, {empleado['nombre']}  •  {empleado['rol'].capitalize()}")

    opciones = [
        ("1", "Punto de Venta", "Registrar nueva venta"),
        ("2", "Clientes", "Gestionar clientes frecuentes"),
        ("3", "Lealtad", "Programa de puntos y promociones"),
        ("4", "Productos", "Catálogo de productos"),
        ("5", "Reportes", "Ventas, ranking, resumen"),
    ]
    if empleado["rol"] == "admin":
        opciones.append(("6", "Usuarios", "Administrar empleados"))

    opciones.append(("0", "Salir", "Cerrar sesión"))

    for num, titulo, desc in opciones:
        console.print(f"  [{CAFE}]{num}.[/] [bold]{titulo}[/] — [dim]{desc}[/]")

    line()
    return ask("Opción")
