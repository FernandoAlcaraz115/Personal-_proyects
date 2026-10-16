package vista;

import dao.CarreraDAO;
import modelo.Carrera;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class CarreraPanel extends JPanel {

    private final CarreraDAO dao = new CarreraDAO();
    private final DefaultTableModel modelo;
    private final JTable tabla;

    public CarreraPanel() {
        setLayout(new BorderLayout(0, 0));
        setBackground(UITheme.FONDO);

        String[] columnas = {"ID", "Nombre de la Carrera", "Duracion (semestres)"};
        modelo = new DefaultTableModel(columnas, 0) {
            @Override public boolean isCellEditable(int r, int c) { return false; }
        };
        tabla = new JTable(modelo);
        tabla.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        UITheme.estilizarTabla(tabla);

        JPanel centro = new JPanel(new BorderLayout(0, 0));
        centro.setBackground(UITheme.FONDO);
        centro.setBorder(BorderFactory.createEmptyBorder(12, 16, 12, 16));
        centro.add(UITheme.scrollEstilizado(tabla), BorderLayout.CENTER);

        add(UITheme.encabezadoPanel("Carreras", "Gestion de Carreras", "Administra las carreras del instituto"), BorderLayout.NORTH);
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
        List<Carrera> lista = dao.obtenerTodos();
        for (Carrera c : lista)
            modelo.addRow(new Object[]{c.getIdCarrera(), c.getNombreCarrera(), c.getDuracionSemestres()});
    }

    private void agregar() {
        String nombre = JOptionPane.showInputDialog(this, "Nombre de la carrera:");
        if (nombre == null || nombre.isBlank()) return;
        String semStr = JOptionPane.showInputDialog(this, "Duracion (semestres):");
        if (semStr == null) return;
        try {
            boolean ok = dao.insertar(new Carrera(nombre.trim(), Integer.parseInt(semStr.trim())));
            JOptionPane.showMessageDialog(this, ok ? "Carrera agregada correctamente." : "Error al agregar.");
            cargarDatos();
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "La duracion debe ser un numero entero.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void actualizar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona una carrera de la tabla."); return; }
        int id = (int) modelo.getValueAt(fila, 0);
        Carrera c = dao.obtenerPorId(id);
        if (c == null) return;

        String nombre = JOptionPane.showInputDialog(this, "Nuevo nombre:", c.getNombreCarrera());
        if (nombre == null) return;
        String semStr = JOptionPane.showInputDialog(this, "Semestres:", c.getDuracionSemestres());
        if (semStr == null) return;
        try {
            if (!nombre.isBlank()) c.setNombreCarrera(nombre.trim());
            c.setDuracionSemestres(Integer.parseInt(semStr.trim()));
            boolean ok = dao.actualizar(c);
            JOptionPane.showMessageDialog(this, ok ? "Carrera actualizada." : "Error al actualizar.");
            cargarDatos();
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "La duracion debe ser un numero entero.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void eliminar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona una carrera de la tabla."); return; }
        int id = (int) modelo.getValueAt(fila, 0);
        String nombre = (String) modelo.getValueAt(fila, 1);
        int confirm = JOptionPane.showConfirmDialog(this,
                "Eliminar la carrera \"" + nombre + "\"?", "Confirmar eliminacion",
                JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
        if (confirm == JOptionPane.YES_OPTION) {
            boolean ok = dao.eliminar(id);
            JOptionPane.showMessageDialog(this, ok ? "Carrera eliminada." : "Error al eliminar.");
            cargarDatos();
        }
    }
}
