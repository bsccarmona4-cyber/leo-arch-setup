package biblioteca;

import java.util.ArrayList;

public class Biblioteca {
    private ArrayList<Libro> libros;
    private ArrayList<Usuario> usuarios;
    private ArrayList<Prestamo> prestamos;

    public Biblioteca() {
        this.libros = new ArrayList<>();
        this.usuarios = new ArrayList<>();
        this.prestamos = new ArrayList<>();
    }

    public void registrarLibro(Libro libro) {
        libros.add(libro);
        System.out.println("Libro registrado: " + libro.getTitulo());
    }

    public void registrarUsuario(Usuario usuario) {
        usuarios.add(usuario);
        System.out.println("Usuario registrado: " + usuario.getNombre()
                + " (" + usuario.getClass().getSimpleName() + ")");
    }

    public void prestarLibro(String isbn, String idUsuario) {
        Libro libro = buscarLibroPorIsbn(isbn);
        if (libro == null) {
            System.out.println("ERROR: No existe un libro con ISBN " + isbn);
            return;
        }
        if (!libro.esDisponible()) {
            System.out.println("ERROR: El libro " + libro.getTitulo() + " ya está prestado");
            return;
        }
        Usuario usuario = buscarUsuarioPorId(idUsuario);
        if (usuario == null) {
            System.out.println("ERROR: No existe un usuario con ID " + idUsuario);
            return;
        }
        Prestamo prestamo = new Prestamo(libro, usuario);
        prestamos.add(prestamo);
        System.out.println("Préstamo exitoso: " + libro.getTitulo() + " a " + usuario.getNombre()
                + ". Días permitidos: " + prestamo.getDiasPermitidos());
    }

    public void devolverLibro(String isbn) {
        Prestamo prestamo = buscarPrestamoActivoPorIsbn(isbn);
        if (prestamo == null) {
            System.out.println("ERROR: No hay un préstamo activo para el libro " + isbn);
            return;
        }
        prestamo.devolver();
        System.out.println("Devolución registrada: " + prestamo.getLibro().getTitulo()
                + " (devuelto el " + prestamo.getFechaDevolucion() + ")");
    }

    public void reporteLibrosPrestados() {
        boolean hayActivos = false;
        for (Prestamo prestamo : prestamos) {
            if (prestamo.estaActivo()) {
                hayActivos = true;
                break;
            }
        }
        if (!hayActivos) {
            System.out.println("No hay libros prestados en este momento.");
            return;
        }
        System.out.println("=== REPORTE DE LIBROS PRESTADOS ===");
        for (Prestamo prestamo : prestamos) {
            if (prestamo.estaActivo()) {
                System.out.println(prestamo);
            }
        }
    }

    public void mostrarCatalogo() {
        for (Libro libro : libros) {
            System.out.println(libro);
        }
    }

    public void mostrarUsuarios() {
        for (Usuario usuario : usuarios) {
            System.out.println(usuario);
        }
    }

    private Libro buscarLibroPorIsbn(String isbn) {
        for (Libro libro : libros) {
            if (libro.getIsbn().equals(isbn)) {
                return libro;
            }
        }
        return null;
    }

    private Usuario buscarUsuarioPorId(String id) {
        for (Usuario usuario : usuarios) {
            if (usuario.getId().equals(id)) {
                return usuario;
            }
        }
        return null;
    }

    private Prestamo buscarPrestamoActivoPorIsbn(String isbn) {
        for (Prestamo prestamo : prestamos) {
            if (prestamo.estaActivo() && prestamo.getLibro().getIsbn().equals(isbn)) {
                return prestamo;
            }
        }
        return null;
    }
}