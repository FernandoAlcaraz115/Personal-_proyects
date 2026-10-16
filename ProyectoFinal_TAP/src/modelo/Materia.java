package modelo;

public class Materia {
    private int idMateria;
    private String nombreMateria;
    private int creditos;
    private int idDocente;

    public Materia() {}

    public Materia(String nombreMateria, int creditos, int idDocente) {
        this.nombreMateria = nombreMateria;
        this.creditos = creditos;
        this.idDocente = idDocente;
    }

    public Materia(int idMateria, String nombreMateria, int creditos, int idDocente) {
        this.idMateria = idMateria;
        this.nombreMateria = nombreMateria;
        this.creditos = creditos;
        this.idDocente = idDocente;
    }

    public int getIdMateria() { return idMateria; }
    public void setIdMateria(int idMateria) { this.idMateria = idMateria; }

    public String getNombreMateria() { return nombreMateria; }
    public void setNombreMateria(String nombreMateria) { this.nombreMateria = nombreMateria; }

    public int getCreditos() { return creditos; }
    public void setCreditos(int creditos) { this.creditos = creditos; }

    public int getIdDocente() { return idDocente; }
    public void setIdDocente(int idDocente) { this.idDocente = idDocente; }

    @Override
    public String toString() {
        return idMateria + " | " + nombreMateria + " | " + creditos + " créditos | Docente ID: " + idDocente;
    }
}
