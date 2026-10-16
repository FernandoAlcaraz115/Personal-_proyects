package dao;

import conexion.ConexionBD;
import modelo.Materia;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MateriaDAO {

    public boolean insertar(Materia materia) {
        String sql = "INSERT INTO materias (nombre_materia, creditos, id_docente) VALUES (?, ?, ?)";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, materia.getNombreMateria());
            ps.setInt(2, materia.getCreditos());
            ps.setInt(3, materia.getIdDocente());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al insertar materia: " + e.getMessage());
            return false;
        }
    }

    public List<Materia> obtenerTodos() {
        List<Materia> lista = new ArrayList<>();
        String sql = "SELECT * FROM materias ORDER BY id_materia";
        try (Connection con = ConexionBD.conectar();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                lista.add(mapear(rs));
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener materias: " + e.getMessage());
        }
        return lista;
    }

    public Materia obtenerPorId(int idMateria) {
        String sql = "SELECT * FROM materias WHERE id_materia = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idMateria);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener materia: " + e.getMessage());
        }
        return null;
    }

    public boolean actualizar(Materia materia) {
        String sql = "UPDATE materias SET nombre_materia = ?, creditos = ?, id_docente = ? WHERE id_materia = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, materia.getNombreMateria());
            ps.setInt(2, materia.getCreditos());
            ps.setInt(3, materia.getIdDocente());
            ps.setInt(4, materia.getIdMateria());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al actualizar materia: " + e.getMessage());
            return false;
        }
    }

    public boolean eliminar(int idMateria) {
        String sql = "DELETE FROM materias WHERE id_materia = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idMateria);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al eliminar materia: " + e.getMessage());
            return false;
        }
    }

    private Materia mapear(ResultSet rs) throws SQLException {
        return new Materia(
                rs.getInt("id_materia"),
                rs.getString("nombre_materia"),
                rs.getInt("creditos"),
                rs.getInt("id_docente")
        );
    }
}
