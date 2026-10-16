package dao;

import conexion.ConexionBD;
import modelo.Carrera;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CarreraDAO {

    public boolean insertar(Carrera carrera) {
        String sql = "INSERT INTO carreras (nombre_carrera, duracion_semestres) VALUES (?, ?)";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, carrera.getNombreCarrera());
            ps.setInt(2, carrera.getDuracionSemestres());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al insertar carrera: " + e.getMessage());
            return false;
        }
    }

    public List<Carrera> obtenerTodos() {
        List<Carrera> lista = new ArrayList<>();
        String sql = "SELECT * FROM carreras ORDER BY id_carrera";
        try (Connection con = ConexionBD.conectar();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                lista.add(new Carrera(
                        rs.getInt("id_carrera"),
                        rs.getString("nombre_carrera"),
                        rs.getInt("duracion_semestres")
                ));
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener carreras: " + e.getMessage());
        }
        return lista;
    }

    public Carrera obtenerPorId(int idCarrera) {
        String sql = "SELECT * FROM carreras WHERE id_carrera = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idCarrera);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Carrera(
                            rs.getInt("id_carrera"),
                            rs.getString("nombre_carrera"),
                            rs.getInt("duracion_semestres")
                    );
                }
            }
        } catch (SQLException e) {
            System.out.println("Error al obtener carrera: " + e.getMessage());
        }
        return null;
    }

    public boolean actualizar(Carrera carrera) {
        String sql = "UPDATE carreras SET nombre_carrera = ?, duracion_semestres = ? WHERE id_carrera = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, carrera.getNombreCarrera());
            ps.setInt(2, carrera.getDuracionSemestres());
            ps.setInt(3, carrera.getIdCarrera());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al actualizar carrera: " + e.getMessage());
            return false;
        }
    }

    public boolean eliminar(int idCarrera) {
        String sql = "DELETE FROM carreras WHERE id_carrera = ?";
        try (Connection con = ConexionBD.conectar();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, idCarrera);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.out.println("Error al eliminar carrera: " + e.getMessage());
            return false;
        }
    }
}
