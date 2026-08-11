"""
servicio.py

Lógica de negocio del Sistema de Inventario.

Coordina las operaciones entre la capa de acceso a datos (ProductoDAO) y las
reglas del dominio. No contiene SQL ni conoce detalles de la base de datos.

El método vender() lanza tres excepciones distintas según el error detectado:
    ValueError               si la cantidad solicitada es menor o igual a cero
    ProductoNoEncontradoError si el ID del producto no existe en la base de datos
    StockInsuficienteError   si la cantidad solicitada supera el stock disponible
"""

from src.dao import ProductoDAO
from src.modelo import Producto
from src.excepciones import StockInsuficienteError, ProductoNoEncontradoError


class InventarioService:
    """
    Servicio de lógica de negocio para operaciones de inventario.

    Recibe un ProductoDAO mediante inyección de dependencias, lo que permite
    sustituirlo en pruebas sin modificar este módulo.

    Args:
        dao (ProductoDAO): Instancia del DAO a utilizar.
    """

    def __init__(self, dao: ProductoDAO) -> None:
        self._dao = dao

    def vender(self, id_producto: int, cantidad: int) -> float:
        """
        Ejecuta una venta: valida la solicitud, descuenta el stock y persiste el cambio.

        Args:
            id_producto (int): ID del producto a vender.
            cantidad    (int): Número de unidades a vender.

        Returns:
            float: Total de la venta (precio unitario por cantidad).

        Raises:
            ValueError:               Si cantidad es menor o igual a cero.
            ProductoNoEncontradoError: Si no existe un producto con ese ID.
            StockInsuficienteError:   Si la cantidad supera el stock disponible.
        """
        if cantidad <= 0:
            raise ValueError(
                f"La cantidad a vender debe ser mayor a 0. Se recibió: {cantidad}"
            )

        producto = self._dao.buscar_por_id(id_producto)
        if producto is None:
            raise ProductoNoEncontradoError(id_producto)

        if cantidad > producto.stock:
            raise StockInsuficienteError(
                stock_disponible=producto.stock,
                cantidad_pedida=cantidad
            )

        producto.stock -= cantidad
        self._dao.actualizar(producto)

        total = cantidad * producto.precio
        print(f"Venta exitosa: {cantidad}x '{producto.nombre}' = ${total:.2f}")
        return total

    def reabastecer(self, id_producto: int, cantidad: int) -> None:
        """
        Aumenta el stock de un producto existente.

        Args:
            id_producto (int): ID del producto a reabastecer.
            cantidad    (int): Unidades a agregar al stock.

        Raises:
            ValueError:               Si cantidad es menor o igual a cero.
            ProductoNoEncontradoError: Si no existe un producto con ese ID.
        """
        if cantidad <= 0:
            raise ValueError(
                f"La cantidad a reabastecer debe ser mayor a 0. Se recibió: {cantidad}"
            )

        producto = self._dao.buscar_por_id(id_producto)
        if producto is None:
            raise ProductoNoEncontradoError(id_producto)

        producto.stock += cantidad
        self._dao.actualizar(producto)
        print(f"Reabastecimiento: '{producto.nombre}' ahora tiene {producto.stock} uds.")

    def registrar_producto(self, nombre: str, precio: float, stock: int = 0) -> Producto:
        """
        Crea un producto y lo persiste en la base de datos.

        Args:
            nombre (str):   Nombre del producto.
            precio (float): Precio unitario. Debe ser mayor a cero.
            stock  (int):   Stock inicial. Por defecto 0.

        Returns:
            Producto: El objeto creado con el ID asignado por la base de datos.

        Raises:
            PrecioInvalidoError: Si precio es menor o igual a cero.
            ValueError:         Si el nombre está vacío o el stock es negativo.
        """
        producto = Producto(nombre, precio, stock)
        id_bd = self._dao.guardar(producto)
        producto._Producto__id = id_bd
        print(f"Producto registrado: {producto.describir()}")
        return producto

    def listar_productos(self) -> list[Producto]:
        """
        Retorna todos los productos del inventario.

        Returns:
            list[Producto]: Lista de productos. Puede estar vacía.
        """
        return self._dao.listar_todos()
