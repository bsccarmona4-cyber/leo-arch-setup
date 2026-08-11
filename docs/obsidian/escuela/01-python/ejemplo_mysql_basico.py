"""
  ¿Qué es MySQL?
  ---------------
  MySQL es un "servidor de base de datos": un programa que corre
  en tu computadora (o en otra) y espera a que otros programas
  (clientes) le pidan guardar, leer, cambiar o borrar datos.

  ¿Qué necesitas tener instalado?
  --------------------------------
  1. MySQL Server corriendo en tu computadora
     (puedes usar XAMPP, WAMP, o instalar MySQL directamente)
  2. El conector de Python para MySQL:
         pip install mysql-connector-python

  CONCEPTO CLIENTE ↔ SERVIDOR:
  ┌─────────────┐                    ┌──────────────────┐
  │   CLIENTE    │  ── consulta ──>  │  SERVIDOR MySQL  │
  │ (este script │                    │  (puerto 3306)   │
  │  en Python)  │  <── respuesta ── │                   │
  └─────────────┘                    └──────────────────┘

  Tu script (cliente) se conecta al servidor MySQL por red
  (normalmente localhost:3306) y le envía comandos SQL.

==========================================================================
"""

# =============================================
# PASO 0: Importar el conector de MySQL
# =============================================
# Este módulo permite que Python "hable" con el servidor MySQL.
# Si te da error aquí, instálalo con: pip install mysql-connector-python
import mysql.connector

print("=" * 60)
print("  EJEMPLO DE MySQL - CRUD COMPLETO")
print("  (Crear, Leer, Actualizar, Borrar)")
print("=" * 60)


# =============================================
# PASO 1: CONECTARSE AL SERVIDOR MySQL
# =============================================
# Esto es como "tocar la puerta" del servidor para que nos deje entrar.
# Necesitas poner TUS datos reales de MySQL:
#   - host:     dónde está el servidor (localhost = tu propia compu)
#   - user:     tu usuario de MySQL (por defecto es "root")
#   - password: tu contraseña de MySQL (en XAMPP suele ser "" vacía)

conexion = mysql.connector.connect(
    host="localhost",        # dirección del servidor
    user="leo",              # tu usuario de MySQL
    password="leo123",       # tu contraseña (cámbiala si tienes una)
)

print("\n✅ Paso 1: Conectado al servidor MySQL")

# El "cursor" es como un mensajero: lleva nuestras órdenes (SQL)
# al servidor MySQL y nos trae las respuestas.
cursor = conexion.cursor()


# =============================================
# PASO 1.5: CREAR Y SELECCIONAR LA BASE DE DATOS
# =============================================
# En MySQL primero necesitas crear una "base de datos" (un contenedor
# donde vivirán tus tablas). Es como crear una carpeta para tus archivos.

# IF NOT EXISTS = "solo créala si no existe ya" (evita errores)
cursor.execute("CREATE DATABASE IF NOT EXISTS escuela_ejemplo")
print("✅ Paso 1.5: Base de datos 'escuela_ejemplo' lista")

# USE = "a partir de ahora, trabaja dentro de esta base de datos"
cursor.execute("USE escuela_ejemplo")


# =============================================
# PASO 2: CREAR UNA TABLA (CREATE TABLE)
# =============================================
# Una tabla es como una hoja de Excel con columnas definidas.
# Aquí creamos una tabla llamada "estudiantes" con 4 columnas:
#   - id        → número único que identifica a cada estudiante (se genera solo)
#   - nombre    → texto con el nombre del estudiante (máximo 100 caracteres)
#   - edad      → número entero con la edad
#   - promedio  → número decimal con el promedio de calificaciones

# Primero borramos la tabla si ya existía (para empezar limpio)
cursor.execute("DROP TABLE IF EXISTS estudiantes")

cursor.execute("""
    CREATE TABLE estudiantes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        edad INT NOT NULL,
        promedio FLOAT NOT NULL
    )
""")
# AUTO_INCREMENT = el id se genera automáticamente (1, 2, 3...)
# PRIMARY KEY    = es el identificador único de cada fila
# NOT NULL       = ese campo es obligatorio, no puede estar vacío
# VARCHAR(100)   = texto de máximo 100 caracteres
# INT            = número entero
# FLOAT          = número decimal

print("✅ Paso 2: Tabla 'estudiantes' creada correctamente")


# =============================================
# PASO 3: INSERTAR DATOS (INSERT) → La "C" de CRUD (Create)
# =============================================
# INSERT INTO = "mete datos en la tabla"
# En MySQL usamos %s como "huecos" que Python rellena con los valores.
# Esto se llama "consulta parametrizada" y evita ataques de
# hackers (SQL injection). ¡NUNCA metas los valores directo en el texto!

# Insertar UN estudiante:
cursor.execute("""
    INSERT INTO estudiantes (nombre, edad, promedio)
    VALUES (%s, %s, %s)
""", ("María García", 15, 9.5))

# Insertar VARIOS estudiantes de golpe con executemany():
estudiantes_nuevos = [
    ("Carlos López", 14, 8.7),
    ("Ana Martínez", 15, 9.8),
    ("Pedro Sánchez", 16, 7.5),
    ("Luisa Ramírez", 14, 9.2),
]
cursor.executemany("""
    INSERT INTO estudiantes (nombre, edad, promedio)
    VALUES (%s, %s, %s)
""", estudiantes_nuevos)

# IMPORTANTE: después de modificar datos, hay que "guardar" con commit()
# Es como darle "Guardar" en un documento de Word.
# Sin commit(), los cambios se pierden.
conexion.commit()

print("✅ Paso 3: 5 estudiantes insertados correctamente")


# =============================================
# PASO 4: LEER DATOS (SELECT) → La "R" de CRUD (Read)
# =============================================

print("\n" + "-" * 60)
print("📖 LEER TODOS LOS ESTUDIANTES (SELECT *)")
print("-" * 60)

# SELECT * FROM estudiantes = "dame TODAS las columnas de TODOS los estudiantes"
cursor.execute("SELECT * FROM estudiantes")

# fetchall() = "tráeme TODOS los resultados"
todos = cursor.fetchall()

# Mostrar los resultados en formato bonito
print(f"{'ID':<5} {'Nombre':<20} {'Edad':<8} {'Promedio':<10}")
print("-" * 43)
for estudiante in todos:
    # Cada 'estudiante' es una tupla: (id, nombre, edad, promedio)
    print(f"{estudiante[0]:<5} {estudiante[1]:<20} {estudiante[2]:<8} {estudiante[3]:<10}")


# ----- Leer con condición (WHERE) -----
print("\n" + "-" * 60)
print("🔍 ESTUDIANTES CON PROMEDIO MAYOR A 9.0 (WHERE)")
print("-" * 60)

# WHERE promedio > 9.0 = "solo los que tienen promedio mayor a 9"
cursor.execute("SELECT nombre, promedio FROM estudiantes WHERE promedio > %s", (9.0,))

resultados = cursor.fetchall()
for nombre, promedio in resultados:
    print(f"  ⭐ {nombre} → Promedio: {promedio}")


# ----- Leer con orden (ORDER BY) -----
print("\n" + "-" * 60)
print("📊 ESTUDIANTES ORDENADOS POR PROMEDIO (ORDER BY)")
print("-" * 60)

# ORDER BY promedio DESC = "ordénalos por promedio de mayor a menor"
cursor.execute("SELECT nombre, promedio FROM estudiantes ORDER BY promedio DESC")

posicion = 1
for nombre, promedio in cursor.fetchall():
    print(f"  {posicion}° lugar: {nombre} → {promedio}")
    posicion += 1


# ----- Contar registros (COUNT) -----
cursor.execute("SELECT COUNT(*) FROM estudiantes")
total = cursor.fetchone()[0]  # fetchone() trae solo 1 resultado
print(f"\n📊 Total de estudiantes registrados: {total}")


# =============================================
# PASO 5: ACTUALIZAR DATOS (UPDATE) → La "U" de CRUD (Update)
# =============================================
print("\n" + "-" * 60)
print("✏️  ACTUALIZAR DATOS (UPDATE)")
print("-" * 60)

# Vamos a subir el promedio de Pedro Sánchez de 7.5 a 8.5
# UPDATE tabla SET columna = nuevo_valor WHERE condición
cursor.execute("""
    UPDATE estudiantes
    SET promedio = %s
    WHERE nombre = %s
""", (8.5, "Pedro Sánchez"))

conexion.commit()  # ¡No olvides guardar!

# Verificamos que sí cambió:
cursor.execute("SELECT nombre, promedio FROM estudiantes WHERE nombre = %s", ("Pedro Sánchez",))
pedro = cursor.fetchone()
print(f"  Pedro Sánchez ahora tiene promedio: {pedro[1]}  (antes era 7.5)")


# =============================================
# PASO 6: BORRAR DATOS (DELETE) → La "D" de CRUD (Delete)
# =============================================
print("\n" + "-" * 60)
print("🗑️  BORRAR UN ESTUDIANTE (DELETE)")
print("-" * 60)

# Borramos a Carlos López de la tabla
# DELETE FROM tabla WHERE condición
cursor.execute("DELETE FROM estudiantes WHERE nombre = %s", ("Carlos López",))
conexion.commit()

print("  Carlos López fue eliminado de la base de datos")

# Verificamos cuántos quedan:
cursor.execute("SELECT COUNT(*) FROM estudiantes")
total = cursor.fetchone()[0]
print(f"  Estudiantes restantes: {total}")


# =============================================
# PASO 7: MOSTRAR EL ESTADO FINAL
# =============================================
print("\n" + "=" * 60)
print("📋 ESTADO FINAL DE LA TABLA")
print("=" * 60)

cursor.execute("SELECT * FROM estudiantes ORDER BY id")
print(f"{'ID':<5} {'Nombre':<20} {'Edad':<8} {'Promedio':<10}")
print("-" * 43)
for est in cursor.fetchall():
    print(f"{est[0]:<5} {est[1]:<20} {est[2]:<8} {est[3]:<10}")


# =============================================
# PASO 8: CERRAR LA CONEXIÓN
# =============================================
# Siempre cierra la conexión cuando termines.
# Es como cerrar la llave del agua cuando dejas de usarla.
# Si no la cierras, el servidor se queda esperando y desperdicias recursos.
cursor.close()
conexion.close()
print("\n✅ Conexión cerrada correctamente. ¡Programa terminado!")


"""
==========================================================================
  RESUMEN RÁPIDO DE SQL (la "receta" para hablar con MySQL)
==========================================================================

  CREAR base:      CREATE DATABASE nombre
  USAR base:       USE nombre
  CREAR tabla:     CREATE TABLE nombre (columnas...)
  INSERTAR datos:  INSERT INTO tabla (columnas) VALUES (%s, %s, ...)
  LEER datos:      SELECT columnas FROM tabla WHERE condición
  ACTUALIZAR:      UPDATE tabla SET columna = %s WHERE condición
  BORRAR:          DELETE FROM tabla WHERE condición

  Palabras extra útiles:
    ORDER BY columna ASC/DESC  → ordenar resultados
    COUNT(*)                   → contar cuántos hay
    LIMIT n                    → traer solo n resultados
    LIKE '%texto%'             → buscar texto parcial
    JOIN                       → unir dos tablas

  Tipos de datos comunes en MySQL:
    INT           → número entero
    FLOAT/DOUBLE  → número decimal
    VARCHAR(n)    → texto de máximo n caracteres
    TEXT          → texto largo (sin límite práctico)
    DATE          → fecha (YYYY-MM-DD)
    DATETIME      → fecha y hora
    BOOLEAN       → verdadero o falso (0 o 1)

==========================================================================

  ANTES DE EJECUTAR ESTE SCRIPT:
  1. Asegúrate de que MySQL esté corriendo (abre XAMPP y dale "Start" a MySQL)
  2. Instala el conector:  pip install mysql-connector-python
  3. Cambia el usuario y contraseña en el PASO 1 si es necesario

==========================================================================
"""


