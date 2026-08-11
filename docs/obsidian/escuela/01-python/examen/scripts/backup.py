import os
import shutil
from datetime import datetime

# Defino las rutas necesarias para el respaldo
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "cafeteria.db")
BACKUP_DIR = os.path.join(BASE_DIR, "backups")


def realizar_respaldo():
    """Genero una copia de seguridad de la base de datos con marca de tiempo."""
    if not os.path.exists(DB_PATH):
        print("No encontré la base de datos para respaldar.")
        return False

    # Creo la carpeta de respaldos si no existe
    os.makedirs(BACKUP_DIR, exist_ok=True)

    # Genero el nombre del archivo con la fecha y hora actual
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre_respaldo = f"cafeteria_backup_{timestamp}.db"
    ruta_respaldo = os.path.join(BACKUP_DIR, nombre_respaldo)

    try:
        shutil.copy2(DB_PATH, ruta_respaldo)
        tamano = os.path.getsize(ruta_respaldo)
        print(f"Respaldo creado: {nombre_respaldo}")
        print(f"Tamaño: {tamano / 1024:.2f} KB")
        print(f"Ubicación: {ruta_respaldo}")
        return True
    except Exception as e:
        print(f"No pude crear el respaldo: {e}")
        return False


def limpiar_respaldos_antiguos(max_respaldos=10):
    """Mantengo solo los respaldos más recientes, eliminando los más antiguos."""
    if not os.path.exists(BACKUP_DIR):
        return

    respaldos = sorted([
        f for f in os.listdir(BACKUP_DIR)
        if f.startswith("cafeteria_backup_") and f.endswith(".db")
    ])

    if len(respaldos) > max_respaldos:
        for respaldo in respaldos[:-max_respaldos]:
            ruta = os.path.join(BACKUP_DIR, respaldo)
            os.remove(ruta)
            print(f"Respaldo antiguo eliminado: {respaldo}")


if __name__ == "__main__":
    print("Iniciando respaldo de la base de datos...")
    print("-" * 40)
    exito = realizar_respaldo()
    if exito:
        limpiar_respaldos_antiguos()
        print("-" * 40)
        print("Proceso de respaldo completado.")
    else:
        print("El respaldo no se completó correctamente.")
        exit(1)
