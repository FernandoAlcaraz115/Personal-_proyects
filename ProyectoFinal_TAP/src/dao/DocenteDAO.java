package dao;

import conexion.ConexionBD;
import modelo.Docente;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DocenteDAO {

    public boolean insertar(Docente docente) {
        String sql = "INSERT INTO docentes (nombre, especialidad) VALUES (?, ?)";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, docente.getNombre());
            ps.setString(2, docente.getEspecialidad());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al insertar docente: " + e.getMessage());
            return false;
        }
    }

    public List<Docente> obtenerTodos() {
        List<Docente> lista = new ArrayList<>();
        String sql = "SELECT * FROM docentes ORDER BY id_docente";
        try (Connection con = ConexionBD.conectar();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                lista.add(mapear(rs));
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener docentes: " + e.getMessage());
        }
        return lista;
    }

    public Docente obtenerPorId(int idDocente) {
        String sql = "SELECT * FROM docentes WHERE id_docente = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idDocente);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener docente: " + e.getMessage());
        }
        return null;
    }

    public boolean actualizar(Docente docente) {
        String sql = "UPDATE docentes SET nombre = ?, especialidad = ? WHERE id_docente = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, docente.getNombre());
            ps.setString(2, docente.getEspecialidad());
            ps.setInt(3, docente.getIdDocente());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al actualizar docente: " + e.getMessage());
            return false;
        }
    }

    public boolean eliminar(int idDocente) {
        String sql = "DELETE FROM docentes WHERE id_docente = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idDocente);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al eliminar docente: " + e.getMessage());
            return false;
        }
    }

    private Docente mapear(ResultSet rs) throws SQLException {
        return new Docente(
                rs.getInt("id_docente"),
                rs.getString("nombre"),
                rs.getString("especialidad")
        );
    }
}
