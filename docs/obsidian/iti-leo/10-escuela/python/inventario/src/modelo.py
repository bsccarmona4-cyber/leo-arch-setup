"""
modelo.py

Clases del dominio del Sistema de Inventario.

Principios de Programación Orientada a Objetos aplicados:

    Abstracción   -- ItemInventario es una clase abstracta (ABC) que define
                     el contrato que toda subclase debe cumplir.
    Herencia      -- Producto hereda de ItemInventario.
    Encapsulación -- Los atributos son privados y se exponen mediante @property
                     con validaciones en los setters.
    Polimorfismo  -- El método describir() es abstracto en ItemInventario y
                     cada subclase lo implementa de forma propia.
"""

from abc import ABC, abstractmethod
from src.excepciones import PrecioInvalidoError


class ItemInventario(ABC):
    """
    Clase abstracta base para cualquier ítem del inventario.

    No puede instanciarse directamente. Toda subclase debe implementar
    el método describir().

    Args:
        nombre (str):   Nombre del ítem. No puede estar vacío.
        precio (float): Precio unitario. Debe ser mayor a cero.

    Raises:
        ValueError:         Si el nombre está vacío.
        PrecioInvalidoError: Si el precio es menor o igual a cero.
    """

    def __init__(self, nombre: str, precio: float) -> None:
        if not nombre or not nombre.strip():
            raise ValueError("El nombre no puede estar vacío.")
        if precio <= 0:
            raise PrecioInvalidoError(precio)

        self._nombre: str = nombre.strip()
        self._precio: float = precio

    @abstractmethod
    def describir(self) -> str:
        """Retorna una descripción legible del ítem."""
        ...

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(nombre={self._nombre!r}, precio={self._precio})"


class Producto(ItemInventario):
    """
    Representa un producto físico en el inventario.

    Hereda de ItemInventario e implementa el método abstracto describir().

    La encapsulación se logra con @property:
        producto.nombre         accede al nombre (solo lectura)
        producto.precio         accede al precio
        producto.precio = 500   modifica el precio con validación
        producto.stock          accede al stock
        producto.stock = 10     modifica el stock con validación
        producto.id             accede al ID (solo lectura, sin setter)

    Args:
        nombre (str):   Nombre del producto.
        precio (float): Precio unitario. Debe ser mayor a cero.
        stock  (int):   Unidades disponibles. Por defecto 0.

    Raises:
        PrecioInvalidoError: Si precio es menor o igual a cero.
        ValueError:         Si nombre vacío o stock es negativo o no es entero.
    """

    _contador: int = 0

    def __init__(self, nombre: str, precio: float, stock: int = 0) -> None:
        super().__init__(nombre, precio)

        if not isinstance(stock, int) or stock < 0:
            raise ValueError(f"El stock debe ser un entero >= 0. Se recibió: {stock}")

        self.__stock: int = stock

        Producto._contador += 1
        self.__id: int = Producto._contador

    @property
    def nombre(self) -> str:
        """Nombre del producto (solo lectura)."""
        return self._nombre

    @property
    def precio(self) -> float:
        """Precio unitario del producto."""
        return self._precio

    @precio.setter
    def precio(self, nuevo_precio: float) -> None:
        """
        Modifica el precio del producto.

        Raises:
            PrecioInvalidoError: Si el precio es menor o igual a cero.
        """
        if nuevo_precio <= 0:
            raise PrecioInvalidoError(nuevo_precio)
        self._precio = nuevo_precio

    @property
    def stock(self) -> int:
        """Unidades disponibles en inventario."""
        return self.__stock

    @stock.setter
    def stock(self, cantidad: int) -> None:
        """
        Modifica el stock del producto.

        Raises:
            ValueError: Si la cantidad es negativa o no es un entero.
        """
        if not isinstance(cantidad, int) or cantidad < 0:
            raise ValueError(f"El stock debe ser un entero >= 0. Se recibió: {cantidad}")
        self.__stock = cantidad

    @property
    def id(self) -> int:
        """ID único del producto. Solo lectura."""
        return self.__id

    def describir(self) -> str:
        """Retorna una descripción completa del producto."""
        return (
            f"[Producto ID={self.__id}] "
            f"{self._nombre} | "
            f"Precio: ${self._precio:.2f} | "
            f"Stock: {self.__stock} uds."
        )

    def __str__(self) -> str:
        return self.describir()

    def __eq__(self, otro: object) -> bool:
        """Dos productos son iguales si tienen el mismo ID."""
        if not isinstance(otro, Producto):
            return NotImplemented
        return self.__id == otro.__id

    @classmethod
    def total_creados(cls) -> int:
        """Retorna el número total de instancias de Producto creadas."""
        return cls._contador
