from database import conectar


def agregar_producto(nombre, categoria, precio, stock):
    """Agrego un producto nuevo al catálogo de la cafetería."""
    conn = conectar()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)",
            (nombre, categoria, precio, stock)
        )
        conn.commit()
        return True, f"Producto '{nombre}' agregado correctamente."
    except Exception as e:
        conn.rollback()
        return False, f"No pude agregar el producto: {e}"
    finally:
        conn.close()


def editar_producto(id_producto, nombre=None, categoria=None, precio=None, stock=None):
    """Actualizo los datos de un producto existente."""
    conn = conectar()
    cursor = conn.cursor()

    # Obtengo los datos actuales para conservar los que no se modifican
    cursor.execute("SELECT * FROM productos WHERE id = ?", (id_producto,))
    producto = cursor.fetchone()

    if not producto:
        conn.close()
        return False, "No encontré el producto indicado."

    nombre = nombre if nombre else producto["nombre"]
    categoria = categoria if categoria else producto["categoria"]
    precio = precio if precio is not None else producto["precio"]
    stock = stock if stock is not None else producto["stock"]

    cursor.execute(
        "UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ? WHERE id = ?",
        (nombre, categoria, precio, stock, id_producto)
    )
    conn.commit()
    conn.close()
    return True, "Producto actualizado."


def listar_productos(solo_activos=True):
    """Obtengo la lista de productos, filtrada opcionalmente por estado activo."""
    conn = conectar()
    cursor = conn.cursor()

    if solo_activos:
        cursor.execute("SELECT * FROM productos WHERE activo = 1 ORDER BY categoria, nombre")
    else:
        cursor.execute("SELECT * FROM productos ORDER BY categoria, nombre")

    productos = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return productos


def buscar_producto(termino):
    """Busco productos cuyo nombre coincida parcialmente con el término dado."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM productos WHERE nombre LIKE ? AND activo = 1 ORDER BY nombre",
        (f"%{termino}%",)
    )
    productos = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return productos


def obtener_producto(id_producto):
    """Obtengo los datos completos de un producto por su identificador."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM productos WHERE id = ?", (id_producto,))
    producto = cursor.fetchone()
    conn.close()
    return dict(producto) if producto else None


def listar_categorias():
    """Obtengo las categorías disponibles en el catálogo."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT categoria FROM productos WHERE activo = 1 ORDER BY categoria")
    categorias = [fila["categoria"] for fila in cursor.fetchall()]
    conn.close()
    return categorias


def productos_por_categoria(categoria):
    """Filtro los productos de una categoría específica."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM productos WHERE categoria = ? AND activo = 1 ORDER BY nombre",
        (categoria,)
    )
    productos = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return productos


def desactivar_producto(id_producto):
    """Desactivo un producto del catálogo sin eliminar su registro."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("UPDATE productos SET activo = 0 WHERE id = ?", (id_producto,))
    conn.commit()
    conn.close()
    return True


def actualizar_stock(id_producto, cantidad):
    """Ajusto el stock de un producto, sumando o restando la cantidad indicada."""
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("SELECT stock FROM productos WHERE id = ?", (id_producto,))
    producto = cursor.fetchone()

    if not producto:
        conn.close()
        return False, "No encontré el producto."

    nuevo_stock = producto["stock"] + cantidad
    if nuevo_stock < 0:
        conn.close()
        return False, "No hay suficiente stock disponible."

    cursor.execute("UPDATE productos SET stock = ? WHERE id = ?", (nuevo_stock, id_producto))
    conn.commit()
    conn.close()
    return True, f"Stock actualizado a {nuevo_stock} unidades."
