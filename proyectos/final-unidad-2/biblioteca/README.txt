SISTEMA "GESTION DE BIBLIOTECA"
Final Unidad 2 - Programacion Orientada a Objetos

Alumno: Leonardo Arturo Carmona Vargas

DESCRIPCION
Sistema de consola en Java que registra libros y usuarios (estudiantes y
docentes), realiza prestamos y devoluciones, y genera un reporte de los
libros prestados. Aplica POO: encapsulamiento, herencia, polimorfismo y
colecciones (ArrayList).

ESTRUCTURA
src/biblioteca/
  Libro.java       - Clase del catalogo (titulo, autor, isbn, anio, estado)
  Usuario.java     - Clase abstracta base (nombre, id)
  Estudiante.java  - Hereda de Usuario; prestamo de 7 dias
  Docente.java     - Hereda de Usuario; prestamo de 15 dias
  Prestamo.java    - Registra el prestamo (fechas, dias permitidos)
  Biblioteca.java  - Administra libros, usuarios y prestamos
  Main.java        - Programa de demostracion

COMO COMPILAR Y EJECUTAR (requiere JDK)
  cd biblioteca
  javac -d out src/biblioteca/*.java
  java -cp out biblioteca.Main
