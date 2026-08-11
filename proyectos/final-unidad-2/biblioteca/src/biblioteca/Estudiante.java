package biblioteca;

public class Estudiante extends Usuario {

    public Estudiante(String nombre, String id) {
        super(nombre, id);
    }

    @Override
    public int calcularTiempoPrestamo() {
        return 7;
    }
}
