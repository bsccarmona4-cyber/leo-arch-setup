package biblioteca;

public class Main {

    public static void main(String[] args) {
        System.out.println("=== SISTEMA DE GESTIÓN DE BIBLIOTECA ===");
        System.out.println();

        // Creacion de la biblioteca
        Biblioteca biblioteca = new Biblioteca();

        // Registro de libros
        System.out.println("----------------------------------------");
        System.out.println("Registro de libros");
        System.out.println("----------------------------------------");
        biblioteca.registrarLibro(new Libro("Cien años de soledad", "Gabriel García Márquez", "9780307474728", 1967));
        biblioteca.registrarLibro(new Libro("Don Quijote de la Mancha", "Miguel de Cervantes", "9788420412146", 1605));
        biblioteca.registrarLibro(new Libro("El principito", "Antoine de Saint-Exupéry", "9780156012195", 1943));
        biblioteca.registrarLibro(new Libro("1984", "George Orwell", "9780451524935", 1949));
        System.out.println();

        // Registro de usuarios
        System.out.println("----------------------------------------");
        System.out.println("Registro de usuarios");
        System.out.println("----------------------------------------");
        biblioteca.registrarUsuario(new Estudiante("Ana López", "EST001"));
        biblioteca.registrarUsuario(new Docente("Carlos Ruiz", "DOC001"));
        System.out.println();

        // Prestamo de libro al estudiante
        System.out.println("----------------------------------------");
        System.out.println("Préstamo de libro al estudiante");
        System.out.println("----------------------------------------");
        biblioteca.prestarLibro("9780307474728", "EST001");
        System.out.println();

        // Prestamo de libro al docente
        System.out.println("----------------------------------------");
        System.out.println("Préstamo de libro al docente");
        System.out.println("----------------------------------------");
        biblioteca.prestarLibro("9788420412146", "DOC001");
        System.out.println();

        // Intento de prestar un libro ya prestado
        System.out.println("----------------------------------------");
        System.out.println("Intento de prestar un libro ya prestado");
        System.out.println("----------------------------------------");
        biblioteca.prestarLibro("9780307474728", "DOC001");
        System.out.println();

        // Devolucion del libro del estudiante
        System.out.println("----------------------------------------");
        System.out.println("Devolución del libro del estudiante");
        System.out.println("----------------------------------------");
        biblioteca.devolverLibro("9780307474728");
        System.out.println();

        // Catalogo completo
        System.out.println("----------------------------------------");
        System.out.println("Catálogo completo de libros");
        System.out.println("----------------------------------------");
        biblioteca.mostrarCatalogo();
        System.out.println();

        // Reporte de libros prestados
        System.out.println("----------------------------------------");
        System.out.println("Reporte de libros prestados");
        System.out.println("----------------------------------------");
        biblioteca.reporteLibrosPrestados();
        System.out.println();

        System.out.println("=== FIN DEL PROGRAMA ===");
    }
}