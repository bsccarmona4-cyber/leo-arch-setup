import sqlite3
import os
import hashlib

# Defino la ruta donde se almacenará la base de datos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "cafeteria.db")


def conectar():
    """Establezco la conexión con la base de datos y activo las llaves foráneas."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn


def crear_tablas():
    """Creo todas las tablas necesarias para el funcionamiento del sistema."""
    conn = conectar()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            usuario TEXT NOT NULL UNIQUE,
            contrasena TEXT NOT NULL,
            rol TEXT NOT NULL DEFAULT 'cajero',
            activo INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            telefono TEXT,
            email TEXT,
            fecha_nacimiento TEXT,
            fecha_registro TEXT NOT NULL DEFAULT (date('now'))
        );

        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            categoria TEXT NOT NULL,
            precio REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            activo INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_usuario INTEGER NOT NULL,
            id_cliente INTEGER,
            fecha TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            total REAL NOT NULL,
            puntos_otorgados INTEGER NOT NULL DEFAULT 0,
            puntos_canjeados INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
            FOREIGN KEY (id_cliente) REFERENCES clientes(id)
        );

        CREATE TABLE IF NOT EXISTS detalle_ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_venta INTEGER NOT NULL,
            id_producto INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (id_venta) REFERENCES ventas(id),
            FOREIGN KEY (id_producto) REFERENCES productos(id)
        );

        CREATE TABLE IF NOT EXISTS puntos_lealtad (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_cliente INTEGER NOT NULL UNIQUE,
            puntos_acumulados INTEGER NOT NULL DEFAULT 0,
            puntos_canjeados INTEGER NOT NULL DEFAULT 0,
            puntos_disponibles INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (id_cliente) REFERENCES clientes(id)
        );

        CREATE TABLE IF NOT EXISTS movimientos_puntos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_cliente INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            puntos INTEGER NOT NULL,
            descripcion TEXT,
            fecha TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (id_cliente) REFERENCES clientes(id)
        );

        CREATE TABLE IF NOT EXISTS promociones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            puntos_requeridos INTEGER NOT NULL,
            tipo_recompensa TEXT NOT NULL,
            valor_recompensa REAL NOT NULL,
            activa INTEGER NOT NULL DEFAULT 1,
            fecha_inicio TEXT,
            fecha_fin TEXT
        );
    """)

    conn.commit()
    conn.close()


def insertar_datos_iniciales():
    """Inserto datos de prueba para que el sistema funcione desde el primer arranque."""
    conn = conectar()
    cursor = conn.cursor()

    # Verifico si ya existen usuarios para no duplicar datos
    cursor.execute("SELECT COUNT(*) FROM usuarios")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # Creo el usuario administrador con contraseña cifrada
    contrasena_admin = hashlib.sha256("admin123".encode()).hexdigest()
    contrasena_cajero = hashlib.sha256("cajero123".encode()).hexdigest()

    cursor.executemany(
        "INSERT INTO usuarios (nombre, usuario, contrasena, rol) VALUES (?, ?, ?, ?)",
        [
            ("Administrador", "admin", contrasena_admin, "admin"),
            ("María López", "maria", contrasena_cajero, "cajero"),
        ]
    )

    # Cargo el catálogo inicial de productos
    productos = [
        ("Americano", "Café", 45.00, 100),
        ("Capuchino", "Café", 55.00, 100),
        ("Latte", "Café", 60.00, 100),
        ("Mocha", "Café", 65.00, 80),
        ("Espresso", "Café", 35.00, 100),
        ("Frappé de Café", "Bebida Fría", 70.00, 60),
        ("Té Verde", "Té", 40.00, 80),
        ("Té Chai", "Té", 50.00, 70),
        ("Chocolate Caliente", "Bebida Caliente", 50.00, 60),
        ("Smoothie de Frutas", "Bebida Fría", 65.00, 50),
        ("Croissant", "Panadería", 35.00, 40),
        ("Panini de Jamón", "Alimentos", 75.00, 30),
        ("Ensalada César", "Alimentos", 85.00, 25),
        ("Muffin de Arándano", "Panadería", 40.00, 35),
        ("Galleta de Chocolate", "Panadería", 25.00, 50),
        ("Sándwich Club", "Alimentos", 90.00, 20),
        ("Jugo de Naranja", "Bebida Fría", 45.00, 40),
        ("Agua Mineral", "Bebida Fría", 20.00, 100),
    ]

    cursor.executemany(
        "INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)",
        productos
    )

    # Registro algunos clientes frecuentes de ejemplo
    clientes = [
        ("Carlos Hernández", "5551234567", "carlos@email.com", "1995-03-15"),
        ("Ana García", "5559876543", "ana@email.com", "1990-07-22"),
        ("Roberto Martínez", "5554567890", "roberto@email.com", "1988-11-08"),
    ]

    cursor.executemany(
        "INSERT INTO clientes (nombre, telefono, email, fecha_nacimiento) VALUES (?, ?, ?, ?)",
        clientes
    )

    # Inicializo los puntos de lealtad para cada cliente registrado
    cursor.execute("SELECT id FROM clientes")
    for fila in cursor.fetchall():
        cursor.execute(
            "INSERT INTO puntos_lealtad (id_cliente) VALUES (?)",
            (fila[0],)
        )

    # Defino las promociones iniciales del programa de lealtad
    promociones = [
        ("Café Gratis", "Canjea tus puntos por un café americano", 50, "producto", 1, 1, None, None),
        ("Descuento 10%", "Obtén un 10% de descuento en tu compra", 30, "descuento", 10, 1, None, None),
        ("Postre de Regalo", "Llévate un muffin o galleta gratis", 40, "producto", 1, 1, None, None),
        ("Descuento 20%", "Obtén un 20% de descuento en tu compra", 80, "descuento", 20, 1, None, None),
        ("Bebida Premium", "Canjea por un frappé o smoothie gratis", 70, "producto", 1, 1, None, None),
    ]

    cursor.executemany(
        """INSERT INTO promociones 
           (nombre, descripcion, puntos_requeridos, tipo_recompensa, valor_recompensa, activa, fecha_inicio, fecha_fin) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        promociones
    )

    conn.commit()
    conn.close()


def inicializar_bd():
    """Preparo la base de datos completa: tablas y datos iniciales."""
    crear_tablas()
    insertar_datos_iniciales()


if __name__ == "__main__":
    inicializar_bd()
    print("Base de datos inicializada correctamente.")
