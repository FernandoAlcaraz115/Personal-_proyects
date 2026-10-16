package dao;

import conexion.ConexionBD;
import modelo.Inscripcion;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class InscripcionDAO {

    public boolean insertar(Inscripcion inscripcion) {
        String sql = "INSERT INTO inscripciones (numero_control, id_materia, calificacion) VALUES (?, ?, ?)";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, inscripcion.getNumeroControl());
            ps.setInt(2, inscripcion.getIdMateria());
            ps.setBigDecimal(3, inscripcion.getCalificacion());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al insertar inscripción: " + e.getMessage());
            return false;
        }
    }

    public List<Inscripcion> obtenerTodos() {
        List<Inscripcion> lista = new ArrayList<>();
        String sql = "SELECT * FROM inscripciones ORDER BY id_inscripcion";
        try (Connection con = ConexionBD.conectar();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                lista.add(mapear(rs));
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener inscripciones: " + e.getMessage());
        }
        return lista;
    }

    public Inscripcion obtenerPorId(int idInscripcion) {
        String sql = "SELECT * FROM inscripciones WHERE id_inscripcion = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idInscripcion);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener inscripción: " + e.getMessage());
        }
        return null;
    }

    public List<Inscripcion> obtenerPorAlumno(String numeroControl) {
        List<Inscripcion> lista = new ArrayList<>();
        String sql = "SELECT * FROM inscripciones WHERE numero_control = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, numeroControl);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener inscripciones por alumno: " + e.getMessage());
        }
        return lista;
    }

    public boolean actualizarCalificacion(int idInscripcion, BigDecimal calificacion) {
        String sql = "UPDATE inscripciones SET calificacion = ? WHERE id_inscripcion = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setBigDecimal(1, calificacion);
            ps.setInt(2, idInscripcion);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al actualizar calificación: " + e.getMessage());
            return false;
        }
    }

    public boolean eliminar(int idInscripcion) {
        String sql = "DELETE FROM inscripciones WHERE id_inscripcion = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idInscripcion);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al eliminar inscripción: " + e.getMessage());
            return false;
        }
    }

    private Inscripcion mapear(ResultSet rs) throws SQLException {
        return new Inscripcion(
                rs.getInt("id_inscripcion"),
                rs.getString("numero_control"),
                rs.getInt("id_materia"),
                rs.getBigDecimal("calificacion")
        );
    }
}
