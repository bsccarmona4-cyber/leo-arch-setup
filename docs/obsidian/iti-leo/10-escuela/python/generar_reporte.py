"""
Script para generar el reporte .docx con formato institucional UPVT.
Ejecutar: python generar_reporte.py
"""

from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

OUTPUT = "Reporte_Ejercicios_POO.docx"

doc = Document()

# ── Márgenes ────────────────────────────────────────────────────────────────
for section in doc.sections:
    section.top_margin    = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin   = Cm(3)
    section.right_margin  = Cm(2)

# ── Helpers ──────────────────────────────────────────────────────────────────

def set_cell_bg(cell, hex_color: str):
    """Pone color de fondo a una celda."""
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement("w:shd")
    shd.set(qn("w:val"),   "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"),  hex_color)
    tcPr.append(shd)


def heading(text: str, level: int = 1, center: bool = False):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER if center else WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(13 if level == 1 else 11)
    run.font.color.rgb = RGBColor(0x1A, 0x35, 0x6E)   # azul institucional
    return p


def body(text: str, bold: bool = False, italic: bool = False):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    run = p.add_run(text)
    run.bold   = bold
    run.italic = italic
    run.font.size = Pt(11)
    return p


def code_block(text: str):
    """Párrafo con fuente monoespaciada para código."""
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = "Courier New"
    run.font.size = Pt(9)
    p.paragraph_format.left_indent  = Cm(1)
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after  = Pt(3)
    return p


def image_placeholder(label: str = "[ INSERTAR CAPTURA DE PANTALLA AQUÍ ]"):
    """Tabla de 1 celda que sirve como cuadro para la imagen."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(5.5)
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(label)
    run.font.color.rgb = RGBColor(0x99, 0x99, 0x99)
    run.font.size      = Pt(10)
    run.italic         = True
    # borde de la celda
    set_cell_bg(cell, "F2F2F2")
    # altura mínima
    tr  = tbl.rows[0]._tr
    trPr = tr.get_or_add_trPr()
    trH  = OxmlElement("w:trHeight")
    trH.set(qn("w:val"), "1800")   # ~3.2 cm
    trH.set(qn("w:hRule"), "atLeast")
    trPr.append(trH)
    doc.add_paragraph()            # espacio después
    return tbl


def divider():
    doc.add_paragraph()


# ═══════════════════════════════════════════════════════════════════════════════
#  PORTADA
# ═══════════════════════════════════════════════════════════════════════════════

# Encabezado institucional
portada_lines = [
    ("UNIVERSIDAD POLITÉCNICA DEL VALLE DE TOLUCA", True, 13),
    ("PROGRAMA EDUCATIVO:", True, 11),
    ("INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN", False, 11),
    ("E INNOVACIÓN DIGITAL CON TSU* EN DESARROLLO", False, 11),
    ("DE SOFTWARE MULTIPLATAFORMA.", False, 11),
    ("", False, 6),
    ("ASIGNATURA:", True, 11),
    ("PROGRAMACIÓN ORIENTADA A OBJETOS", False, 11),
    ("", False, 6),
    ("NOMBRE DE LA UNIDAD DE APRENDIZAJE:", True, 11),
    ("UNIDAD 3: GESTIÓN DE DATOS Y BUENAS PRÁCTICAS DE CODIFICACIÓN", False, 11),
    ("", False, 6),
    ("NOMBRE DE LA ACTIVIDAD:", True, 11),
    ("EJERCICIOS: HERRAMIENTAS DE DESARROLLO — ENTORNO, COMPILACIÓN,", False, 11),
    ("DEPURACIÓN Y CONTROL DE VERSIONES", False, 11),
    ("", False, 6),
    ("NOMBRE DE LA FACILITADORA:", True, 11),
]

for text, bold, size in portada_lines:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if text:
        run = p.add_run(text)
        run.bold = bold
        run.font.size = Pt(size)
    else:
        p.paragraph_format.space_after = Pt(size)

# Nombre del alumno
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("NOMBRE DEL ALUMNO:")
r.bold = True
r.font.size = Pt(11)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("LEONARDO ARTURO CARMONA VARGAS")
r.bold = False
r.font.size = Pt(11)

doc.add_page_break()


# ═══════════════════════════════════════════════════════════════════════════════
#  EJERCICIO 1 — EDITOR DE CÓDIGO
# ═══════════════════════════════════════════════════════════════════════════════

heading("EJERCICIO 1: CONFIGURACIÓN Y USO DEL EDITOR DE CÓDIGO")
divider()

# --- Clase Producto ---
heading("Clase base: Producto", level=2)
body(
    "Definí la clase Producto en el archivo ejercicio1/producto.py. "
    "La clase modela un producto de inventario con atributos privados declarados "
    "mediante doble guion bajo (__nombre, __precio, __stock, __id), lo que activa "
    "el mecanismo de name mangling de Python e impide el acceso directo desde fuera "
    "de la clase. El constructor (__init__) recibe tres parámetros: nombre, precio y "
    "stock, siendo este último opcional con valor por defecto de cero."
)
body(
    "Se implementaron getters y setters con validación que lanzan ValueError ante "
    "datos inválidos, métodos de negocio (vender, agregar_stock), métodos especiales "
    "(__str__, __repr__, __eq__) y un método de clase total_productos_creados() "
    "decorado con @classmethod que opera sobre el atributo compartido _contador_productos."
)
divider()
body("Captura — Código de la clase Producto en el IDE:", bold=True)
image_placeholder("[ CAPTURA: clase Producto abierta en VS Code / PyCharm ]")

# --- Errores de sintaxis ---
heading("Detección de errores de sintaxis", level=2)
body(
    "En el archivo ejercicio1/errores_sintaxis.py documenté seis errores de sintaxis "
    "comunes en Python. El editor los detecta y subraya con una línea de color antes "
    "de ejecutar el programa, gracias al análisis estático que realiza Pylance en "
    "segundo plano. Los errores cubiertos son:"
)
items = [
    "Paréntesis sin cerrar.",
    "Indentación incorrecta (IndentationError).",
    "Variable usada sin haber sido definida (NameError).",
    "Argumento de tipo incorrecto (TypeError).",
    "Dos puntos faltantes en definición de clase o función (SyntaxError).",
    "Variable referenciada antes de ser asignada dentro de una función.",
]
for item in items:
    p = doc.add_paragraph(style="List Bullet")
    p.add_run(item).font.size = Pt(11)

divider()
body("Captura — Error de sintaxis resaltado por el IDE:", bold=True)
image_placeholder("[ CAPTURA: error de sintaxis subrayado en el editor ]")

# --- Refactorización ---
heading("Refactorización por renombrado automático", level=2)
body(
    "En el archivo ejercicio1/refactorizacion.py utilicé la herramienta Rename Symbol "
    "del IDE (F2 en VS Code / Shift+F6 en PyCharm). Al renombrar un símbolo —clase, "
    "método o atributo— el editor actualiza automáticamente todas las referencias dentro "
    "del proyecto, eliminando el riesgo de inconsistencias al hacerlo de forma manual."
)
body(
    "Renombré la clase CarritoTemporal a CarritoDeCompras y el método agregar_item "
    "a agregar_producto, verificando que todas las instancias de uso en el archivo "
    "se actualizaron de forma simultánea."
)
divider()
body("Captura — Herramienta de renombrado activa en el IDE:", bold=True)
image_placeholder("[ CAPTURA: cuadro de diálogo Rename Symbol con el nuevo nombre ]")

doc.add_page_break()


# ═══════════════════════════════════════════════════════════════════════════════
#  EJERCICIO 2 — COMPILACIÓN Y EJECUCIÓN
# ═══════════════════════════════════════════════════════════════════════════════

heading("EJERCICIO 2: CONTROL DE COMPILACIÓN Y EJECUCIÓN")
divider()

heading("Programa principal: main.py", level=2)
body(
    "El programa principal se encuentra en main.py y se ejecuta desde la consola "
    "integrada del IDE con el siguiente comando:"
)
code_block("python main.py")
body(
    "La primera sección instancia tres objetos Producto y realiza operaciones: ventas, "
    "reposición de stock y modificación de atributos vía setters. La salida estándar "
    "confirma cada operación con mensajes descriptivos. La validación del setter "
    "set_precio() captura y muestra el ValueError cuando se intenta asignar un precio negativo."
)
divider()
body("Captura — Ejecución exitosa en la consola integrada:", bold=True)
image_placeholder("[ CAPTURA: consola del IDE mostrando la salida exitosa del programa ]")

# --- NullPointerException ---
heading("Equivalente al NullPointerException — AttributeError", level=2)
body(
    "Python no tiene el concepto de null como Java, pero el valor None produce el mismo "
    "efecto cuando se intenta invocar un método sobre él. El error resultante es un "
    "AttributeError. Reproduje dos casos:"
)

p = doc.add_paragraph(style="List Number")
p.add_run(
    "Variable declarada pero no instanciada: producto_nulo = None seguido de "
    "producto_nulo.get_nombre(). El intérprete lanza el AttributeError e imprime el "
    "stack trace completo indicando la línea exacta."
).font.size = Pt(11)

p = doc.add_paragraph(style="List Number")
p.add_run(
    "Función de búsqueda que retorna None: cuando el ID buscado no existe en la lista, "
    "la función retorna None y operar sobre ese resultado sin verificarlo produce el mismo error."
).font.size = Pt(11)

divider()
body("El stack trace producido por Python tiene la siguiente forma:", bold=False, italic=True)
code_block(
    "Traceback (most recent call last):\n"
    "  File \"main.py\", line 84, in demo_null_pointer\n"
    "    nombre = producto_nulo.get_nombre()\n"
    "             ^^^^^^^^^^^^^^^^^^^^^^^^\n"
    "AttributeError: 'NoneType' object has no attribute 'get_nombre'"
)
body(
    "La corrección consiste en verificar siempre con if objeto is not None: antes de "
    "usar el resultado de cualquier operación que pueda retornar None."
)
divider()
body("Captura — Stack trace del AttributeError en la consola:", bold=True)
image_placeholder("[ CAPTURA: stack trace completo visible en la terminal del IDE ]")

doc.add_page_break()


# ═══════════════════════════════════════════════════════════════════════════════
#  EJERCICIO 3 — DEPURACIÓN
# ═══════════════════════════════════════════════════════════════════════════════

heading("EJERCICIO 3: DOMINIO DE LAS HERRAMIENTAS DE DEPURACIÓN")
divider()

heading("Módulo de práctica: debug_practica.py", level=2)
body(
    "El módulo ejercicio3/debug_practica.py contiene la clase Inventario, que agrupa "
    "una colección de objetos Producto y expone métodos para calcular el valor total del "
    "stock, aplicar descuentos generales y realizar búsquedas por nombre. Cada breakpoint "
    "recomendado está marcado en el código con el comentario  # ← BREAKPOINT."
)
body(
    "Al iniciar el programa con F5 en VS Code, el intérprete detiene la ejecución en "
    "cada punto de interrupción. Desde ahí el flujo se controla con las siguientes "
    "combinaciones de teclas:"
)

# Tabla de controles
tbl = doc.add_table(rows=4, cols=3)
tbl.style = "Table Grid"
headers = ["Acción", "VS Code", "Qué hace"]
rows_data = [
    ["Step Over", "F10", "Avanza línea por línea sin entrar dentro de la función llamada."],
    ["Step Into",  "F11", "Entra dentro del código de la función invocada en la línea actual."],
    ["Continue",   "F5",  "Continúa la ejecución hasta el próximo breakpoint."],
]
# Encabezado
for i, h in enumerate(headers):
    cell = tbl.cell(0, i)
    set_cell_bg(cell, "1A356E")
    run = cell.paragraphs[0].add_run(h)
    run.bold = True
    run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    run.font.size = Pt(10)
# Datos
for r_idx, row_data in enumerate(rows_data, start=1):
    for c_idx, val in enumerate(row_data):
        cell = tbl.cell(r_idx, c_idx)
        run  = cell.paragraphs[0].add_run(val)
        run.font.size = Pt(10)
        if c_idx == 0:
            run.bold = True

doc.add_paragraph()
body(
    "El panel lateral Variables muestra en tiempo real el valor de todas las variables "
    "en el ámbito actual. Al recorrer el bucle de calcular_valor_total() observé cómo "
    "la variable total se incrementa en cada iteración. En aplicar_descuento_general() "
    "pude ver cómo se construye cada diccionario con precio_original, precio_nuevo y "
    "ahorro antes de ser agregado a la lista de resultados."
)
divider()

body("Captura — Breakpoint activo y panel Variables en el debugger:", bold=True)
image_placeholder("[ CAPTURA: ejecución detenida en un breakpoint, panel Variables visible ]")

divider()
body("Captura — Step Into dentro del método _calcular_nuevo_precio:", bold=True)
image_placeholder("[ CAPTURA: debugger dentro del método interno, variables locales visibles ]")

doc.add_page_break()


# ═══════════════════════════════════════════════════════════════════════════════
#  EJERCICIO 4 — CONTROL DE VERSIONES
# ═══════════════════════════════════════════════════════════════════════════════

heading("EJERCICIO 4: CONTROL DE VERSIONES CON GIT")
divider()

heading("Repositorio local e inicialización", level=2)
body(
    "Inicialicé un repositorio Git local en la raíz de la carpeta python/ del proyecto. "
    "El repositorio quedó configurado con nombre de usuario y correo institucional "
    "para el registro correcto de los commits."
)
code_block("git init\ngit config user.name  \"Estudiante ITI\"\ngit config user.email \"estudiante@iti.edu\"")
divider()
body("Captura — Inicialización del repositorio Git:", bold=True)
image_placeholder("[ CAPTURA: terminal mostrando 'Initialized empty Git repository' ]")

# --- .gitignore ---
heading("Archivo .gitignore", level=2)
body(
    "Creé el archivo .gitignore para excluir del repositorio todos los archivos que el "
    "intérprete y los IDEs generan automáticamente. Los grupos excluidos son:"
)
ignorados = [
    "Bytecode de Python: __pycache__/, *.pyc, *.pyo",
    "Entornos virtuales: .venv/, venv/, env/",
    "Configuraciones de VS Code: .vscode/",
    "Configuraciones de PyCharm: .idea/",
    "Archivos de sistema operativo: .DS_Store, Thumbs.db",
    "Logs y bases de datos temporales: *.log, *.sqlite",
    "Cobertura de tests: .coverage, htmlcov/",
]
for item in ignorados:
    p = doc.add_paragraph(style="List Bullet")
    p.add_run(item).font.size = Pt(11)

divider()
body("Captura — Archivo .gitignore abierto en el editor:", bold=True)
image_placeholder("[ CAPTURA: contenido del .gitignore visible en el IDE ]")

# --- Primer commit ---
heading("Primer Commit", level=2)
body(
    "Realicé el primer commit en la rama master documentando la estructura inicial "
    "del proyecto con todos los módulos de los ejercicios 1, 2 y 3."
)
code_block(
    "git add .\n"
    "git commit -m \"feat: Estructura inicial del proyecto POO - Ejercicios 1-3\""
)
divider()
body("Captura — Confirmación del primer commit en la terminal:", bold=True)
image_placeholder("[ CAPTURA: terminal mostrando el hash y los archivos del primer commit ]")

# --- Ramas ---
heading("Trabajo con ramas (branches)", level=2)
body(
    "Creé la rama feature/nueva-funcionalidad para agregar el método aplicar_descuento() "
    "a la clase Producto. Este método permite reducir el precio de un artículo por un "
    "porcentaje dado, con validación de que el valor esté entre 0 y 100."
)
code_block(
    "git checkout -b feature/nueva-funcionalidad\n"
    "# ... modificaciones en ejercicio1/producto.py ...\n"
    "git add ejercicio1/producto.py\n"
    "git commit -m \"feat: Agregar método aplicar_descuento a la clase Producto\""
)
body(
    "Al hacer git checkout master el método aplicar_descuento() desaparece del archivo. "
    "Al regresar con git checkout feature/nueva-funcionalidad vuelve a aparecer. Esto "
    "demuestra cómo Git aísla los cambios experimentales de la versión estable del código."
)
body("El historial de commits resultante es el siguiente:")
code_block(
    "* a5c08ae  (feature/nueva-funcionalidad)  feat: Agregar método aplicar_descuento\n"
    "* 2821d07  (master)                        feat: Estructura inicial del proyecto POO"
)
divider()
body("Captura — Historial de ramas y commits (git log --oneline --all --graph):", bold=True)
image_placeholder("[ CAPTURA: terminal mostrando el árbol de commits con ambas ramas ]")

divider()
body("Captura — Interfaz gráfica de Git en el IDE (panel Source Control):", bold=True)
image_placeholder("[ CAPTURA: panel de Git del IDE mostrando las ramas y el historial ]")


# ── Guardar ──────────────────────────────────────────────────────────────────
doc.save(OUTPUT)
print(f"✓ Documento generado: {OUTPUT}")
