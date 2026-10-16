package vista;

import javax.swing.*;
import javax.swing.table.*;
import java.awt.*;

public class UITheme {

    public static final Color AZUL_OSCURO  = new Color(26,  35,  126);
    public static final Color AZUL_MEDIO   = new Color(57,  73,  171);
    public static final Color AZUL_CLARO   = new Color(232, 234, 246);
    public static final Color FONDO        = new Color(245, 245, 250);
    public static final Color TEXTO        = new Color(33,  33,  33);
    public static final Color VERDE        = new Color(27,  94,  32);
    public static final Color NARANJA      = new Color(230, 81,  0);
    public static final Color ROJO         = new Color(183, 28,  28);
    public static final Color GRIS         = new Color(55,  71,  79);

    public static JButton boton(String texto, Color fondo) {
        JButton btn = new JButton(texto);
        btn.setBackground(fondo);
        btn.setForeground(Color.WHITE);
        btn.setFont(new Font("Segoe UI", Font.BOLD, 12));
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setOpaque(true);
        btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        btn.setPreferredSize(new Dimension(140, 36));
        return btn;
    }

    public static void estilizarTabla(JTable tabla) {
        tabla.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        tabla.setRowHeight(30);
        tabla.setShowGrid(false);
        tabla.setIntercellSpacing(new Dimension(0, 0));
        tabla.setSelectionBackground(new Color(197, 202, 233));
        tabla.setSelectionForeground(TEXTO);
        tabla.setBackground(Color.WHITE);
        tabla.setFillsViewportHeight(true);

        JTableHeader header = tabla.getTableHeader();
        header.setBackground(AZUL_OSCURO);
        header.setForeground(Color.WHITE);
        header.setFont(new Font("Segoe UI", Font.BOLD, 13));
        header.setPreferredSize(new Dimension(0, 38));
        header.setBorder(BorderFactory.createEmptyBorder());
        header.setReorderingAllowed(false);

        tabla.setDefaultRenderer(Object.class, new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(
                    JTable t, Object val, boolean sel, boolean foc, int row, int col) {
                super.getTableCellRendererComponent(t, val, sel, foc, row, col);
                if (!sel) setBackground(row % 2 == 0 ? Color.WHITE : new Color(240, 242, 255));
                setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 10));
                return this;
            }
        });
    }

    public static JPanel encabezadoPanel(String icono, String titulo, String subtitulo) {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(AZUL_MEDIO);
        panel.setPreferredSize(new Dimension(0, 52));
        panel.setBorder(BorderFactory.createEmptyBorder(0, 16, 0, 16));

        JLabel lblTitulo = new JLabel(icono + "  " + titulo);
        lblTitulo.setFont(new Font("Segoe UI", Font.BOLD, 15));
        lblTitulo.setForeground(Color.WHITE);

        JLabel lblSub = new JLabel(subtitulo);
        lblSub.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        lblSub.setForeground(new Color(197, 202, 233));
        lblSub.setHorizontalAlignment(SwingConstants.RIGHT);

        panel.add(lblTitulo, BorderLayout.WEST);
        panel.add(lblSub, BorderLayout.EAST);
        return panel;
    }

    public static JScrollPane scrollEstilizado(JTable tabla) {
        JScrollPane scroll = new JScrollPane(tabla);
        scroll.setBorder(BorderFactory.createLineBorder(new Color(197, 202, 233), 1));
        scroll.getViewport().setBackground(Color.WHITE);
        return scroll;
    }
}
