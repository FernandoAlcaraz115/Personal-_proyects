package vista;

import dao.InscripcionDAO;
import modelo.Inscripcion;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.math.BigDecimal;
import java.util.List;

public class InscripcionPanel extends JPanel {

    private final InscripcionDAO dao = new InscripcionDAO();
    private final DefaultTableModel modelo;
    private final JTable tabla;

    public InscripcionPanel() {
        setLayout(new BorderLayout(0, 0));
        setBackground(UITheme.FONDO);

        String[] columnas = {"ID Inscripcion", "No. Control (Alumno)", "ID Materia", "Calificacion"};
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

        add(UITheme.encabezadoPanel("Inscripciones", "Gestion de Inscripciones", "Asignacion de alumnos a materias"), BorderLayout.NORTH);
        add(centro, BorderLayout.CENTER);
        add(crearBotones(), BorderLayout.SOUTH);

        cargarDatos();
    }

    private JPanel crearBotones() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        panel.setBackground(UITheme.FONDO);
        panel.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, new Color(197, 202, 233)));

        JButton btnInscribir  = UITheme.boton("+ Inscribir",     UITheme.VERDE);
        JButton btnCalif      = UITheme.boton("Calificacion",    UITheme.AZUL_MEDIO);
        JButton btnEliminar   = UITheme.boton("x Eliminar",      UITheme.ROJO);
        JButton btnRefresh    = UITheme.boton("Refrescar",       UITheme.GRIS);

        panel.add(btnInscribir);
        panel.add(btnCalif);
        panel.add(btnEliminar);
        panel.add(btnRefresh);

        btnInscribir.addActionListener(e -> inscribir());
        btnCalif.addActionListener(e -> actualizarCalificacion());
        btnEliminar.addActionListener(e -> eliminar());
        btnRefresh.addActionListener(e -> cargarDatos());

        return panel;
    }

    private void cargarDatos() {
        modelo.setRowCount(0);
        List<Inscripcion> lista = dao.obtenerTodos();
        for (Inscripcion i : lista)
            modelo.addRow(new Object[]{
                i.getIdInscripcion(), i.getNumeroControl(),
                i.getIdMateria(),
                i.getCalificacion() != null ? i.getCalificacion() : "Sin calificacion"
            });
    }

    private void inscribir() {
        String nc = JOptionPane.showInputDialog(this, "Numero de control del alumno:");
        if (nc == null || nc.isBlank()) return;
        String idmStr = JOptionPane.showInputDialog(this, "ID de la materia:");
        if (idmStr == null || idmStr.isBlank()) return;
        try {
            int idm = Integer.parseInt(idmStr.trim());
            boolean ok = dao.insertar(new Inscripcion(nc.trim(), idm, null));
            JOptionPane.showMessageDialog(this,
                ok ? "Alumno inscrito correctamente. La calificacion se asignara despues."
                   : "Error al inscribir. Verifique el no. de control y el ID de materia.");
            cargarDatos();
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "El ID de materia debe ser un numero entero.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void actualizarCalificacion() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona una inscripcion de la tabla."); return; }
        int id = (int) modelo.getValueAt(fila, 0);
        String nc = (String) modelo.getValueAt(fila, 1);
        String calStr = JOptionPane.showInputDialog(this,
                "Calificacion para el alumno " + nc + " (ej. 8.5):");
        if (calStr == null || calStr.isBlank()) return;
        try {
            boolean ok = dao.actualizarCalificacion(id, new BigDecimal(calStr.trim()));
            JOptionPane.showMessageDialog(this, ok ? "Calificacion registrada." : "Error al actualizar.");
            cargarDatos();
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "La calificacion debe ser un numero decimal (ej. 9.5).", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void eliminar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona una inscripcion de la tabla."); return; }
        int id = (int) modelo.getValueAt(fila, 0);
        String nc = (String) modelo.getValueAt(fila, 1);
        int confirm = JOptionPane.showConfirmDialog(this,
                "Eliminar la inscripcion del alumno " + nc + " (ID " + id + ")?",
                "Confirmar eliminacion", JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
        if (confirm == JOptionPane.YES_OPTION) {
            boolean ok = dao.eliminar(id);
            JOptionPane.showMessageDialog(this, ok ? "Inscripcion eliminada." : "Error al eliminar.");
            cargarDatos();
        }
    }
}
