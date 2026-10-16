package modelo;

public class Carrera {
    private int idCarrera;
    private String nombreCarrera;
    private int duracionSemestres;

    public Carrera() {}

    public Carrera(String nombreCarrera, int duracionSemestres) {
        this.nombreCarrera = nombreCarrera;
        this.duracionSemestres = duracionSemestres;
    }

    public Carrera(int idCarrera, String nombreCarrera, int duracionSemestres) {
        this.idCarrera = idCarrera;
        this.nombreCarrera = nombreCarrera;
        this.duracionSemestres = duracionSemestres;
    }

    public int getIdCarrera() { return idCarrera; }
    public void setIdCarrera(int idCarrera) { this.idCarrera = idCarrera; }

    public String getNombreCarrera() { return nombreCarrera; }
    public void setNombreCarrera(String nombreCarrera) { this.nombreCarrera = nombreCarrera; }

    public int getDuracionSemestres() { return duracionSemestres; }
    public void setDuracionSemestres(int duracionSemestres) { this.duracionSemestres = duracionSemestres; }

    @Override
    public String toString() {
        return idCarrera + " | " + nombreCarrera + " | " + duracionSemestres + " semestres";
    }
}
