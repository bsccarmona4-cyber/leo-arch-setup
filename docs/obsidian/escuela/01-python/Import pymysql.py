import pymysql
from getpass import getpass

# =========================
# CONFIGURACIÓN
# =========================
# Si quieres evitar escribir la contraseña cada vez, ponla aquí:
MYSQL_PASSWORD = "lolforever.1"

# =========================
# CONEXIÓN
# =========================
if not MYSQL_PASSWORD:
    MYSQL_PASSWORD = getpass("Contraseña de MySQL para el usuario 'leo': ")

conexion = pymysql.connect(
    host="localhost",
    user="leo",
    password=MYSQL_PASSWORD,
    unix_socket="/run/mysqld/mysqld.sock"
)

cursor = conexion.cursor()

# =========================
# BASE DE DATOS
# =========================
cursor.execute("CREATE DATABASE IF NOT EXISTS escuela")
cursor.execute("USE escuela")

# =========================
# TABLA
# =========================
cursor.execute("""
CREATE TABLE IF NOT EXISTS alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    carrera VARCHAR(50)
)
""")

# =========================
# FUNCIONES CRUD
# =========================

def insertar():
    nombre = input("Nombre: ")
    carrera = input("Carrera: ")

    cursor.execute("""
    INSERT INTO alumnos(nombre, carrera)
    VALUES (%s, %s)
    """, (nombre, carrera))

    conexion.commit()
    print("✔ Alumno agregado")

def consultar():
    cursor.execute("SELECT * FROM alumnos")
    print("\n📌 LISTA DE ALUMNOS:")
    for fila in cursor.fetchall():
        print(fila)

def actualizar():
    id_alumno = input("ID del alumno a actualizar: ")
    nuevo_nombre = input("Nuevo nombre: ")
    nueva_carrera = input("Nueva carrera: ")

    cursor.execute("""
    UPDATE alumnos
    SET nombre=%s, carrera=%s
    WHERE id=%s
    """, (nuevo_nombre, nueva_carrera, id_alumno))

    conexion.commit()
    print("✔ Alumno actualizado")

def eliminar():
    id_alumno = input("ID del alumno a eliminar: ")

    cursor.execute("""
    DELETE FROM alumnos WHERE id=%s
    """, (id_alumno,))

    conexion.commit()
    print("✔ Alumno eliminado")

# =========================
# MENÚ PRINCIPAL
# =========================
while True:
    print("\n===== SISTEMA ESCOLAR (RDS SIMULADO) =====")
    print("1. Agregar alumno")
    print("2. Ver alumnos")
    print("3. Actualizar alumno")
    print("4. Eliminar alumno")
    print("5. Salir")

    opcion = input("Elige una opción: ")

    if opcion == "1":
        insertar()
    elif opcion == "2":
        consultar()
    elif opcion == "3":
        actualizar()
    elif opcion == "4":
        eliminar()
    elif opcion == "5":
        break
    else:
        print("Opción inválida")

# =========================
# CIERRE
# =========================
conexion.close()
print("Conexión cerrada")INA 