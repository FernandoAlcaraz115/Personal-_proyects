package modelo;

import java.math.BigDecimal;

public class Inscripcion {
    private int idInscripcion;
    private String numeroControl;
    private int idMateria;
    private BigDecimal calificacion;

    public Inscripcion() {}

    public Inscripcion(String numeroControl, int idMateria, BigDecimal calificacion) {
        this.numeroControl = numeroControl;
        this.idMateria = idMateria;
        this.calificacion = calificacion;
    }

    public Inscripcion(int idInscripcion, String numeroControl, int idMateria, BigDecimal calificacion) {
        this.idInscripcion = idInscripcion;
        this.numeroControl = numeroControl;
        this.idMateria = idMateria;
        this.calificacion = calificacion;
    }

    public int getIdInscripcion() { return idInscripcion; }
    public void setIdInscripcion(int idInscripcion) { this.idInscripcion = idInscripcion; }

    public String getNumeroControl() { return numeroControl; }
    public void setNumeroControl(String numeroControl) { this.numeroControl = numeroControl; }

    public int getIdMateria() { return idMateria; }
    public void setIdMateria(int idMateria) { this.idMateria = idMateria; }

    public BigDecimal getCalificacion() { return calificacion; }
    public void setCalificacion(BigDecimal calificacion) { this.calificacion = calificacion; }

    @Override
    public String toString() {
        return idInscripcion + " | Control: " + numeroControl + " | Materia ID: " + idMateria
                + " | Calificación: " + calificacion;
    }
}
