# -*- coding: utf-8 -*-
"""Genera Reporte_Biblioteca.pdf y Memoria_Trabajo.pdf (Final U2 POO)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image,
                                Table, TableStyle, PageBreak, Preformatted)

OUT = "/home/leo/final-unidad-2/reportes"
IMG = "/home/leo/final-unidad-2/imagenes"
SALIDA = "/home/leo/final-unidad-2/biblioteca/salida.txt"

AZUL = colors.HexColor("#1F3864")
GRIS = colors.HexColor("#595959")

estilos = getSampleStyleSheet()
st_titulo = ParagraphStyle("Titulo", parent=estilos["Title"], fontSize=20,
                           textColor=AZUL, spaceAfter=6)
st_sub = ParagraphStyle("Sub", parent=estilos["Heading2"], fontSize=14,
                        textColor=AZUL, spaceBefore=14, spaceAfter=6)
st_h3 = ParagraphStyle("H3", parent=estilos["Heading3"], fontSize=12,
                       textColor=GRIS, spaceBefore=10, spaceAfter=4)
st_body = ParagraphStyle("Body", parent=estilos["BodyText"], fontSize=11,
                         leading=15, alignment=TA_JUSTIFY, spaceAfter=8)
st_centro = ParagraphStyle("Centro", parent=estilos["BodyText"], fontSize=11,
                           alignment=TA_CENTER, spaceAfter=4)
st_code = ParagraphStyle("Code", parent=estilos["Code"], fontSize=8,
                         leading=10, textColor=colors.HexColor("#222222"))


def pie_pagina(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRIS)
    canvas.drawCentredString(A4[0] / 2, 1.1 * cm, f"Página {doc.page}")
    canvas.restoreState()


def portada(historia, titulo, subtitulo):
    historia.append(Spacer(1, 3.2 * cm))
    historia.append(Paragraph("Universidad Politécnica del Valle de Toluca", st_titulo))
    historia.append(Paragraph("Programación Orientada a Objetos", st_sub))
    historia.append(Spacer(1, 1.2 * cm))
    historia.append(Paragraph(titulo, ParagraphStyle(
        "T", parent=st_titulo, fontSize=24, alignment=TA_CENTER)))
    historia.append(Paragraph(subtitulo, ParagraphStyle(
        "S", parent=st_centro, fontSize=13, textColor=GRIS)))
    historia.append(Spacer(1, 2.2 * cm))
    for linea in [
        "Programa educativo: Ingeniería en Tecnologías de la Información",
        "e Innovación Digital con TSU en Desarrollo de Software Multiplataforma",
        "",
        "Nombre del alumno: Leonardo Arturo Carmona Vargas",
        "Nombre de la facilitadora: Montes de Oca Herrera Martha",
        "Fecha: 11 de agosto de 2026",
    ]:
        historia.append(Paragraph(linea, ParagraphStyle(
            "D", parent=st_centro, fontSize=12, leading=18)))
    historia.append(PageBreak())


# ─────────────────────────────────────────────────────────────
# Reporte_Biblioteca.pdf
# ─────────────────────────────────────────────────────────────
reporte = SimpleDocTemplate(
    f"{OUT}/Reporte_Biblioteca.pdf", pagesize=A4,
    leftMargin=2.5 * cm, rightMargin=2.5 * cm,
    topMargin=2.2 * cm, bottomMargin=2.2 * cm,
    title="Reporte Final Unidad 2 - Gestion de Biblioteca",
    author="Leonardo Arturo Carmona Vargas")
H = []
portada(H, "Sistema \u201cGestión de Biblioteca\u201d",
        "Reporte: Análisis y Diseño UML (Final Unidad 2)")

H.append(Paragraph("Análisis del problema", st_sub))
H.append(Paragraph(
    "La empresa necesita un sistema modular y escalable para gestionar su "
    "biblioteca: registrar libros y usuarios, realizar préstamos y "
    "devoluciones, y generar un reporte de los libros prestados. Antes de "
    "programar, se definió el diseño con UML para que el código quede "
    "ordenado y reutilizable bajo el paradigma orientado a objetos.", st_body))
H.append(Paragraph(
    "Se identificaron seis clases, cada una con una responsabilidad clara: "
    "Libro guarda los datos del catálogo, Usuario es la clase base "
    "(abstracta) de la que heredan Estudiante y Docente, Prestamo registra "
    "cada préstamo con sus fechas y días permitidos, y Biblioteca administra "
    "las colecciones de libros, usuarios y préstamos.", st_body))

H.append(Paragraph("Identificación de clases", st_h3))
tabla = Table([
    ["Clase", "Atributos", "Métodos", "Relación"],
    ["Libro", "titulo, autor, isbn, anio, estado",
     "esDisponible(), marcarPrestado(), marcarDisponible()", "Clase base del catálogo"],
    ["Usuario", "nombre, id", "calcularTiempoPrestamo() (abstracto)",
     "Clase base (abstracta)"],
    ["Estudiante", "hereda de Usuario", "calcularTiempoPrestamo() = 7 días",
     "Herencia de Usuario"],
    ["Docente", "hereda de Usuario", "calcularTiempoPrestamo() = 15 días",
     "Herencia de Usuario"],
    ["Prestamo", "libro, usuario, fechas, diasPermitidos",
     "devolver(), estaActivo()", "Asociación con Libro y Usuario"],
    ["Biblioteca", "libros, usuarios, prestamos (ArrayList)",
     "registrarLibro(), prestarLibro(), devolverLibro(), reporteLibrosPrestados()",
     "Composición: contiene a los demás"],
], colWidths=[2.4 * cm, 4.0 * cm, 5.2 * cm, 4.4 * cm])
tabla.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), AZUL),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTSIZE", (0, 0), (-1, -1), 8),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BFBFBF")),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F2F2F2")]),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
H.append(tabla)

H.append(Paragraph("Principios de POO aplicados", st_sub))
for texto in [
    "<b>Encapsulamiento:</b> todos los atributos son privados y se accede "
    "solo por getters y setters; el estado de un libro cambia mediante "
    "marcarPrestado() y marcarDisponible().",
    "<b>Herencia:</b> Usuario es una clase abstracta de la que heredan "
    "Estudiante y Docente, compartiendo nombre e id.",
    "<b>Polimorfismo:</b> calcularTiempoPrestamo() responde 7 días para "
    "Estudiante y 15 para Docente, llamando al mismo método.",
    "<b>Colecciones:</b> Biblioteca almacena libros, usuarios y préstamos "
    "en ArrayList, lo que permite crecer sin un límite fijo.",
]:
    H.append(Paragraph(texto, st_body))

for archivo, titulo in [
    ("clases.png", "Diagrama de clases del sistema"),
    ("casos_de_uso.png", "Diagrama de casos de uso (actores: Bibliotecario y Usuario)"),
    ("secuencia_prestamo.png", "Diagrama de secuencia: prestar libro"),
]:
    H.append(Paragraph(titulo, st_sub))
    H.append(Spacer(1, 0.3 * cm))
    img = Image(f"{IMG}/{archivo}")
    img.drawWidth = A4[0] - 5.0 * cm
    img.drawHeight = img.drawWidth * img.imageHeight / img.imageWidth
    H.append(img)
    H.append(Spacer(1, 0.5 * cm))

H.append(Paragraph(
    "El diseño completo (código Java, salida del programa y conclusiones) "
    "se entrega en la carpeta comprimida Biblioteca.zip y en la memoria de "
    "trabajo.", st_body))
reporte.build(H, onFirstPage=pie_pagina, onLaterPages=pie_pagina)
print("OK: Reporte_Biblioteca.pdf")

# ─────────────────────────────────────────────────────────────
# Memoria_Trabajo.pdf
# ─────────────────────────────────────────────────────────────
memoria = SimpleDocTemplate(
    f"{OUT}/Memoria_Trabajo.pdf", pagesize=A4,
    leftMargin=2.5 * cm, rightMargin=2.5 * cm,
    topMargin=2.2 * cm, bottomMargin=2.2 * cm,
    title="Memoria de Trabajo - Gestion de Biblioteca",
    author="Leonardo Arturo Carmona Vargas")
M = []
portada(M, "Memoria de Trabajo", "Sistema \u201cGestión de Biblioteca\u201d (Final Unidad 2)")

M.append(Paragraph("Conclusiones", st_sub))
for texto in [
    "Esta práctica me sirvió para ver el ciclo completo de un proyecto de "
    "software: primero pensar y dibujar el diseño con UML y después "
    "programarlo. El diseño me ahorró problemas: cuando me senté a codificar "
    "ya sabía qué clase hacía qué, y el código salió casi solo.",
    "Lo que más me costó fue entender por qué el polimorfismo es útil, pero "
    "cuando vi en la consola que el mismo método daba 7 días para la "
    "estudiante y 15 para el docente, lo entendí todo: el sistema no necesita "
    "saber quién es quién, cada objeto sabe responder por sí mismo.",
    "El encapsulamiento se notó en la práctica: al esconder los atributos, "
    "los errores como prestar dos veces el mismo libro se evitan en el "
    "método de la biblioteca, no en cada pantalla.",
    "El sistema quedó listo para crecer: agregar otro tipo de usuario, multas "
    "por retraso o búsqueda por título sería sumar clases o métodos sin tocar "
    "lo que ya funciona, gracias a que el código quedó modular.",
    "Cumplí el objetivo general de la práctica: analizar un problema, "
    "diseñar su solución con diagramas UML y codificarla aplicando clases, "
    "objetos, encapsulamiento, herencia y polimorfismo.",
]:
    M.append(Paragraph(texto, st_body))

M.append(Paragraph("Anexo: salida del programa", st_sub))
salida = open(SALIDA, encoding="utf-8").read()
for bloque in [salida[i:i + 1900] for i in range(0, len(salida), 1900)]:
    M.append(Preformatted(bloque, st_code))
    M.append(Spacer(1, 0.4 * cm))

memoria.build(M, onFirstPage=pie_pagina, onLaterPages=pie_pagina)
print("OK: Memoria_Trabajo.pdf")
