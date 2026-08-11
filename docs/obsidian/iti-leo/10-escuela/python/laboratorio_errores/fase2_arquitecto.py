"""
FASE 2: TALLER DE MECANISMOS - SALA B
Dev 4 - El Arquitecto: Creación y Lanzamiento de Excepciones Personalizadas

Permite definir errores con significado del dominio de negocio (Domain Exceptions).
Heredar de `Exception` asegura integración nativa con el sistema de manejo de excepciones de Python.
"""

class SaldoInsuficienteError(Exception):
    """
    Excepción personalizada lanzada cuando un retiro supera el saldo disponible.
    """
    def __init__(self, saldo, monto):
        self.saldo = saldo
        self.monto = monto
        mensaje = f"Saldo actual (${saldo:.2f}) insuficiente para retirar ${monto:.2f}"
        super().__init__(mensaje)


def retirar(saldo, monto):
    """
    Realiza un retiro de saldo. Lanza SaldoInsuficienteError si el monto es mayor al saldo disponible.
    """
    if monto <= 0:
        raise ValueError("El monto a retirar debe ser mayor a cero.")
    if monto > saldo:
        raise SaldoInsuficienteError(saldo, monto)
    return saldo - monto


if __name__ == "__main__":
    print("=== DEMOSTRACIÓN DEV 4 (EL ARQUITECTO) ===")
    
    saldo_actual = 500.0
    print(f"Saldo Inicial: ${saldo_actual}")

    # Intentar retiro válido
    monto_1 = 200.0
    print(f"\nIntentando retirar ${monto_1}...")
    saldo_actual = retirar(saldo_actual, monto_1)
    print(f"Retiro exitoso. Saldo restante: ${saldo_actual}")

    # Intentar retiro excesivo (Lanza Excepción Personalizada)
    monto_2 = 400.0
    print(f"\nIntentando retirar ${monto_2}...")
    try:
        saldo_actual = retirar(saldo_actual, monto_2)
    except SaldoInsuficienteError as e:
        print(f"[EXCEPCIÓN DE NEGOCIO CAPTURADA]: {e}")
        print(f"Atributos guardados en la excepción custom -> Saldo: ${e.saldo}, Monto Intentado: ${e.monto}")
