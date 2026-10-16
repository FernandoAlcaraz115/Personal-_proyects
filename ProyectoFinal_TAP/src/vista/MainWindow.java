package vista;

import javax.swing.*;
import java.awt.*;

public class MainWindow extends JFrame {

    public MainWindow() {
        setTitle("Sistema de Control Escolar - ITM");
        setSize(1050, 680);
        setMinimumSize(new Dimension(850, 550));
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        getContentPane().setBackground(UITheme.FONDO);

        add(crearHeader(), BorderLayout.NORTH);
        add(crearTabs(),   BorderLayout.CENTER);
        add(crearFooter(), BorderLayout.SOUTH);

        setVisible(true);
    }

    private JPanel crearHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(UITheme.AZUL_OSCURO);
        header.setPreferredSize(new Dimension(0, 65));
        header.setBorder(BorderFactory.createEmptyBorder(0, 20, 0, 20));

        JLabel titulo = new JLabel("Sistema de Control Escolar");
        titulo.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titulo.setForeground(Color.WHITE);

        JLabel institicion = new JLabel("Instituto Tecnologico de Morelia");
        institicion.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        institicion.setForeground(new Color(197, 202, 233));
        institicion.setHorizontalAlignment(SwingConstants.RIGHT);

        header.add(titulo,     BorderLayout.WEST);
        header.add(institicion, BorderLayout.EAST);
        return header;
    }

    private JTabbedPane crearTabs() {
        JTabbedPane tabs = new JTabbedPane(JTabbedPane.TOP);
        tabs.setFont(new Font("Segoe UI", Font.BOLD, 13));
        tabs.setBackground(UITheme.AZUL_CLARO);
        tabs.setBorder(BorderFactory.createEmptyBorder(6, 6, 6, 6));

        tabs.addTab("  Carreras      ", new CarreraPanel());
        tabs.addTab("  Docentes      ", new DocentePanel());
        tabs.addTab("  Materias      ", new MateriaPanel());
        tabs.addTab("  Alumnos       ", new AlumnoPanel());
        tabs.addTab("  Inscripciones ", new InscripcionPanel());

        return tabs;
    }

    private JPanel crearFooter() {
        JPanel footer = new JPanel(new FlowLayout(FlowLayout.RIGHT, 16, 6));
        footer.setBackground(UITheme.AZUL_OSCURO);
        JLabel lbl = new JLabel("Control Escolar v1.0  |  PostgreSQL");
        lbl.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        lbl.setForeground(new Color(197, 202, 233));
        footer.add(lbl);
        return footer;
    }
}
