import hashlib
from database import conectar


def cifrar_contrasena(contrasena):
    """Cifro la contraseña con SHA-256 antes de almacenarla."""
    return hashlib.sha256(contrasena.encode()).hexdigest()


def iniciar_sesion(usuario, contrasena):
    """Verifico las credenciales del empleado y retorno sus datos si son válidas."""
    conn = conectar()
    cursor = conn.cursor()

    contrasena_cifrada = cifrar_contrasena(contrasena)

    cursor.execute(
        "SELECT id, nombre, usuario, rol FROM usuarios WHERE usuario = ? AND contrasena = ? AND activo = 1",
        (usuario, contrasena_cifrada)
    )

    empleado = cursor.fetchone()
    conn.close()

    if empleado:
        return dict(empleado)
    return None


def registrar_usuario(nombre, usuario, contrasena, rol="cajero"):
    """Registro un nuevo empleado en el sistema."""
    conn = conectar()
    cursor = conn.cursor()

    try:
        contrasena_cifrada = cifrar_contrasena(contrasena)
        cursor.execute(
            "INSERT INTO usuarios (nombre, usuario, contrasena, rol) VALUES (?, ?, ?, ?)",
            (nombre, usuario, contrasena_cifrada, rol)
        )
        conn.commit()
        return True, "Usuario registrado correctamente."
    except Exception as e:
        conn.rollback()
        return False, f"No pude registrar al usuario: {e}"
    finally:
        conn.close()


def cambiar_contrasena(id_usuario, contrasena_actual, nueva_contrasena):
    """Permito al empleado cambiar su contraseña verificando la actual."""
    conn = conectar()
    cursor = conn.cursor()

    contrasena_actual_cifrada = cifrar_contrasena(contrasena_actual)
    cursor.execute(
        "SELECT id FROM usuarios WHERE id = ? AND contrasena = ?",
        (id_usuario, contrasena_actual_cifrada)
    )

    if not cursor.fetchone():
        conn.close()
        return False, "La contraseña actual no es correcta."

    nueva_cifrada = cifrar_contrasena(nueva_contrasena)
    cursor.execute(
        "UPDATE usuarios SET contrasena = ? WHERE id = ?",
        (nueva_cifrada, id_usuario)
    )
    conn.commit()
    conn.close()
    return True, "Contraseña actualizada."


def listar_usuarios():
    """Obtengo la lista de todos los empleados registrados."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, usuario, rol, activo FROM usuarios ORDER BY nombre")
    usuarios = [dict(fila) for fila in cursor.fetchall()]
    conn.close()
    return usuarios


def desactivar_usuario(id_usuario):
    """Desactivo a un empleado sin eliminar su registro."""
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("UPDATE usuarios SET activo = 0 WHERE id = ?", (id_usuario,))
    conn.commit()
    conn.close()
    return True
