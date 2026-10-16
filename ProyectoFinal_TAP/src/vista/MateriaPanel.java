package vista;

import dao.MateriaDAO;
import modelo.Materia;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class MateriaPanel extends JPanel {

    private final MateriaDAO dao = new MateriaDAO();
    private final DefaultTableModel modelo;
    private final JTable tabla;

    public MateriaPanel() {
        setLayout(new BorderLayout(0, 0));
        setBackground(UITheme.FONDO);

        String[] columnas = {"ID", "Nombre de la Materia", "Creditos", "ID Docente"};
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

        add(UITheme.encabezadoPanel("Materias", "Gestion de Materias", "Catalogo de materias por docente"), BorderLayout.NORTH);
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
        List<Materia> lista = dao.obtenerTodos();
        for (Materia m : lista)
            modelo.addRow(new Object[]{m.getIdMateria(), m.getNombreMateria(), m.getCreditos(), m.getIdDocente()});
    }

    private void agregar() {
        String nombre = JOptionPane.showInputDialog(this, "Nombre de la materia:");
        if (nombre == null || nombre.isBlank()) return;
        String credStr = JOptionPane.showInputDialog(this, "Creditos:");
        if (credStr == null) return;
        String iddStr = JOptionPane.showInputDialog(this, "ID Docente:");
        if (iddStr == null) return;
        try {
            int cred = Integer.parseInt(credStr.trim());
            int idd  = Integer.parseInt(iddStr.trim());
            boolean ok = dao.insertar(new Materia(nombre.trim(), cred, idd));
            JOptionPane.showMessageDialog(this, ok ? "Materia agregada correctamente." : "Error al agregar.");
            cargarDatos();
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Creditos e ID Docente deben ser numeros enteros.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void actualizar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona una materia de la tabla."); return; }
        int id = (int) modelo.getValueAt(fila, 0);
        Materia m = dao.obtenerPorId(id);
        if (m == null) return;

        String nombre = JOptionPane.showInputDialog(this, "Nuevo nombre:", m.getNombreMateria());
        if (nombre == null) return;
        String credStr = JOptionPane.showInputDialog(this, "Creditos:", m.getCreditos());
        if (credStr == null) return;
        String iddStr = JOptionPane.showInputDialog(this, "ID Docente:", m.getIdDocente());
        if (iddStr == null) return;
        try {
            if (!nombre.isBlank()) m.setNombreMateria(nombre.trim());
            m.setCreditos(Integer.parseInt(credStr.trim()));
            m.setIdDocente(Integer.parseInt(iddStr.trim()));
            boolean ok = dao.actualizar(m);
            JOptionPane.showMessageDialog(this, ok ? "Materia actualizada." : "Error al actualizar.");
            cargarDatos();
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Creditos e ID Docente deben ser numeros enteros.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void eliminar() {
        int fila = tabla.getSelectedRow();
        if (fila == -1) { JOptionPane.showMessageDialog(this, "Selecciona una materia de la tabla."); return; }
        int id = (int) modelo.getValueAt(fila, 0);
        String nombre = (String) modelo.getValueAt(fila, 1);
        int confirm = JOptionPane.showConfirmDialog(this,
                "Eliminar la materia \"" + nombre + "\"?", "Confirmar eliminacion",
                JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE);
        if (confirm == JOptionPane.YES_OPTION) {
            boolean ok = dao.eliminar(id);
            JOptionPane.showMessageDialog(this, ok ? "Materia eliminada." : "Error al eliminar.");
            cargarDatos();
        }
    }
}
