package vista;

import dao.DocenteDAO;
import modelo.Docente;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class DocentePanel extends JPanel {

    private final DocenteDAO dao = new DocenteDAO();
    private final DefaultTableModel modelo;
    private final JTable tabla;

    public DocentePanel() {
        setLayout(new BorderLayout(0, 0));
        setBackground(UITheme.FONDO);

        String[] columnas = {"ID", "Nombre", "Especialidad"};
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

        add(UITheme.encabezadoPanel("Docentes", "Gestion de Docentes", "Registro del personal docente"), BorderLayout.NORTH);
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
        List<Docente> lista = dao.obtenerTodos();
        for (Docente d : lista)
            modelo.addRow(new Object[]{d.getIdDocente(), d.getNombre(), d.getEspecialidad()});
    }

    private void agregar() {
        String nombre = JOptionPane.showInputDialog(this, "Nombre del docente:");
        if (nombre == null || nombre.isBlank()) return;
        String esp = JOptionPane.showInputDialog(this, "Especialidad:");
        if (esp == null || esp.isBlank()) return;
        boolean ok = dao.insertar(new Docente(nombre.trim(), esp.trim()));
        JOptionPane.showMessageDialog(this, ok ? "Docente agregado correctamente." : "Error al agregar.");
        cargarDatos();
    }

    private void actualizar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona un docente de la tabla."); return; }
        int id = (int) modelo.getValueAt(fila, 0);
        Docente d = dao.obtenerPorId(id);
        if (d == null) return;

        String nombre = JOptionPane.showInputDialog(this, "Nuevo nombre:", d.getNombre());
        if (nombre == null) return;
        String esp = JOptionPane.showInputDialog(this, "Nueva especialidad:", d.getEspecialidad());
        if (esp == null) return;
        if (!nombre.isBlank()) d.setNombre(nombre.trim());
        if (!esp.isBlank()) d.setEspecialidad(esp.trim());
        boolean ok = dao.actualizar(d);
        JOptionPane.showMessageDialog(this, ok ? "Docente actualizado." : "Error al actualizar.");
        cargarDatos();
    }

    private void eliminar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona un docente de la tabla."); return; }
        int id = (int) modelo.getValueAt(fila, 0);
        String nombre = (String) modelo.getValueAt(fila, 1);
        int confirm = JOptionPane.showConfirmDialog(this,
                "Eliminar al docente \"" + nombre + "\"?", "Confirmar eliminacion",
                JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
        if (confirm == JOptionPane.YES_OPTION) {
            boolean ok = dao.eliminar(id);
            JOptionPane.showMessageDialog(this, ok ? "Docente eliminado." : "Error al eliminar.");
            cargarDatos();
        }
    }
}
