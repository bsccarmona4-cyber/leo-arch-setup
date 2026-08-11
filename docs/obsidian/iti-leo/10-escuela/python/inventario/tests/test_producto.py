"""
test_producto.py

Pruebas unitarias de la clase Producto.

Cubre creacion con datos validos, rechazo de precios y stocks invalidos,
comportamiento de los setters con validacion, y metodos especiales.
"""

import unittest
from src.modelo import Producto
from src.excepciones import PrecioInvalidoError


class TestProductoCreacion(unittest.TestCase):
    """Pruebas de creacion y validacion de objetos Producto."""

    def test_producto_valido_con_stock(self):
        """Producto creado con datos correctos almacena todos los atributos."""
        p = Producto("Teclado", 450.0, 10)
        self.assertEqual(p.nombre, "Teclado")
        self.assertEqual(p.precio, 450.0)
        self.assertEqual(p.stock, 10)
        self.assertIsInstance(p.id, int)
        self.assertGreater(p.id, 0)

    def test_producto_valido_sin_stock(self):
        """El stock por defecto es cero cuando no se especifica."""
        p = Producto("Monitor", 3500.0)
        self.assertEqual(p.stock, 0)

    def test_producto_precio_minimo_valido(self):
        """Un precio de 0.01 es valido (mayor que cero)."""
        p = Producto("Clip", 0.01, 100)
        self.assertEqual(p.precio, 0.01)

    def test_precio_negativo_lanza_excepcion(self):
        """Precio negativo lanza PrecioInvalidoError."""
        with self.assertRaises(PrecioInvalidoError) as ctx:
            Producto("Mouse", -50, 5)
        self.assertIn("-50", str(ctx.exception))

    def test_precio_cero_lanza_excepcion(self):
        """El precio debe ser estrictamente mayor a cero."""
        with self.assertRaises(PrecioInvalidoError):
            Producto("Borrador", 0, 20)

    def test_precio_invalido_es_tambien_ValueError(self):
        """PrecioInvalidoError hereda de ValueError."""
        with self.assertRaises(ValueError):
            Producto("Goma", -1, 0)

    def test_stock_negativo_lanza_ValueError(self):
        """Stock negativo no esta permitido."""
        with self.assertRaises(ValueError):
            Producto("Pluma", 5.0, -1)

    def test_stock_flotante_lanza_ValueError(self):
        """El stock debe ser un entero, no un numero flotante."""
        with self.assertRaises(ValueError):
            Producto("Pluma", 5.0, 2.5)  # type: ignore

    def test_nombre_vacio_lanza_ValueError(self):
        """Nombre vacio no esta permitido."""
        with self.assertRaises(ValueError):
            Producto("", 10.0, 5)

    def test_nombre_solo_espacios_lanza_ValueError(self):
        """Nombre compuesto solo de espacios no esta permitido."""
        with self.assertRaises(ValueError):
            Producto("   ", 10.0, 5)


class TestProductoSetters(unittest.TestCase):
    """Pruebas de los setters definidos con @property."""

    def setUp(self):
        """Crea un producto de prueba antes de cada test."""
        self.producto = Producto("Audifonos", 800.0, 15)

    def test_setter_precio_valido(self):
        """Asignar un precio valido actualiza el atributo."""
        self.producto.precio = 950.0
        self.assertEqual(self.producto.precio, 950.0)

    def test_setter_precio_negativo_lanza_excepcion(self):
        """El setter rechaza precios negativos."""
        with self.assertRaises(PrecioInvalidoError):
            self.producto.precio = -100

    def test_setter_stock_valido(self):
        """Asignar un stock valido actualiza el atributo."""
        self.producto.stock = 50
        self.assertEqual(self.producto.stock, 50)

    def test_setter_stock_negativo_lanza_ValueError(self):
        """El setter rechaza stock negativo."""
        with self.assertRaises(ValueError):
            self.producto.stock = -5

    def test_id_es_inmutable(self):
        """El ID no tiene setter; intentar asignarlo lanza AttributeError."""
        with self.assertRaises(AttributeError):
            self.producto.id = 999  # type: ignore


class TestProductoMetodosEspeciales(unittest.TestCase):
    """Pruebas de __str__, __eq__ y metodo de clase."""

    def test_str_contiene_nombre(self):
        """La representacion en cadena incluye el nombre del producto."""
        p = Producto("Webcam", 1200.0, 5)
        self.assertIn("Webcam", str(p))

    def test_igualdad_por_id(self):
        """Dos objetos con el mismo ID se consideran iguales."""
        p1 = Producto("Producto A", 100.0, 1)
        p2 = Producto.__new__(Producto)
        p2._nombre = "Producto A"
        p2._precio = 100.0
        p2._Producto__stock = 1
        p2._Producto__id = p1.id
        self.assertEqual(p1, p2)

    def test_total_creados_incrementa(self):
        """total_creados() retorna un valor mayor despues de crear una instancia."""
        antes = Producto.total_creados()
        Producto("Temporal", 1.0, 0)
        self.assertEqual(Producto.total_creados(), antes + 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
