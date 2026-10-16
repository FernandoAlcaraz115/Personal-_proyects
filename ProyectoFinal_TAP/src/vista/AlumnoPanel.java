package vista;

import dao.AlumnoDAO;
import modelo.Alumno;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class AlumnoPanel extends JPanel {

    private final AlumnoDAO dao = new AlumnoDAO();
    private final DefaultTableModel modelo;
    private final JTable tabla;

    public AlumnoPanel() {
        setLayout(new BorderLayout(0, 0));
        setBackground(UITheme.FONDO);

        String[] columnas = {"No. Control", "Nombre", "Ap. Paterno", "Ap. Materno", "Semestre", "ID Carrera"};
        modelo = new DefaultTableModel(columnas, 0) {
            @Override public boolean isCellEditable(int r, int c) { return false; }
        };
        tabla = new JTable(modelo);
        tabla.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        UITheme.estilizarTabla(tabla);

        JPanel centro = new JPanel(new BorderLayout());
        centro.setBackground(UITheme.FONDO);
        centro.setBorder(BorderFactory.createEmptyBorder(12, 16, 12, 16));
        centro.add(UITheme.scrollEstilizado(tabla), BorderLayout.CENTER);

        add(UITheme.encabezadoPanel("Alumnos", "Gestion de Alumnos", "Datos personales y academicos"), BorderLayout.NORTH);
        add(centro, BorderLayout.CENTER);
        add(crearBotones(), BorderLayout.SOUTH);

        cargarDatos();
    }

    private JPanel crearBotones() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        panel.setBackground(UITheme.FONDO);
        panel.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, new Color(197, 202, 233)));

        JButton btnAgregar    = UITheme.boton("+ Agregar",    UITheme.VERDE);
        JButton btnActualizar = UITheme.boton("/ Actualizar", UITheme.NARANJA);
        JButton btnEliminar   = UITheme.boton("x Eliminar",   UITheme.ROJO);
        JButton btnRefresh    = UITheme.boton("Refrescar",    UITheme.GRIS);

        panel.add(btnAgregar);
        panel.add(btnActualizar);
        panel.add(btnEliminar);
        panel.add(btnRefresh);

        btnAgregar.addActionListener(e -> agregar());
        btnActualizar.addActionListener(e -> actualizar());
        btnEliminar.addActionListener(e -> eliminar());
        btnRefresh.addActionListener(e -> cargarDatos());

        return panel;
    }

    private void cargarDatos() {
        modelo.setRowCount(0);
        List<Alumno> lista = dao.obtenerTodos();
        for (Alumno a : lista)
            modelo.addRow(new Object[]{
                a.getNumeroControl(), a.getNombre(),
                a.getApellidoPaterno(), a.getApellidoMaterno(),
                a.getSemestre(), a.getIdCarrera()
            });
    }

    private void agregar() {
        String nc  = JOptionPane.showInputDialog(this, "Numero de control:");
        if (nc == null || nc.isBlank()) return;
        String nom = JOptionPane.showInputDialog(this, "Nombre:");
        if (nom == null || nom.isBlank()) return;
        String ap  = JOptionPane.showInputDialog(this, "Apellido paterno:");
        if (ap == null) return;
        String am  = JOptionPane.showInputDialog(this, "Apellido materno:");
        if (am == null) return;
        String semStr = JOptionPane.showInputDialog(this, "Semestre:");
        if (semStr == null) return;
        String idcStr = JOptionPane.showInputDialog(this, "ID Carrera:");
        if (idcStr == null) return;
        try {
            int sem = Integer.parseInt(semStr.trim());
            int idc = Integer.parseInt(idcStr.trim());
            boolean ok = dao.insertar(new Alumno(nc.trim(), nom.trim(), ap.trim(), am.trim(), sem, idc));
            JOptionPane.showMessageDialog(this, ok ? "Alumno registrado correctamente." : "Error al registrar.");
            cargarDatos();
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Semestre e ID Carrera deben ser numeros enteros.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void actualizar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona un alumno de la tabla."); return; }
        String nc = (String) modelo.getValueAt(fila, 0);
        Alumno a = dao.obtenerPorControl(nc);
        if (a == null) return;

        String semStr = JOptionPane.showInputDialog(this, "Nuevo semestre:", a.getSemestre());
        if (semStr == null) return;
        String idcStr = JOptionPane.showInputDialog(this, "Nuevo ID Carrera:", a.getIdCarrera());
        if (idcStr == null) return;
        try {
            a.setSemestre(Integer.parseInt(semStr.trim()));
            a.setIdCarrera(Integer.parseInt(idcStr.trim()));
            boolean ok = dao.actualizar(a);
            JOptionPane.showMessageDialog(this, ok ? "Alumno actualizado." : "Error al actualizar.");
            cargarDatos();
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Semestre e ID Carrera deben ser numeros enteros.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void eliminar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona un alumno de la tabla."); return; }
        String nc  = (String) modelo.getValueAt(fila, 0);
        String nom = (String) modelo.getValueAt(fila, 1);
        int confirm = JOptionPane.showConfirmDialog(this,
                "Eliminar al alumno \"" + nom + "\" (" + nc + ")?", "Confirmar eliminacion",
                JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
        if (confirm == JOptionPane.YES_OPTION) {
            boolean ok = dao.eliminar(nc);
            JOptionPane.showMessageDialog(this, ok ? "Alumno eliminado." : "Error al eliminar.");
            cargarDatos();
        }
    }
}
