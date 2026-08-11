"""
Ejercicio 1: Clase base con constructores, atributos privados y métodos.
"""


class Producto:
    """
    Clase que representa un producto en un inventario.
    Demuestra el uso de atributos privados, constructor y métodos.
    """

    # Atributo de clase (compartido por todas las instancias)
    _contador_productos: int = 0

    def __init__(self, nombre: str, precio: float, stock: int = 0) -> None:
        """
        Constructor de la clase Producto.

        Args:
            nombre  (str):   Nombre del producto.
            precio  (float): Precio unitario del producto.
            stock   (int):   Cantidad disponible (por defecto 0).
        """
        # Atributos privados (convención con doble guion bajo => name mangling)
        self.__nombre: str = nombre
        self.__precio: float = precio
        self.__stock: int = stock

        # Incrementar el contador de productos creados
        Producto._contador_productos += 1
        self.__id: int = Producto._contador_productos

    # ------------------------------------------------------------------ #
    #  Getters (accesores)                                                 #
    # ------------------------------------------------------------------ #

    def get_nombre(self) -> str:
        """Retorna el nombre del producto."""
        return self.__nombre

    def get_precio(self) -> float:
        """Retorna el precio del producto."""
        return self.__precio

    def get_stock(self) -> int:
        """Retorna el stock disponible del producto."""
        return self.__stock

    def get_id(self) -> int:
        """Retorna el ID único del producto."""
        return self.__id

    # ------------------------------------------------------------------ #
    #  Setters (mutadores) con validación                                  #
    # ------------------------------------------------------------------ #

    def set_nombre(self, nuevo_nombre: str) -> None:
        """
        Actualiza el nombre del producto.

        Args:
            nuevo_nombre (str): El nuevo nombre a asignar.

        Raises:
            ValueError: Si el nombre está vacío.
        """
        if not nuevo_nombre.strip():
            raise ValueError("El nombre del producto no puede estar vacío.")
        self.__nombre = nuevo_nombre.strip()

    def set_precio(self, nuevo_precio: float) -> None:
        """
        Actualiza el precio del producto.

        Args:
            nuevo_precio (float): El nuevo precio a asignar.

        Raises:
            ValueError: Si el precio es negativo.
        """
        if nuevo_precio < 0:
            raise ValueError(f"El precio no puede ser negativo: {nuevo_precio}")
        self.__precio = nuevo_precio

    def set_stock(self, cantidad: int) -> None:
        """
        Actualiza el stock del producto.

        Args:
            cantidad (int): Nueva cantidad en stock.

        Raises:
            ValueError: Si la cantidad es negativa.
        """
        if cantidad < 0:
            raise ValueError(f"El stock no puede ser negativo: {cantidad}")
        self.__stock = cantidad

    # ------------------------------------------------------------------ #
    #  Métodos de negocio                                                  #
    # ------------------------------------------------------------------ #

    def agregar_stock(self, cantidad: int) -> None:
        """
        Incrementa el stock del producto.

        Args:
            cantidad (int): Cantidad a agregar.
        """
        if cantidad <= 0:
            raise ValueError("La cantidad a agregar debe ser mayor a cero.")
        self.__stock += cantidad
        print(f"[+] Stock de '{self.__nombre}' actualizado: {self.__stock} unidades.")

    def vender(self, cantidad: int) -> float:
        """
        Realiza una venta del producto y retorna el total.

        Args:
            cantidad (int): Cantidad de unidades a vender.

        Returns:
            float: Total de la venta.

        Raises:
            ValueError: Si no hay suficiente stock.
        """
        if cantidad <= 0:
            raise ValueError("La cantidad a vender debe ser mayor a cero.")
        if cantidad > self.__stock:
            raise ValueError(
                f"Stock insuficiente. Disponible: {self.__stock}, solicitado: {cantidad}"
            )
        self.__stock -= cantidad
        total = cantidad * self.__precio
        print(f"[✓] Venta exitosa: {cantidad}x '{self.__nombre}' = ${total:.2f}")
        return total

    def calcular_valor_inventario(self) -> float:
        """Calcula el valor total del inventario de este producto."""
        return self.__stock * self.__precio

    # ------------------------------------------------------------------ #
    #  Métodos especiales (dunder methods)                                 #
    # ------------------------------------------------------------------ #

    def __str__(self) -> str:
        """Representación legible del producto."""
        return (
            f"Producto [ID={self.__id}] | "
            f"Nombre: {self.__nombre} | "
            f"Precio: ${self.__precio:.2f} | "
            f"Stock: {self.__stock}"
        )

    def __repr__(self) -> str:
        """Representación técnica del producto."""
        return (
            f"Producto(nombre={self.__nombre!r}, "
            f"precio={self.__precio}, stock={self.__stock})"
        )

    def __eq__(self, otro: object) -> bool:
        """Compara dos productos por su ID."""
        if not isinstance(otro, Producto):
            return NotImplemented
        return self.__id == otro.__id

    # ------------------------------------------------------------------ #
    #  Método de clase                                                     #
    # ------------------------------------------------------------------ #

    @classmethod
    def total_productos_creados(cls) -> int:
        """Retorna el total de instancias de Producto creadas."""
        return cls._contador_productos
