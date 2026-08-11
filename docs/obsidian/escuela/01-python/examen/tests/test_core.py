"""
tests/test_core.py — Pruebas unitarias para módulos core.
Ejecuta con: pytest tests/ -v
"""
import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import inicializar_bd, conectar
from auth import iniciar_sesion, listar_usuarios, registrar_usuario
from productos import listar_productos, buscar_producto, listar_categorias
from clientes import listar_clientes, buscar_cliente, obtener_cliente
from lealtad import listar_promociones, consultar_puntos
from reportes import reporte_ventas_dia, resumen_general, productos_mas_vendidos
from orquestador import Orquestador, INTENCIONES


@pytest.fixture(autouse=True)
def setup_db():
    """Asegura BD inicializada antes de cada test."""
    inicializar_bd()


class TestAuth:
    def test_login_admin(self):
        empleado = iniciar_sesion("admin", "admin123")
        assert empleado is not None
        assert empleado["usuario"] == "admin"
        assert empleado["rol"] == "admin"

    def test_login_cajero(self):
        empleado = iniciar_sesion("maria", "cajero123")
        assert empleado is not None
        assert empleado["rol"] == "cajero"

    def test_login_invalido(self):
        assert iniciar_sesion("admin", "wrong") is None
        assert iniciar_sesion("noexiste", "x") is None

    def test_listar_usuarios(self):
        usuarios = listar_usuarios()
        assert len(usuarios) >= 2

    def test_cambiar_contrasena(self):
        from auth import cambiar_contrasena
        ok, msg = cambiar_contrasena(1, "admin123", "nueva123")
        assert ok
        # Restaurar
        cambiar_contrasena(1, "nueva123", "admin123")


class TestProductos:
    def test_listar(self):
        productos = listar_productos()
        assert len(productos) >= 18

    def test_buscar(self):
        resultados = buscar_producto("capuchino")
        assert len(resultados) >= 1
        assert "Capuchino" in [r["nombre"] for r in resultados]

    def test_buscar_inexistente(self):
        resultados = buscar_producto("xyznoexiste")
        assert len(resultados) == 0

    def test_categorias(self):
        cats = listar_categorias()
        assert "Café" in cats
        assert "Panadería" in cats

    def test_agregar_producto(self):
        from productos import agregar_producto
        ok, msg = agregar_producto("Test Café", "Test", 99.99, 10)
        assert ok
        busqueda = buscar_producto("Test Café")
        assert len(busqueda) >= 1


class TestClientes:
    def test_listar(self):
        clientes = listar_clientes()
        assert len(clientes) >= 3

    def test_obtener_cliente(self):
        cliente = obtener_cliente(1)
        assert cliente is not None
        assert "Carlos" in cliente["nombre"]

    def test_buscar(self):
        resultados = buscar_cliente("carlos")
        assert len(resultados) >= 1

    def test_registrar(self):
        from clientes import registrar_cliente
        ok, msg = registrar_cliente("Test Cliente", "555000", "test@test.com")
        assert ok


class TestLealtad:
    def test_promociones(self):
        promos = listar_promociones()
        assert len(promos) >= 5

    def test_puntos(self):
        saldo = consultar_puntos(1)
        assert saldo is not None
        assert "puntos_disponibles" in saldo


class TestReportes:
    def test_ventas_dia(self):
        rep = reporte_ventas_dia()
        assert "total_dia" in rep
        assert "num_ventas" in rep

    def test_resumen(self):
        res = resumen_general()
        assert "hoy" in res
        assert "total_clientes" in res

    def test_productos_mas_vendidos(self):
        top = productos_mas_vendidos(5)
        assert isinstance(top, list)


class TestOrquestador:
    def test_vender(self):
        o = Orquestador()
        cmd = o.interpretar("vender 2 capuchinos")
        assert cmd.intencion == "vender"

    def test_reportes(self):
        o = Orquestador()
        cmd = o.interpretar("reporte de ventas de hoy")
        assert cmd.intencion == "reportes"

    def test_clientes(self):
        o = Orquestador()
        cmd = o.interpretar("buscar cliente carlos")
        assert cmd.intencion == "clientes"

    def test_productos(self):
        o = Orquestador()
        cmd = o.interpretar("listar productos")
        assert cmd.intencion == "productos"

    def test_lealtad(self):
        o = Orquestador()
        cmd = o.interpretar("consultar puntos")
        assert cmd.intencion == "lealtad"

    def test_comando_directo(self):
        o = Orquestador()
        cmd = o.interpretar("/venta 2 lattes")
        assert cmd.intencion == "vender"
        assert cmd.confianza == 1.0

    def test_entidades_productos(self):
        o = Orquestador()
        cmd = o.interpretar("vender 3 lattes")
        assert "productos" in cmd.entidades
        assert len(cmd.entidades["productos"]) == 1
        assert cmd.entidades["productos"][0]["cantidad"] == 3

    def test_ayuda(self):
        o = Orquestador()
        cmd = o.interpretar("ayuda")
        assert cmd.intencion == "ayuda"

    def test_desconocido(self):
        o = Orquestador()
        cmd = o.interpretar("xyz abc def")
        assert cmd.intencion == "desconocido"

    def test_todas_las_intenciones(self):
        """Verifica que hay 7 intenciones registradas."""
        assert len(INTENCIONES) == 7
        nombres = set(INTENCIONES.keys())
        assert nombres == {"vender", "clientes", "lealtad", "productos", "reportes", "sistema", "ayuda"}


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
