"""
FASE 3: RETO FINAL INTEGRADOR - CAJERO AUTOMÁTICO ROBUSTO
Participantes: Dev 1 (Clasificador), Dev 2 (Guardián), Dev 3 (Rastreador), Dev 4 (Arquitecto)

REGLA DE ORO: El programa NO puede crashear nunca.

Estructura de Trabajo y Roles:
- Dev 1: Etiqueta en comentarios el tipo de error (Sintaxis, Lógico, Excepción en tiempo de ejecución, Negocio).
- Dev 2: Controla los bloques try/except/else/finally e ingresos inválidos de usuario.
- Dev 3: Analiza la propagación en 2 niveles de llamada y registra la pila de errores con traceback/logging.
- Dev 4: Lanza la excepción personalizada SaldoInsuficienteError.
"""

import traceback
import logging

# Configuración de logging para Dev 3 (Registro de auditoría de errores)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(message)s")


# ==============================================================================
# DEV 4 (EL ARQUITECTO): EXCEPCIÓN PERSONALIZADA Y LÓGICA DE NEGOCIO
# ==============================================================================

# [Dev 1 Comentario]: Excepción de Ejecución Personalizada (Dominio de Negocio)
class SaldoInsuficienteError(Exception):
    """Excepción lanzada cuando el monto a retirar supera el saldo disponible."""
    def __init__(self, saldo, monto):
        self.saldo = saldo
        self.monto = monto
        super().__init__(f"Saldo actual (${saldo:.2f}) insuficiente para retirar ${monto:.2f}")


def retirar(saldo, monto):
    """
    Nivel 3 (Origen): Función de bajo nivel.
    Lanza excepciones si las condiciones financieras o matemáticas no se cumplen.
    """
    # [Dev 1 Comentario]: Error Lógico / Excepción de Ejecución si el monto es <= 0
    if monto <= 0:
        raise ValueError("El monto ingresado debe ser un valor positivo mayor a 0.")
    
    # [Dev 1 Comentario]: Excepción Personalizada en tiempo de ejecución (Negocio)
    if monto > saldo:
        raise SaldoInsuficienteError(saldo, monto)
        
    return saldo - monto


# ==============================================================================
# DEV 3 (EL RASTREADOR): NIVELES DE LLAMADA Y PROPAGACIÓN DE LA PILA
# ==============================================================================

def procesar_debito_cuenta(saldo, monto):
    """
    Nivel 2 (Intermedio): Propaga la excepción hacia arriba sin capturarla localmente,
    ya que este nivel no maneja interfaz de usuario ni decisiones globales.
    """
    # La excepción generada en retirar() pasa por aquí y sube al Nivel 1
    return retirar(saldo, monto)


def procesar_transaccion_cajero(saldo, monto):
    """
    Nivel 1 (Controlador Superior): Punto de entrada a las operaciones de la cuenta.
    Pasa la solicitud al Nivel 2.
    """
    return procesar_debito_cuenta(saldo, monto)


# ==============================================================================
# DEV 2 (EL GUARDIÁN) Y DEV 1 (EL CLASIFICADOR): MANEJO DE BLOQUES Y CAPTURA
# ==============================================================================

def ejecutar_operacion_cajero(saldo_actual: float, entrada_usuario: str):
    """
    Orquesta la transacción utilizando bloques try/except/else/finally.
    Garantiza que cualquier fallo sea capturado sin detener la aplicación.
    """
    nuevo_saldo = saldo_actual
    
    try:
        # [Dev 1 Comentario]: Posible Excepción ValueError si int/float falla al convertir texto
        monto = float(entrada_usuario)
        
        # Propagación de 2 niveles: Nivel 1 -> Nivel 2 -> Nivel 3 (retirar)
        nuevo_saldo = procesar_transaccion_cajero(saldo_actual, monto)
        
    # Dev 4 / Dev 1: Captura de Excepción Personalizada de Negocio
    except SaldoInsuficienteError as e:
        print(f"\n❌ [ERROR DE NEGOCIO]: {e}")
        logging.warning(f"Intento de retiro fallido: Saldo=${e.saldo}, Monto=${e.monto}")
        
    # Dev 2 / Dev 1: Captura de Excepción por Entrada Inválida (ValueError)
    except ValueError as e:
        print("\n⚠️ [ERROR DE ENTRADA]: Escribe un número válido (ej. 50, 100.50).")
        # [Dev 1 Comentario]: Se clasifica como Excepción de Ejecución generada por mala conversión de tipo.

    # Dev 2 / Dev 3: Captura Genérica de Seguridad y Registro del Stack Trace
    except Exception as e:
        print(f"\n🚨 [ERROR INESPERADO]: {e}")
        print("\n--- ANÁLISIS DE LA PILA DE ERRORES (DEV 3 - STACK TRACE) ---")
        traceback.print_exc()
        print("----------------------------------------------------------")
        
    else:
        # Dev 2: Se ejecuta únicamente si el retiro fue exitoso (sin excepciones)
        print(f"\n✅ [TRANSACCIÓN EXITOSA]: Ha retirado ${monto:.2f}.")
        print(f"💰 Nuevo Saldo Disponible: ${nuevo_saldo:.2f}")
        
    finally:
        # Dev 2: Bloque ejecutado en el 100% de los intentos
        print("ℹ️ [SISTEMA]: Gracias por usar el cajero automático.")
        
    return nuevo_saldo


def iniciar_cajero_demo():
    """
    Bucle principal interactivo/demostrativo del Cajero Automático.
    Garantiza la regla principal: EL PROGRAMA NUNCA CRASHEA.
    """
    saldo = 1000.0
    print("=" * 65)
    print("       BIENVENIDO AL CAJERO AUTOMÁTICO SEGURO (LAB IA)")
    print("=" * 65)
    
    # Pruebas automatizadas secuenciales para demostración limpia
    casos_prueba = [
        ("Ciento Cincuenta", "1. Prueba de Entrada Inválida (Texto)"),
        ("1500.00",         "2. Prueba de Saldo Insuficiente (Retiro > Saldo)"),
        ("-50.00",          "3. Prueba de Monto Negativo (Monto <= 0)"),
        ("300.00",          "4. Prueba de Transacción Exitosa")
    ]
    
    for entrada, descripcion in casos_prueba:
        print(f"\n>>> ESCENARIO: {descripcion}")
        print(f"Saldo Actual: ${saldo:.2f} | Entrada Digitada: '{entrada}'")
        saldo = ejecutar_operacion_cajero(saldo, entrada)
        print("-" * 65)

    print("\n[FIN DE LA DEMOSTRACIÓN]: Todos los escenarios fueron procesados sin ningún crash.")


if __name__ == "__main__":
    iniciar_cajero_demo()
