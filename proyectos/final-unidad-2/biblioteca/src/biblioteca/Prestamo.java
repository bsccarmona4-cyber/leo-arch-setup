package biblioteca;

import java.time.LocalDate;

public class Prestamo {
    private Libro libro;
    private Usuario usuario;
    private LocalDate fechaPrestamo;
    private LocalDate fechaDevolucion;
    private int diasPermitidos;

    public Prestamo(Libro libro, Usuario usuario) {
        this.libro = libro;
        this.usuario = usuario;
        this.fechaPrestamo = LocalDate.now();
        this.fechaDevolucion = null;
        this.diasPermitidos = usuario.calcularTiempoPrestamo();
        libro.marcarPrestado();
    }

    public void devolver() {
        this.fechaDevolucion = LocalDate.now();
        libro.marcarDisponible();
    }

    public boolean estaActivo() {
        return fechaDevolucion == null;
    }

    public Libro getLibro() {
        return libro;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public LocalDate getFechaPrestamo() {
        return fechaPrestamo;
    }

    public LocalDate getFechaDevolucion() {
        return fechaDevolucion;
    }

    public int getDiasPermitidos() {
        return diasPermitidos;
    }

    @Override
    public String toString() {
        String estadoPrestamo = estaActivo() ? "Activo" : "Devuelto el " + fechaDevolucion;
        return "Préstamo: " + libro + " | Usuario: " + usuario
                + " | Fecha de préstamo: " + fechaPrestamo
                + " | Días permitidos: " + diasPermitidos
                + " | Estado: " + estadoPrestamo;
    }
}