package conexion;

import java.sql.Connection;
import java.sql.DriverManager;

public class ConexionBD {
    private static final String URL = "jdbc:postgresql://localhost:5432/db_tec_morelia_final";
    private static final String USER = "postgres";
    private static final String PASSWORD = "fer11102003";

    public static Connection conectar() {
        Connection con = null;
        try {
            Class.forName("org.postgresql.Driver");
            con = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("Conexión Exitosa");
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
        return con;
    }
}
