import psycopg

print("--- 1. CONFIGURANDO PARÁMETROS DE CONEXIÓN ---")
nombre_db = "leo"
usuario_db = "leo"

# --- 2. ABRIR LA CONEXIÓN ---
# Pasamos las variables directamente una por una, de forma tradicional
conexion = psycopg.connect(
    dbname=nombre_db,
    user=usuario_db,
)
print("¡Conexión abierta con éxito!")

# --- 3. CREAR EL CURSOR ---
# El cursor es el objeto que enviará los comandos SQL
mi_cursor = conexion.cursor()
print("Cursor creado.")

# --- 4. CREAR LA TABLA (OPCIONAL/BASE) ---
print("\n--- Ejecutando Configuración Inicial ---")
mi_cursor.execute("CREATE TABLE IF NOT EXISTS usuarios (id SERIAL PRIMARY KEY, nombre VARCHAR(100), email VARCHAR(100));")
print("Tabla 'usuarios' lista.")

# --- 5. EJECUTAR UN INSERT BÁSICO ---
print("\n--- Ejecutando INSERT ---")
sql_insert = "INSERT INTO usuarios (nombre, email) VALUES (%s, %s);"
datos = ("Checo Perez", "checo@example.com")

mi_cursor.execute(sql_insert, datos)
print("Datos enviados al servidor.")

# ¡Muy importante! Guardamos los cambios en la base de datos de forma explícita
conexion.commit()
print("Cambios guardados con commit.")

# --- 6. EJECUTAR UN SELECT BÁSICO ---
print("\n--- Ejecutando SELECT ---")
sql_select = "SELECT id, nombre, email FROM usuarios;"
mi_cursor.execute(sql_select)

# El cursor descarga las filas de la base de datos
todas_las_filas = mi_cursor.fetchall()

print("Resultado de la consulta:")
for fila in todas_las_filas:
    print("ID:", fila[0], "| Nombre:", fila[1], "| Email:", fila[2])

# --- 7. CERRAR LA CONEXIÓN DE FORMA SEGURA ---
print("\n--- Cerrando recursos ---")
# Primero se cierra el cartero (cursor)
mi_cursor.close()
print("Cursor cerrado.")

# Al final se cierra el puente (conexión)
conexion.close()
print("Conexión cerrada de forma segura.")