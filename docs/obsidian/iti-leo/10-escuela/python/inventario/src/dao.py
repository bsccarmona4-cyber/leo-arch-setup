"""
dao.py

Data Access Object (DAO) para la entidad Producto.

Centraliza todo el acceso a la base de datos. La capa de servicio no conoce
ningún detalle de SQL; este módulo no conoce ninguna regla de negocio.

Todas las consultas usan parámetros con '?' para prevenir inyección SQL.
Todas las operaciones de escritura manejan sqlite3.Error con try-except.
"""

import sqlite3
from src.db import get_connection
from src.modelo import Producto


class ProductoDAO:
    """
    Proporciona operaciones CRUD para la tabla 'productos'.

    Todos los métodos trabajan con objetos Producto, no con tuplas crudas.

    Args:
        db_path (str | None): Ruta al archivo de base de datos.
                              None usa el valor definido en .env.
                              Pasar ":memory:" para tests aislados.
    """

    def __init__(self, db_path: str | None = None) -> None:
        self._db_path = db_path

    def guardar(self, producto: Producto) -> int:
        """
        Inserta un nuevo producto en la base de datos.

        Args:
            producto (Producto): Objeto a persistir.

        Returns:
            int: ID autoincremental asignado por la base de datos.

        Raises:
            sqlite3.Error: Si la operación de escritura falla.
        """
        sql = "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)"
        try:
            with get_connection(self._db_path) as conn:
                cursor = conn.execute(sql, (producto.nombre, producto.precio, producto.stock))
                return cursor.lastrowid
        except sqlite3.Error as e:
            raise sqlite3.Error(f"Error al guardar producto '{producto.nombre}': {e}") from e

    def buscar_por_id(self, id_producto: int) -> Producto | None:
        """
        Busca un producto por su ID.

        Args:
            id_producto (int): ID del producto a buscar.

        Returns:
            Producto si existe, None si no se encontró.
        """
        sql = "SELECT id, nombre, precio, stock FROM productos WHERE id = ?"
        with get_connection(self._db_path) as conn:
            fila = conn.execute(sql, (id_producto,)).fetchone()

        if fila is None:
            return None

        producto = Producto.__new__(Producto)
        producto._nombre = fila["nombre"]
        producto._precio = fila["precio"]
        producto._Producto__stock = fila["stock"]
        producto._Producto__id = fila["id"]
        return producto

    def listar_todos(self) -> list[Producto]:
        """
        Retorna todos los productos almacenados en la base de datos.

        Returns:
            list[Producto]: Lista de productos ordenados por ID.
                            Puede estar vacía si no hay registros.
        """
        sql = "SELECT id, nombre, precio, stock FROM productos ORDER BY id"
        with get_connection(self._db_path) as conn:
            filas = conn.execute(sql).fetchall()

        productos = []
        for fila in filas:
            p = Producto.__new__(Producto)
            p._nombre = fila["nombre"]
            p._precio = fila["precio"]
            p._Producto__stock = fila["stock"]
            p._Producto__id = fila["id"]
            productos.append(p)
        return productos

    def actualizar(self, producto: Producto) -> bool:
        """
        Actualiza nombre, precio y stock de un producto existente.

        Args:
            producto (Producto): Producto con los datos actualizados.
                                  El atributo id debe existir en la base de datos.

        Returns:
            bool: True si se actualizó al menos una fila, False si el ID no existía.

        Raises:
            sqlite3.Error: Si la operación de escritura falla.
        """
        sql = "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?"
        try:
            with get_connection(self._db_path) as conn:
                cursor = conn.execute(
                    sql,
                    (producto.nombre, producto.precio, producto.stock, producto.id)
                )
                return cursor.rowcount > 0
        except sqlite3.Error as e:
            raise sqlite3.Error(f"Error al actualizar producto ID={producto.id}: {e}") from e

    def eliminar(self, id_producto: int) -> bool:
        """
        Elimina un producto por su ID.

        Args:
            id_producto (int): ID del producto a eliminar.

        Returns:
            bool: True si se eliminó, False si el ID no existía.

        Raises:
            sqlite3.Error: Si la operación de escritura falla.
        """
        sql = "DELETE FROM productos WHERE id = ?"
        try:
            with get_connection(self._db_path) as conn:
                cursor = conn.execute(sql, (id_producto,))
                return cursor.rowcount > 0
        except sqlite3.Error as e:
            raise sqlite3.Error(f"Error al eliminar producto ID={id_producto}: {e}") from e
