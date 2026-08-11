"""
web_app.py — Dashboard Web para Cafetería POS.
Flask + Jinja2 + Chart.js
Ejecutar: python web_app.py
Abrir: http://localhost:5000
"""
import sys
import os
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, session, jsonify

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import inicializar_bd
from auth import iniciar_sesion
from productos import (
    listar_productos, buscar_producto, listar_categorias, productos_por_categoria,
    agregar_producto, editar_producto, desactivar_producto
)
from clientes import (
    listar_clientes, buscar_cliente, obtener_cliente, registrar_cliente,
    editar_cliente, historial_compras, clientes_cumpleanos_mes
)
from lealtad import (
    consultar_puntos, listar_promociones, canjear_puntos, crear_promocion
)
from pos import crear_venta
from reportes import (
    reporte_ventas_dia, reporte_ventas_periodo, productos_mas_vendidos,
    ranking_clientes, resumen_general, reporte_categorias
)

app = Flask(__name__)
app.secret_key = os.urandom(24).hex()


# ─── AUTH DECORATOR ───────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "usuario" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated


# ═══════════════════════════════════════════════════════════
# LOGIN
# ═══════════════════════════════════════════════════════════

@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        user = request.form.get("usuario", "").strip()
        pwd = request.form.get("contrasena", "").strip()
        emp = iniciar_sesion(user, pwd)
        if emp:
            session["usuario"] = emp["usuario"]
            session["nombre"] = emp["nombre"]
            session["rol"] = emp["rol"]
            session["id_usuario"] = emp["id"]
            if emp["rol"] == "cajero":
                return redirect(url_for("ventas"))
            return redirect(url_for("dashboard"))
        error = "Credenciales incorrectas"
    return render_template("login.html", error=error)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ═══════════════════════════════════════════════════════════
# DASHBOARD
# ═══════════════════════════════════════════════════════════

@app.route("/")
@login_required
def dashboard():
    resumen = resumen_general()
    ranking = ranking_clientes(5)
    top = productos_mas_vendidos(5)
    categorias = reporte_categorias()
    return render_template(
        "dashboard.html",
        resumen=resumen,
        ranking=ranking,
        top=top,
        categorias=categorias,
    )


# ═══════════════════════════════════════════════════════════
# PUNTO DE VENTA WEB
# ═══════════════════════════════════════════════════════════

@app.route("/ventas", methods=["GET", "POST"])
@login_required
def ventas():
    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"error": "sin datos"}), 400

        items = data.get("items", [])
        id_cliente = data.get("id_cliente")
        puntos_canjeados = data.get("puntos_canjeados", 0)
        descuento = data.get("descuento", 0)

        exito, msg, ticket = crear_venta(
            session["id_usuario"], items, id_cliente, puntos_canjeados, descuento
        )
        return jsonify({"exito": exito, "mensaje": msg, "ticket": ticket})

    productos = listar_productos()
    categorias = listar_categorias()
    promociones = listar_promociones()
    return render_template(
        "ventas.html",
        productos=productos,
        categorias=categorias,
        promociones=promociones,
    )


@app.route("/api/productos")
@login_required
def api_productos():
    return jsonify(listar_productos())


@app.route("/api/clientes/buscar")
@login_required
def api_buscar_cliente():
    q = request.args.get("q", "")
    return jsonify(buscar_cliente(q) if q else listar_clientes())


@app.route("/api/clientes/<int:id>")
@login_required
def api_cliente_por_id(id):
    cli = obtener_cliente(id)
    if not cli:
        return jsonify({"error": "no encontrado"}), 404
    return jsonify(cli)


@app.route("/api/clientes/rapido", methods=["POST"])
@login_required
def api_cliente_rapido():
    data = request.get_json()
    nombre = data.get("nombre", "").strip()
    if not nombre:
        return jsonify({"error": "nombre requerido"}), 400
    tel = data.get("telefono") or None
    email = data.get("email") or None
    fnac = data.get("fecha_nacimiento") or None
    exito, msg = registrar_cliente(nombre, tel, email, fnac)
    if exito:
        from database import conectar
        conn = conectar()
        cid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.close()
        return jsonify({"id": cid, "nombre": nombre, "puntos_disponibles": 0})
    return jsonify({"error": msg}), 400


@app.route("/api/puntos/<int:id_cliente>")
@login_required
def api_puntos(id_cliente):
    saldo = consultar_puntos(id_cliente)
    return jsonify({"puntos_disponibles": saldo["puntos_disponibles"] if saldo else 0})


@app.route("/api/promociones/cliente/<int:id_cliente>")
@login_required
def api_promos_asequibles(id_cliente):
    """Devuelve solo las promociones que el cliente puede pagar con sus puntos."""
    saldo = consultar_puntos(id_cliente)
    disponibles = saldo["puntos_disponibles"] if saldo else 0
    todas = listar_promociones()
    asequibles = [p for p in todas if p["puntos_requeridos"] <= disponibles]
    return jsonify({
        "puntos_disponibles": disponibles,
        "promociones": asequibles,
    })


# ═══════════════════════════════════════════════════════════
# PRODUCTOS
# ═══════════════════════════════════════════════════════════

@app.route("/productos")
@login_required
def productos():
    q = request.args.get("q", "")
    prods = buscar_producto(q) if q else listar_productos()
    categorias = listar_categorias()
    return render_template(
        "productos.html", productos=prods, categorias=categorias, query=q
    )


@app.route("/productos/agregar", methods=["POST"])
@login_required
def productos_agregar():
    nombre = request.form["nombre"]
    categoria = request.form["categoria"]
    precio = float(request.form["precio"])
    stock = int(request.form.get("stock", 0))
    exito, msg = agregar_producto(nombre, categoria, precio, stock)
    return redirect(url_for("productos"))


@app.route("/productos/editar/<int:id>", methods=["POST"])
@login_required
def productos_editar(id):
    nombre = request.form.get("nombre") or None
    categoria = request.form.get("categoria") or None
    precio = float(request.form["precio"]) if request.form.get("precio") else None
    stock = int(request.form["stock"]) if request.form.get("stock") else None
    exito, msg = editar_producto(id, nombre, categoria, precio, stock)
    return redirect(url_for("productos"))


@app.route("/productos/desactivar/<int:id>", methods=["POST"])
@login_required
def productos_desactivar(id):
    if session.get("rol") == "admin":
        desactivar_producto(id)
    return redirect(url_for("productos"))


# ═══════════════════════════════════════════════════════════
# CLIENTES
# ═══════════════════════════════════════════════════════════

@app.route("/clientes")
@login_required
def clientes():
    q = request.args.get("q", "")
    clis = buscar_cliente(q) if q else listar_clientes()
    return render_template("clientes.html", clientes=clis, query=q)


@app.route("/clientes/<int:id>")
@login_required
def cliente_detalle(id):
    cli = obtener_cliente(id)
    if not cli:
        return redirect(url_for("clientes"))
    compras = historial_compras(id)
    return render_template("cliente_detalle.html", cliente=cli, compras=compras)


@app.route("/clientes/registrar", methods=["POST"])
@login_required
def clientes_registrar():
    nombre = request.form["nombre"]
    tel = request.form.get("telefono") or None
    email = request.form.get("email") or None
    fnac = request.form.get("fecha_nacimiento") or None
    exito, msg = registrar_cliente(nombre, tel, email, fnac)
    return redirect(url_for("clientes"))


# ═══════════════════════════════════════════════════════════
# LEALTAD
# ═══════════════════════════════════════════════════════════

@app.route("/lealtad")
@login_required
def lealtad():
    promociones = listar_promociones()
    return render_template("lealtad.html", promociones=promociones)


@app.route("/lealtad/canjear", methods=["POST"])
@login_required
def lealtad_canjear():
    id_cliente = int(request.form["id_cliente"])
    id_promo = int(request.form["id_promo"])
    exito, msg, resultado = canjear_puntos(id_cliente, id_promo)
    return redirect(url_for("lealtad"))


# ═══════════════════════════════════════════════════════════
# REPORTES
# ═══════════════════════════════════════════════════════════

@app.route("/reportes")
@login_required
def reportes():
    resumen = resumen_general()
    ranking = ranking_clientes(10)
    top = productos_mas_vendidos(15)
    categorias = reporte_categorias()
    return render_template(
        "reportes.html",
        resumen=resumen,
        ranking=ranking,
        top=top,
        categorias=categorias,
    )


@app.route("/api/reportes/ventas_dia")
@login_required
def api_ventas_dia():
    return jsonify(reporte_ventas_dia())


@app.route("/api/reportes/ventas_periodo")
@login_required
def api_ventas_periodo():
    inicio = request.args.get("inicio", "")
    fin = request.args.get("fin", "")
    if inicio and fin:
        return jsonify(reporte_ventas_periodo(inicio, fin))
    return jsonify({"error": "fechas requeridas"}), 400


@app.route("/api/reportes/top_productos")
@login_required
def api_top_productos():
    return jsonify(productos_mas_vendidos(10))


@app.route("/api/reportes/categorias")
@login_required
def api_categorias_reportes():
    return jsonify(reporte_categorias())


# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════

if __name__ == "__main__":
    inicializar_bd()
    print("\n  ☕ Cafetería POS — Dashboard Web")
    print("  Abre http://localhost:5000 en tu navegador\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
