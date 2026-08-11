"""
test_dao.py

Pruebas unitarias del ProductoDAO.

Cada test trabaja con una base de datos temporal en archivo independiente
creado en setUp y eliminado en tearDown. Esto garantiza aislamiento completo:
ningun test afecta el estado de los demas.
"""

import unittest
import tempfile
import os
from src.db import inicializar_bd
from src.dao import ProductoDAO
from src.modelo import Producto


class TestProductoDAO(unittest.TestCase):
    """Pruebas CRUD del ProductoDAO."""

    def setUp(self):
        """Crea una base de datos temporal antes de cada test."""
        self._db_fd, self._db_path = tempfile.mkstemp(suffix=".db")
        os.close(self._db_fd)
        inicializar_bd(self._db_path)
        self.dao = ProductoDAO(self._db_path)

    def tearDown(self):
        """Elimina la base de datos temporal despues de cada test."""
        try:
            os.unlink(self._db_path)
        except OSError:
            pass

    def test_guardar_retorna_id(self):
        """guardar() retorna un ID entero mayor a cero."""
        p = Producto("Laptop", 18500.0, 10)
        id_generado = self.dao.guardar(p)
        self.assertIsInstance(id_generado, int)
        self.assertGreater(id_generado, 0)

    def test_guardar_dos_productos_ids_distintos(self):
        """Dos productos guardados reciben IDs distintos por AUTOINCREMENT."""
        id1 = self.dao.guardar(Producto("Laptop", 18500.0, 10))
        id2 = self.dao.guardar(Producto("Mouse", 350.0, 50))
        self.assertNotEqual(id1, id2)

    def test_buscar_producto_existente(self):
        """buscar_por_id() retorna el producto con los datos correctos."""
        p = Producto("Teclado Mecanico", 1200.0, 8)
        id_bd = self.dao.guardar(p)

        recuperado = self.dao.buscar_por_id(id_bd)

        self.assertIsNotNone(recuperado)
        self.assertEqual(recuperado.nombre, "Teclado Mecanico")
        self.assertAlmostEqual(recuperado.precio, 1200.0)
        self.assertEqual(recuperado.stock, 8)
        self.assertEqual(recuperado.id, id_bd)

    def test_buscar_id_inexistente_retorna_none(self):
        """buscar_por_id() retorna None cuando el ID no existe."""
        resultado = self.dao.buscar_por_id(99999)
        self.assertIsNone(resultado)

    def test_listar_todos_vacio(self):
        """listar_todos() retorna lista vacia si no hay productos."""
        productos = self.dao.listar_todos()
        self.assertEqual(productos, [])

    def test_listar_todos_con_datos(self):
        """listar_todos() retorna todos los productos insertados."""
        self.dao.guardar(Producto("Producto A", 100.0, 1))
        self.dao.guardar(Producto("Producto B", 200.0, 2))
        self.dao.guardar(Producto("Producto C", 300.0, 3))

        todos = self.dao.listar_todos()
        self.assertEqual(len(todos), 3)

    def test_actualizar_producto_existente(self):
        """actualizar() persiste los cambios en precio y stock."""
        p = Producto("Silla Gamer", 3500.0, 4)
        id_bd = self.dao.guardar(p)

        recuperado = self.dao.buscar_por_id(id_bd)
        recuperado.precio = 3200.0
        recuperado.stock = 6

        actualizado = self.dao.actualizar(recuperado)
        self.assertTrue(actualizado)

        verificado = self.dao.buscar_por_id(id_bd)
        self.assertAlmostEqual(verificado.precio, 3200.0)
        self.assertEqual(verificado.stock, 6)

    def test_actualizar_id_inexistente_retorna_false(self):
        """actualizar() retorna False cuando el ID no existe."""
        p = Producto.__new__(Producto)
        p._nombre = "Fantasma"
        p._precio = 100.0
        p._Producto__stock = 0
        p._Producto__id = 99999

        resultado = self.dao.actualizar(p)
        self.assertFalse(resultado)

    def test_eliminar_producto_existente(self):
        """eliminar() retorna True y el producto deja de existir en BD."""
        p = Producto("Temporal", 50.0, 1)
        id_bd = self.dao.guardar(p)

        eliminado = self.dao.eliminar(id_bd)
        self.assertTrue(eliminado)
        self.assertIsNone(self.dao.buscar_por_id(id_bd))

    def test_eliminar_id_inexistente_retorna_false(self):
        """eliminar() retorna False cuando el ID no existe."""
        resultado = self.dao.eliminar(99999)
        self.assertFalse(resultado)


if __name__ == "__main__":
    unittest.main(verbosity=2)
