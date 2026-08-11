package biblioteca;

public class Libro {
    private String titulo;
    private String autor;
    private String isbn;
    private int anio;
    private String estado;

    public Libro(String titulo, String autor, String isbn, int anio) {
        this.titulo = titulo;
        this.autor = autor;
        this.isbn = isbn;
        this.anio = anio;
        this.estado = "disponible";
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public int getAnio() {
        return anio;
    }

    public void setAnio(int anio) {
        this.anio = anio;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public boolean esDisponible() {
        return estado.equals("disponible");
    }

    public void marcarPrestado() {
        this.estado = "prestado";
    }

    public void marcarDisponible() {
        this.estado = "disponible";
    }

    @Override
    public String toString() {
        return "Título: " + titulo + " | Autor: " + autor + " | ISBN: " + isbn
                + " | Año: " + anio + " | Estado: " + estado;
    }
}