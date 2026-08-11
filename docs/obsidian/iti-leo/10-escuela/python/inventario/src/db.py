"""
db.py

Gestión de conexiones a la base de datos SQLite.

La función get_connection() es un context manager: abre la conexión, la entrega
al bloque with, confirma o revierte la transacción, y cierra la conexión
automáticamente al terminar, sin importar si ocurrió un error.

La ruta del archivo de base de datos se lee desde la variable de entorno DB_PATH
definida en el archivo .env. Si no existe la variable, se usa 'inventario.db'.
"""

import sqlite3
import os
from contextlib import contextmanager
from typing import Generator

from dotenv import load_dotenv

load_dotenv()


def _get_db_path() -> str:
    """
    Lee la ruta de la base de datos desde la variable de entorno DB_PATH.

    Si la ruta es relativa, la resuelve a partir del directorio raíz del proyecto.

    Returns:
        str: Ruta absoluta al archivo de base de datos.
    """
    db_path = os.getenv("DB_PATH", "inventario.db")
    if not os.path.isabs(db_path):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, db_path)
    return db_path


@contextmanager
def get_connection(db_path: str | None = None) -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager que proporciona una conexión SQLite lista para usar.

    Uso:
        with get_connection() as conn:
            conn.execute("SELECT * FROM productos")

    La conexión se cierra automáticamente al salir del bloque with, incluso
    si ocurre una excepción. Si la operación fue exitosa se confirma con commit;
    si ocurrió un error de base de datos se revierte con rollback.

    Args:
        db_path: Ruta al archivo .db. Si es None usa el valor de .env.
                 Pasar ":memory:" para bases de datos en memoria (útil en tests).

    Yields:
        sqlite3.Connection: Conexión activa con row_factory configurada para
                            acceder a columnas por nombre.
    """
    ruta = db_path if db_path is not None else _get_db_path()
    conn = sqlite3.connect(ruta)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except sqlite3.Error:
        conn.rollback()
        raise
    finally:
        conn.close()


def inicializar_bd(db_path: str | None = None) -> None:
    """
    Crea la tabla 'productos' si no existe.

    Es seguro llamar este método múltiples veces gracias a IF NOT EXISTS.

    Args:
        db_path: Ruta al archivo .db. Si es None usa el valor de .env.
    """
    sql = """
        CREATE TABLE IF NOT EXISTS productos (
            id     INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT    NOT NULL,
            precio REAL    NOT NULL CHECK(precio > 0),
            stock  INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0)
        )
    """
    with get_connection(db_path) as conn:
        conn.execute(sql)
    print("Base de datos lista.")
