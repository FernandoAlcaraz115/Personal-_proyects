package modelo;

public class Alumno {
    private String numeroControl;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private int semestre;
    private int idCarrera;

    public Alumno() {}

    public Alumno(String numeroControl, String nombre, String apellidoPaterno,
                  String apellidoMaterno, int semestre, int idCarrera) {
        this.numeroControl = numeroControl;
        this.nombre = nombre;
        this.apellidoPaterno = apellidoPaterno;
        this.apellidoMaterno = apellidoMaterno;
        this.semestre = semestre;
        this.idCarrera = idCarrera;
    }

    public String getNumeroControl() { return numeroControl; }
    public void setNumeroControl(String numeroControl) { this.numeroControl = numeroControl; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidoPaterno() { return apellidoPaterno; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }

    public String getApellidoMaterno() { return apellidoMaterno; }
    public void setApellidoMaterno(String apellidoMaterno) { this.apellidoMaterno = apellidoMaterno; }

    public int getSemestre() { return semestre; }
    public void setSemestre(int semestre) { this.semestre = semestre; }

    public int getIdCarrera() { return idCarrera; }
    public void setIdCarrera(int idCarrera) { this.idCarrera = idCarrera; }

    @Override
    public String toString() {
        return numeroControl + " | " + nombre + " " + apellidoPaterno + " " + apellidoMaterno
                + " | Semestre: " + semestre + " | Carrera ID: " + idCarrera;
    }
}
