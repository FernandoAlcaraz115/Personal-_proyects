package dao;

import conexion.ConexionBD;
import modelo.Alumno;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AlumnoDAO {

    public boolean insertar(Alumno alumno) {
        String sql = "INSERT INTO alumnos (numero_control, nombre, apellido_paterno, apellido_materno, semestre, id_carrera) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, alumno.getNumeroControl());
            ps.setString(2, alumno.getNombre());
            ps.setString(3, alumno.getApellidoPaterno());
            ps.setString(4, alumno.getApellidoMaterno());
            ps.setInt(5, alumno.getSemestre());
            ps.setInt(6, alumno.getIdCarrera());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al insertar alumno: " + e.getMessage());
            return false;
        }
    }

    public List<Alumno> obtenerTodos() {
        List<Alumno> lista = new ArrayList<>();
        String sql = "SELECT * FROM alumnos ORDER BY numero_control";
        try (Connection con = ConexionBD.conectar();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                lista.add(mapear(rs));
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener alumnos: " + e.getMessage());
        }
        return lista;
    }

    public Alumno obtenerPorControl(String numeroControl) {
        String sql = "SELECT * FROM alumnos WHERE numero_control = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, numeroControl);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener alumno: " + e.getMessage());
        }
        return null;
    }

    public boolean actualizar(Alumno alumno) {
        String sql = "UPDATE alumnos SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, semestre = ?, id_carrera = ? WHERE numero_control = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, alumno.getNombre());
            ps.setString(2, alumno.getApellidoPaterno());
            ps.setString(3, alumno.getApellidoMaterno());
            ps.setInt(4, alumno.getSemestre());
            ps.setInt(5, alumno.getIdCarrera());
            ps.setString(6, alumno.getNumeroControl());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al actualizar alumno: " + e.getMessage());
            return false;
        }
    }

    public boolean eliminar(String numeroControl) {
        String sql = "DELETE FROM alumnos WHERE numero_control = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, numeroControl);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al eliminar alumno: " + e.getMessage());
            return false;
        }
    }

    private Alumno mapear(ResultSet rs) throws SQLException {
        return new Alumno(
                rs.getString("numero_control"),
                rs.getString("nombre"),
                rs.getString("apellido_paterno"),
                rs.getString("apellido_materno"),
                rs.getInt("semestre"),
                rs.getInt("id_carrera")
        );
    }
}
