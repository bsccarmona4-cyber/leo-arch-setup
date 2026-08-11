"""
test_servicio.py

Pruebas unitarias de InventarioService.

Cubre los tres tipos de error que puede lanzar vender():
    ValueError               cuando la cantidad es menor o igual a cero
    ProductoNoEncontradoError cuando el ID no existe en la base de datos
    StockInsuficienteError   cuando la cantidad supera el stock disponible

Tambien incluye los tres casos exactos que el profesor solicitara en la demo.
"""

import unittest
import tempfile
import os
from src.db import inicializar_bd
from src.dao import ProductoDAO
from src.servicio import InventarioService
from src.excepciones import StockInsuficienteError, ProductoNoEncontradoError


class TestInventarioServiceVender(unittest.TestCase):
    """Pruebas del metodo vender()."""

    def setUp(self):
        """Crea base de datos temporal, DAO, servicio y producto inicial con stock 3."""
        self._db_fd, self._db_path = tempfile.mkstemp(suffix=".db")
        os.close(self._db_fd)
        inicializar_bd(self._db_path)
        self.dao = ProductoDAO(self._db_path)
        self.servicio = InventarioService(self.dao)
        self.id_producto = self.servicio.registrar_producto("USB Hub", 250.0, 3)._Producto__id

    def tearDown(self):
        try:
            os.unlink(self._db_path)
        except OSError:
            pass

    def test_vender_exitoso_descuenta_stock(self):
        """Vender 2 unidades con stock 3 retorna 500.0 y deja stock en 1."""
        total = self.servicio.vender(self.id_producto, 2)

        self.assertAlmostEqual(total, 500.0)
        producto_bd = self.dao.buscar_por_id(self.id_producto)
        self.assertEqual(producto_bd.stock, 1)

    def test_vender_todo_el_stock(self):
        """Vender exactamente las unidades disponibles deja el stock en cero."""
        total = self.servicio.vender(self.id_producto, 3)

        self.assertAlmostEqual(total, 750.0)
        producto_bd = self.dao.buscar_por_id(self.id_producto)
        self.assertEqual(producto_bd.stock, 0)

    def test_vender_cantidad_cero_lanza_ValueError(self):
        """Vender 0 unidades lanza ValueError sin consultar la base de datos."""
        with self.assertRaises(ValueError) as ctx:
            self.servicio.vender(self.id_producto, 0)
        self.assertIn("mayor a 0", str(ctx.exception))

    def test_vender_cantidad_negativa_lanza_ValueError(self):
        """Cantidad negativa tambien lanza ValueError."""
        with self.assertRaises(ValueError):
            self.servicio.vender(self.id_producto, -5)

    def test_vender_id_inexistente_lanza_excepcion(self):
        """ID que no existe en la base de datos lanza ProductoNoEncontradoError."""
        with self.assertRaises(ProductoNoEncontradoError) as ctx:
            self.servicio.vender(99999, 1)
        self.assertEqual(ctx.exception.id_producto, 99999)

    def test_vender_mas_stock_disponible_lanza_excepcion(self):
        """Vender mas del stock disponible lanza StockInsuficienteError sin modificar BD."""
        with self.assertRaises(StockInsuficienteError) as ctx:
            self.servicio.vender(self.id_producto, 10)

        exc = ctx.exception
        self.assertEqual(exc.stock_disponible, 3)
        self.assertEqual(exc.cantidad_pedida, 10)
        self.assertIn("10", str(exc))
        self.assertIn("3", str(exc))

        producto_bd = self.dao.buscar_por_id(self.id_producto)
        self.assertEqual(producto_bd.stock, 3)

    def test_vender_una_mas_del_stock_lanza_excepcion(self):
        """Vender una unidad mas del stock disponible tambien lanza StockInsuficienteError."""
        with self.assertRaises(StockInsuficienteError):
            self.servicio.vender(self.id_producto, 4)


class TestInventarioServiceReabastecer(unittest.TestCase):
    """Pruebas del metodo reabastecer()."""

    def setUp(self):
        self._db_fd, self._db_path = tempfile.mkstemp(suffix=".db")
        os.close(self._db_fd)
        inicializar_bd(self._db_path)
        self.dao = ProductoDAO(self._db_path)
        self.servicio = InventarioService(self.dao)
        self.id_producto = self.servicio.registrar_producto("Monitor", 3500.0, 5)._Producto__id

    def tearDown(self):
        try:
            os.unlink(self._db_path)
        except OSError:
            pass

    def test_reabastecer_aumenta_stock(self):
        """reabastecer() suma correctamente las unidades al stock existente."""
        self.servicio.reabastecer(self.id_producto, 10)
        producto = self.dao.buscar_por_id(self.id_producto)
        self.assertEqual(producto.stock, 15)

    def test_reabastecer_cantidad_invalida_lanza_ValueError(self):
        """Cantidad menor o igual a cero lanza ValueError."""
        with self.assertRaises(ValueError):
            self.servicio.reabastecer(self.id_producto, 0)

    def test_reabastecer_id_inexistente_lanza_excepcion(self):
        """ID inexistente lanza ProductoNoEncontradoError."""
        with self.assertRaises(ProductoNoEncontradoError):
            self.servicio.reabastecer(99999, 5)


class TestCasosProfesor(unittest.TestCase):
    """Los tres casos exactos que el profesor solicitara en la demo."""

    def setUp(self):
        self._db_fd, self._db_path = tempfile.mkstemp(suffix=".db")
        os.close(self._db_fd)
        inicializar_bd(self._db_path)
        self.dao = ProductoDAO(self._db_path)
        self.servicio = InventarioService(self.dao)

    def tearDown(self):
        try:
            os.unlink(self._db_path)
        except OSError:
            pass

    def test_caso_1_precio_negativo(self):
        """Producto con precio negativo lanza PrecioInvalidoError."""
        from src.excepciones import PrecioInvalidoError
        with self.assertRaises(PrecioInvalidoError):
            self.servicio.registrar_producto("Mouse", -50, 5)

    def test_caso_2_vender_mas_del_stock(self):
        """Vender 10 unidades con stock 3 lanza StockInsuficienteError."""
        id_p = self.servicio.registrar_producto("Producto Demo", 100.0, 3)._Producto__id
        with self.assertRaises(StockInsuficienteError):
            self.servicio.vender(id_p, 10)

    def test_caso_3_sqlite_local_sin_internet(self):
        """SQLite no requiere conexion a internet. La operacion completa sin errores."""
        id_p = self.servicio.registrar_producto("Articulo Local", 200.0, 5)._Producto__id
        total = self.servicio.vender(id_p, 2)
        self.assertAlmostEqual(total, 400.0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
