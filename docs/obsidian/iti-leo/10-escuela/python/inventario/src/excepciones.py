"""
excepciones.py

Jerarquía de excepciones del Sistema de Inventario:

    Exception
        StockInsuficienteError    -- se lanza cuando el stock es insuficiente para una venta
        ProductoNoEncontradoError -- se lanza cuando no existe un producto con el ID buscado
    ValueError
        PrecioInvalidoError       -- se lanza cuando el precio recibido es menor o igual a cero

La diferencia entre Error y Exception en Python:
    Error   (SyntaxError, MemoryError) son problemas del intérprete o del sistema
            que el programador no puede controlar en tiempo de ejecución.
    Exception son situaciones controlables que el programador decide cómo manejar
            mediante bloques try-except.
"""


class StockInsuficienteError(Exception):
    """
    Se lanza cuando se intenta vender más unidades de las disponibles en stock.

    Atributos:
        stock_disponible (int): Unidades disponibles al momento de la venta.
        cantidad_pedida  (int): Unidades solicitadas en la venta.
    """

    def __init__(self, stock_disponible: int, cantidad_pedida: int) -> None:
        self.stock_disponible = stock_disponible
        self.cantidad_pedida = cantidad_pedida
        mensaje = (
            f"Stock insuficiente: se pidieron {cantidad_pedida} unidades "
            f"pero solo hay {stock_disponible} disponibles."
        )
        super().__init__(mensaje)


class ProductoNoEncontradoError(Exception):
    """
    Se lanza cuando se busca un producto por ID y no existe en la base de datos.

    Atributos:
        id_producto (int): El ID que no fue encontrado.
    """

    def __init__(self, id_producto: int) -> None:
        self.id_producto = id_producto
        super().__init__(f"No existe ningún producto con ID={id_producto}.")


class PrecioInvalidoError(ValueError):
    """
    Se lanza cuando el precio de un producto es menor o igual a cero.

    Hereda de ValueError para mantener compatibilidad con código que captura
    ValueError de forma genérica, además de poder capturarse de forma específica.

    Atributos:
        precio (float): El valor inválido recibido.
    """

    def __init__(self, precio: float) -> None:
        self.precio = precio
        super().__init__(f"El precio debe ser mayor a 0. Se recibió: {precio}")
