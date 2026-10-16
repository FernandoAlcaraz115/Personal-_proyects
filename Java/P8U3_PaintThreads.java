import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class P8U3_PaintThreads extends JFrame {

    // =========================================
    // ÁREA DE DIBUJO
    // =========================================

    private JPanel panelDibujo;

    private JTextArea areaLogs;

    // Coordenadas anteriores para dibujar líneas
    private int xAnterior;
    private int yAnterior;

    // =========================================
    // BARRAS DE PROGRESO
    // =========================================

    private JProgressBar barraP1;
    private JProgressBar barraP2;
    private JProgressBar barraC;

    // =========================================
    // HILOS
    // =========================================

    private Productor productor1;
    private Productor productor2;
    private Consumidor consumidor;

    // =========================================
    // RANDOM
    // =========================================

    private Random random = new Random();

    // =========================================
    // CONSTRUCTOR
    // =========================================

    public P8U3_PaintThreads() {

        setTitle("P8U3 Paint + Threads");

        setSize(1100, 700);

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        setLocationRelativeTo(null);

        setLayout(null);

        iniciarComponentes();

        setVisible(true);
    }

    // =========================================
    // COMPONENTES
    // =========================================

    private void iniciarComponentes() {

        // =====================================
        // TÍTULO
        // =====================================

        JLabel titulo = new JLabel("PAINT + PRODUCTOR/CONSUMIDOR");

        titulo.setFont(new Font("Arial", Font.BOLD, 24));

        titulo.setBounds(300, 10, 500, 40);

        add(titulo);

        // =====================================
        // PANEL DE DIBUJO
        // =====================================

        panelDibujo = new JPanel();

        panelDibujo.setBounds(30, 70, 600, 400);

        panelDibujo.setBackground(Color.WHITE);

        panelDibujo.setBorder(BorderFactory.createLineBorder(Color.BLACK, 3));

        add(panelDibujo);

        // =====================================
        // LOGS
        // =====================================

        areaLogs = new JTextArea();

        areaLogs.setEditable(false);

        areaLogs.setFont(new Font("Monospaced", Font.PLAIN, 13));

        JScrollPane scroll = new JScrollPane(areaLogs);

        scroll.setBounds(30, 500, 1000, 130);

        add(scroll);

        // =====================================
        // EVENTOS DEL MOUSE
        // =====================================

        panelDibujo.addMouseListener(new MouseAdapter() {

            // =================================
            // ENTRAR AL PANEL
            // =================================

            @Override
            public void mouseEntered(MouseEvent e) {

                panelDibujo.setBackground(new Color(220, 255, 220));

                registrar(
                        "Mouse Entró",
                        e.getX(),
                        e.getY()
                );
            }

            // =================================
            // SALIR DEL PANEL
            // =================================

            @Override
            public void mouseExited(MouseEvent e) {

                panelDibujo.setBackground(Color.WHITE);

                registrar(
                        "Mouse Salió",
                        e.getX(),
                        e.getY()
                );
            }

            // =================================
            // CLICK
            // =================================

            @Override
            public void mousePressed(MouseEvent e) {

                Graphics g = panelDibujo.getGraphics();

                g.setColor(Color.RED);

                g.fillOval(e.getX(), e.getY(), 8, 8);

                xAnterior = e.getX();

                yAnterior = e.getY();

                registrar(
                        "Click",
                        e.getX(),
                        e.getY()
                );
            }
        });

        // =====================================
        // DRAG
        // =====================================

        panelDibujo.addMouseMotionListener(new MouseMotionAdapter() {

            @Override
            public void mouseDragged(MouseEvent e) {

                Graphics g = panelDibujo.getGraphics();

                g.setColor(Color.BLUE);

                g.drawLine(
                        xAnterior,
                        yAnterior,
                        e.getX(),
                        e.getY()
                );

                xAnterior = e.getX();

                yAnterior = e.getY();

                registrar(
                        "Arrastre",
                        e.getX(),
                        e.getY()
                );
            }
        });

        // =====================================
        // PANEL HILOS
        // =====================================

        JPanel panelHilos = new JPanel();

        panelHilos.setLayout(null);

        panelHilos.setBounds(680, 70, 320, 400);

        panelHilos.setBorder(
                BorderFactory.createTitledBorder("PRODUCTOR / CONSUMIDOR")
        );

        add(panelHilos);

        // =====================================
        // PRODUCTOR 1
        // =====================================

        JLabel lblP1 = new JLabel("Productor 1");

        lblP1.setBounds(20, 30, 120, 25);

        panelHilos.add(lblP1);

        barraP1 = new JProgressBar();

        barraP1.setBounds(20, 60, 250, 25);

        barraP1.setStringPainted(true);

        panelHilos.add(barraP1);

        JButton btnStartP1 = new JButton("Start");

        btnStartP1.setBounds(20, 100, 100, 30);

        panelHilos.add(btnStartP1);

        JButton btnStopP1 = new JButton("Stop");

        btnStopP1.setBounds(140, 100, 100, 30);

        panelHilos.add(btnStopP1);

        // =====================================
        // PRODUCTOR 2
        // =====================================

        JLabel lblP2 = new JLabel("Productor 2");

        lblP2.setBounds(20, 160, 120, 25);

        panelHilos.add(lblP2);

        barraP2 = new JProgressBar();

        barraP2.setBounds(20, 190, 250, 25);

        barraP2.setStringPainted(true);

        panelHilos.add(barraP2);

        JButton btnStartP2 = new JButton("Start");

        btnStartP2.setBounds(20, 230, 100, 30);

        panelHilos.add(btnStartP2);

        JButton btnStopP2 = new JButton("Stop");

        btnStopP2.setBounds(140, 230, 100, 30);

        panelHilos.add(btnStopP2);

        // =====================================
        // CONSUMIDOR
        // =====================================

        JLabel lblC = new JLabel("Consumidor");

        lblC.setBounds(20, 290, 120, 25);

        panelHilos.add(lblC);

        barraC = new JProgressBar();

        barraC.setBounds(20, 320, 250, 25);

        barraC.setStringPainted(true);

        panelHilos.add(barraC);

        JButton btnStartC = new JButton("Start");

        btnStartC.setBounds(20, 360, 100, 30);

        panelHilos.add(btnStartC);

        JButton btnStopC = new JButton("Stop");

        btnStopC.setBounds(140, 360, 100, 30);

        panelHilos.add(btnStopC);

        // =====================================
        // EVENTOS BOTONES
        // =====================================

        btnStartP1.addActionListener(e -> iniciarP1());

        btnStopP1.addActionListener(e -> detenerP1());

        btnStartP2.addActionListener(e -> iniciarP2());

        btnStopP2.addActionListener(e -> detenerP2());

        btnStartC.addActionListener(e -> iniciarC());

        btnStopC.addActionListener(e -> detenerC());
    }

    // =========================================
    // REGISTRAR EVENTOS
    // =========================================

    private void registrar(String evento, int x, int y) {

        LocalDateTime ahora = LocalDateTime.now();

        DateTimeFormatter formato =
                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        areaLogs.append(
                "[" + ahora.format(formato) + "] "
                + evento
                + " -> Coordenadas: ("
                + x + ", " + y + ")\n"
        );
    }

    // =========================================
    // PRODUCTOR
    // =========================================

    class Productor extends Thread {

        private boolean ejecutar = true;

        private JProgressBar barra;

        public Productor(JProgressBar barra) {

            this.barra = barra;
        }

        @Override
        public void run() {

            int progreso = 0;

            while (ejecutar) {

                progreso += random.nextInt(10);

                if (progreso > 100) {

                    progreso = 0;
                }

                barra.setValue(progreso);

                try {

                    Thread.sleep(300);

                } catch (InterruptedException e) {

                    e.printStackTrace();
                }
            }
        }

        public void detener() {

            ejecutar = false;
        }
    }

    // =========================================
    // CONSUMIDOR
    // =========================================

    class Consumidor extends Thread {

        private boolean ejecutar = true;

        @Override
        public void run() {

            int progreso = 0;

            while (ejecutar) {

                progreso += random.nextInt(8);

                if (progreso > 100) {

                    progreso = 0;
                }

                barraC.setValue(progreso);

                try {

                    Thread.sleep(400);

                } catch (InterruptedException e) {

                    e.printStackTrace();
                }
            }
        }

        public void detener() {

            ejecutar = false;
        }
    }

    // =========================================
    // MÉTODOS START/STOP
    // =========================================

    private void iniciarP1() {

        if (productor1 == null || !productor1.isAlive()) {

            productor1 = new Productor(barraP1);

            productor1.start();
        }
    }

    private void detenerP1() {

        if (productor1 != null) {

            productor1.detener();
        }
    }

    private void iniciarP2() {

        if (productor2 == null || !productor2.isAlive()) {

            productor2 = new Productor(barraP2);

            productor2.start();
        }
    }

    private void detenerP2() {

        if (productor2 != null) {

            productor2.detener();
        }
    }

    private void iniciarC() {

        if (consumidor == null || !consumidor.isAlive()) {

            consumidor = new Consumidor();

            consumidor.start();
        }
    }

    private void detenerC() {

        if (consumidor != null) {

            consumidor.detener();
        }
    }

    // =========================================
    // MAIN
    // =========================================

    public static void main(String[] args) {

        new P8U3_PaintThreads();
    }
}
