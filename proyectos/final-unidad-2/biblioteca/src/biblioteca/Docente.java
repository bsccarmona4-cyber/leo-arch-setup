package biblioteca;

public class Docente extends Usuario {

    public Docente(String nombre, String id) {
        super(nombre, id);
    }

    @Override
    public int calcularTiempoPrestamo() {
        return 15;
    }
}
