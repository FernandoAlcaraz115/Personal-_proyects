import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class U3_Examen extends JFrame {

    // ===========================
    // PAINT - COMPONENTES
    // ===========================

    private PanelDibujo panelDibujo;
    private JTextArea areaAcciones;

    // ===========================
    // HILOS - COMPONENTES
    // ===========================

    private JProgressBar barProd1;
    private JProgressBar barProd2;
    private JProgressBar barConsumidor;
    private JProgressBar barBuffer;

    private JSpinner spCapacidad;
    private JTextArea areaLog;

    private JButton btnStartP1, btnStopP1;
    private JButton btnStartP2, btnStopP2;
    private JButton btnStartC, btnStopC;

    // ===========================
    // HILOS - LÓGICA
    // ===========================

    private Buffer buffer;
    private Productor productor1;
    private Productor productor2;
    private Consumidor consumidor;

    private static final DateTimeFormatter FMT_COMPLETO =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter FMT_HORA =
            DateTimeFormatter.ofPattern("HH:mm:ss");

    // ===========================
    // CONSTRUCTOR
    // ===========================

    public U3_Examen() {
        setTitle("PAINT + PRODUCTOR-CONSUMIDOR");
        setSize(1200, 760);
        setResizable(false);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(null);

        inicializarPaint();
        inicializarHilos();

        buffer = new Buffer((int) spCapacidad.getValue());

        setVisible(true);
    }

    // ===========================
    // SECCIÓN PAINT (izquierda)
    // ===========================

    private void inicializarPaint() {

        JLabel lblPaint = new JLabel("PAINT");
        lblPaint.setFont(new Font("Arial", Font.BOLD, 16));
        lblPaint.setBounds(10, 10, 150, 30);
        add(lblPaint);

        panelDibujo = new PanelDibujo();
        panelDibujo.setBounds(10, 50, 590, 360);
        panelDibujo.setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY, 2));
        add(panelDibujo);

        JLabel lblAcciones = new JLabel("Registro de Acciones:");
        lblAcciones.setFont(new Font("Arial", Font.BOLD, 13));
        lblAcciones.setBounds(10, 420, 250, 25);
        add(lblAcciones);

        areaAcciones = new JTextArea();
        areaAcciones.setEditable(false);
        areaAcciones.setFont(new Font("Monospaced", Font.PLAIN, 12));
        areaAcciones.setBackground(Color.WHITE);

        JScrollPane scrollAcciones = new JScrollPane(areaAcciones);
        scrollAcciones.setBounds(10, 450, 590, 265);
        add(scrollAcciones);

        // -----------------------------------------------
        // Eventos del panel de dibujo
        // -----------------------------------------------

        panelDibujo.addMouseListener(new MouseAdapter() {

            @Override
            public void mouseEntered(MouseEvent e) {
                panelDibujo.setBackground(new Color(200, 230, 255));
                registrarAccion("ENTRÓ al panel", e.getX(), e.getY());
            }

            @Override
            public void mouseExited(MouseEvent e) {
                panelDibujo.setBackground(new Color(240, 240, 240));
                registrarAccion("SALIÓ del panel", e.getX(), e.getY());
            }

            @Override
            public void mouseClicked(MouseEvent e) {
                panelDibujo.dibujarPunto(e.getX(), e.getY());
                registrarAccion("CLICK - punto dibujado", e.getX(), e.getY());
            }

            @Override
            public void mousePressed(MouseEvent e) {
                panelDibujo.setUltimoPunto(e.getX(), e.getY());
            }
        });

        panelDibujo.addMouseMotionListener(new MouseMotionAdapter() {

            @Override
            public void mouseDragged(MouseEvent e) {
                panelDibujo.dibujarLinea(e.getX(), e.getY());
                registrarAccion("ARRASTRE - línea trazada", e.getX(), e.getY());
            }
        });
    }

    private void registrarAccion(String accion, int x, int y) {
        String ts = LocalDateTime.now().format(FMT_COMPLETO);
        areaAcciones.append("[" + ts + "] " + accion + " en (" + x + ", " + y + ")\n");
        areaAcciones.setCaretPosition(areaAcciones.getDocument().getLength());
    }

    // ===========================
    // SECCIÓN HILOS (derecha)
    // ===========================

    private void inicializarHilos() {

        JLabel lblHilos = new JLabel("HILOS PRODUCTOR-CONSUMIDOR");
        lblHilos.setFont(new Font("Arial", Font.BOLD, 16));
        lblHilos.setBounds(620, 10, 560, 30);
        add(lblHilos);

        // -----------------------------------------------
        // Panel Productor 1
        // -----------------------------------------------

        JPanel panelP1 = new JPanel(null);
        panelP1.setBorder(BorderFactory.createTitledBorder("Productor 1"));
        panelP1.setBounds(620, 50, 270, 155);
        add(panelP1);

        barProd1 = new JProgressBar(0, 99);
        barProd1.setBounds(15, 35, 240, 30);
        barProd1.setStringPainted(true);
        barProd1.setString("En espera...");
        panelP1.add(barProd1);

        btnStartP1 = new JButton("Start");
        btnStartP1.setBounds(20, 90, 105, 30);
        panelP1.add(btnStartP1);

        btnStopP1 = new JButton("Stop");
        btnStopP1.setBounds(140, 90, 105, 30);
        panelP1.add(btnStopP1);

        // -----------------------------------------------
        // Panel Productor 2
        // -----------------------------------------------

        JPanel panelP2 = new JPanel(null);
        panelP2.setBorder(BorderFactory.createTitledBorder("Productor 2"));
        panelP2.setBounds(905, 50, 270, 155);
        add(panelP2);

        barProd2 = new JProgressBar(0, 99);
        barProd2.setBounds(15, 35, 240, 30);
        barProd2.setStringPainted(true);
        barProd2.setString("En espera...");
        panelP2.add(barProd2);

        btnStartP2 = new JButton("Start");
        btnStartP2.setBounds(20, 90, 105, 30);
        panelP2.add(btnStartP2);

        btnStopP2 = new JButton("Stop");
        btnStopP2.setBounds(140, 90, 105, 30);
        panelP2.add(btnStopP2);

        // -----------------------------------------------
        // Panel Consumidor
        // -----------------------------------------------

        JPanel panelC = new JPanel(null);
        panelC.setBorder(BorderFactory.createTitledBorder("Consumidor"));
        panelC.setBounds(620, 215, 270, 155);
        add(panelC);

        barConsumidor = new JProgressBar(0, 99);
        barConsumidor.setBounds(15, 35, 240, 30);
        barConsumidor.setStringPainted(true);
        barConsumidor.setString("En espera...");
        panelC.add(barConsumidor);

        btnStartC = new JButton("Start");
        btnStartC.setBounds(20, 90, 105, 30);
        panelC.add(btnStartC);

        btnStopC = new JButton("Stop");
        btnStopC.setBounds(140, 90, 105, 30);
        panelC.add(btnStopC);

        // -----------------------------------------------
        // Barra de Buffer
        // -----------------------------------------------

        JLabel lblBuffer = new JLabel("BUFFER:");
        lblBuffer.setFont(new Font("Arial", Font.BOLD, 13));
        lblBuffer.setBounds(620, 385, 100, 28);
        add(lblBuffer);

        barBuffer = new JProgressBar(0, 5);
        barBuffer.setBounds(730, 385, 445, 28);
        barBuffer.setStringPainted(true);
        barBuffer.setString("0 / 5");
        barBuffer.setForeground(new Color(0, 180, 0));
        add(barBuffer);

        // -----------------------------------------------
        // Capacidad del buffer
        // -----------------------------------------------

        JLabel lblCap = new JLabel("CAPACIDAD MÁX:");
        lblCap.setFont(new Font("Arial", Font.BOLD, 13));
        lblCap.setBounds(620, 425, 200, 28);
        add(lblCap);

        spCapacidad = new JSpinner(new SpinnerNumberModel(5, 1, 20, 1));
        spCapacidad.setBounds(825, 425, 80, 28);
        add(spCapacidad);

        // -----------------------------------------------
        // Log de hilos
        // -----------------------------------------------

        JLabel lblLog = new JLabel("Log de Hilos:");
        lblLog.setFont(new Font("Arial", Font.BOLD, 13));
        lblLog.setBounds(620, 465, 200, 25);
        add(lblLog);

        areaLog = new JTextArea();
        areaLog.setEditable(false);
        areaLog.setFont(new Font("Monospaced", Font.PLAIN, 12));

        JScrollPane scrollLog = new JScrollPane(areaLog);
        scrollLog.setBounds(620, 495, 555, 215);
        add(scrollLog);

        // -----------------------------------------------
        // Eventos
        // -----------------------------------------------

        btnStartP1.addActionListener(e -> iniciarProductor1());
        btnStartP2.addActionListener(e -> iniciarProductor2());
        btnStartC.addActionListener(e -> iniciarConsumidor());
        btnStopP1.addActionListener(e -> detenerProductor1());
        btnStopP2.addActionListener(e -> detenerProductor2());
        btnStopC.addActionListener(e -> detenerConsumidor());

        spCapacidad.addChangeListener(e -> {
            boolean algunHiloActivo =
                    (productor1 != null && productor1.isAlive()) ||
                    (productor2 != null && productor2.isAlive()) ||
                    (consumidor != null && consumidor.isAlive());

            if (algunHiloActivo) {
                agregarLog("Detén todos los hilos antes de cambiar la capacidad.");
                spCapacidad.setValue(buffer.getCapacidad());
            } else {
                int nuevaCap = (int) spCapacidad.getValue();
                buffer = new Buffer(nuevaCap);
                barBuffer.setMaximum(nuevaCap);
                barBuffer.setValue(0);
                barBuffer.setString("0 / " + nuevaCap);
                agregarLog("Buffer recreado con capacidad: " + nuevaCap);
            }
        });
    }

    // ===========================
    // CLASE: PANEL DE DIBUJO
    // ===========================

    // ===========================
    // CLASE: TRAZO
    // ===========================

    enum TipoTrazo { PUNTO, LINEA }

    class Trazo {
        int x1, y1, x2, y2;
        TipoTrazo tipo;

        Trazo(TipoTrazo tipo, int x1, int y1, int x2, int y2) {
            this.tipo = tipo;
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
        }
    }

    // ===========================
    // CLASE: PANEL DE DIBUJO
    // ===========================

    class PanelDibujo extends JPanel {

        private List<Trazo> trazos = new ArrayList<>();
        private int lastX = -1, lastY = -1;
        private BufferedImage canvas;

        public PanelDibujo() {
            setBackground(new Color(240, 240, 240));
            setOpaque(true);
        }

        private BufferedImage getCanvas() {
            if (canvas == null || canvas.getWidth() != getWidth() || canvas.getHeight() != getHeight()) {
                BufferedImage nuevo = new BufferedImage(
                        Math.max(1, getWidth()), Math.max(1, getHeight()),
                        BufferedImage.TYPE_INT_ARGB);
                if (canvas != null) {
                    nuevo.getGraphics().drawImage(canvas, 0, 0, null);
                }
                canvas = nuevo;
            }
            return canvas;
        }

        private void dibujarEnCanvas(Trazo t) {
            Graphics2D g2 = getCanvas().createGraphics();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setColor(Color.BLACK);
            g2.setStroke(new BasicStroke(2.5f));
            if (t.tipo == TipoTrazo.PUNTO) {
                g2.fillOval(t.x1 - 4, t.y1 - 4, 8, 8);
            } else {
                g2.drawLine(t.x1, t.y1, t.x2, t.y2);
            }
            g2.dispose();
        }

        public void dibujarPunto(int x, int y) {
            Trazo t = new Trazo(TipoTrazo.PUNTO, x, y, -1, -1);
            trazos.add(t);
            dibujarEnCanvas(t);
            repaint();
        }

        public void setUltimoPunto(int x, int y) {
            lastX = x;
            lastY = y;
        }

        public void dibujarLinea(int x, int y) {
            if (lastX != -1 && lastY != -1) {
                Trazo t = new Trazo(TipoTrazo.LINEA, lastX, lastY, x, y);
                trazos.add(t);
                dibujarEnCanvas(t);
                repaint();
            }
            lastX = x;
            lastY = y;
        }

        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            if (canvas != null) {
                g.drawImage(canvas, 0, 0, null);
            }
        }
    }

    // ===========================
    // CLASE: BUFFER
    // ===========================

    class Buffer {

        private Queue<Integer> cola = new LinkedList<>();
        private int capacidad;

        public Buffer(int capacidad) {
            this.capacidad = capacidad;
        }

        public synchronized void producir(int valor, String nombre) {
            while (cola.size() == capacidad) {
                try {
                    agregarLog(nombre + " esperando... BUFFER LLENO");
                    wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
            cola.add(valor);
            actualizarBuffer();
            agregarLog(nombre + " produjo: " + valor);
            notifyAll();
        }

        public synchronized int consumir(String nombre) {
            while (cola.isEmpty()) {
                try {
                    agregarLog(nombre + " esperando... BUFFER VACÍO");
                    wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return -1;
                }
            }
            int valor = cola.poll();
            actualizarBuffer();
            agregarLog(nombre + " consumió: " + valor);
            notifyAll();
            return valor;
        }

        public synchronized int tamano() {
            return cola.size();
        }

        public synchronized int getCapacidad() {
            return capacidad;
        }
    }

    // ===========================
    // CLASE: PRODUCTOR
    // ===========================

    class Productor extends Thread {

        private volatile boolean ejecutar = true;
        private String nombre;
        private JProgressBar barra;

        public Productor(String nombre, JProgressBar barra) {
            this.nombre = nombre;
            this.barra = barra;
        }

        @Override
        public void run() {
            while (ejecutar) {
                int numero = (int) (Math.random() * 100);
                buffer.producir(numero, nombre);
                SwingUtilities.invokeLater(() -> {
                    barra.setValue(numero);
                    barra.setString("Produciendo: " + numero);
                });
                try {
                    sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            SwingUtilities.invokeLater(() -> {
                barra.setValue(0);
                barra.setString("DETENIDO");
            });
        }

        public void detener() {
            ejecutar = false;
            interrupt();
            // Despierta hilos bloqueados en wait() dentro del buffer
            if (buffer != null) {
                synchronized (buffer) { buffer.notifyAll(); }
            }
        }
    }

    // ===========================
    // CLASE: CONSUMIDOR
    // ===========================

    class Consumidor extends Thread {

        private volatile boolean ejecutar = true;

        @Override
        public void run() {
            while (ejecutar) {
                int valor = buffer.consumir("Consumidor");
                if (!ejecutar) break;
                if (valor < 0) continue;
                SwingUtilities.invokeLater(() -> {
                    barConsumidor.setValue(valor);
                    barConsumidor.setString("Consumido: " + valor);
                });
                try {
                    sleep(1500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            SwingUtilities.invokeLater(() -> {
                barConsumidor.setValue(0);
                barConsumidor.setString("DETENIDO");
            });
        }

        public void detener() {
            ejecutar = false;
            interrupt();
            // Despierta hilos bloqueados en wait() dentro del buffer
            if (buffer != null) {
                synchronized (buffer) { buffer.notifyAll(); }
            }
        }
    }

    // ===========================
    // MÉTODOS: INICIAR HILOS
    // ===========================

    private void iniciarProductor1() {
        if (productor1 == null || !productor1.isAlive()) {
            productor1 = new Productor("Productor 1", barProd1);
            productor1.start();
            agregarLog("Productor 1 INICIADO");
        }
    }

    private void iniciarProductor2() {
        if (productor2 == null || !productor2.isAlive()) {
            productor2 = new Productor("Productor 2", barProd2);
            productor2.start();
            agregarLog("Productor 2 INICIADO");
        }
    }

    private void iniciarConsumidor() {
        if (consumidor == null || !consumidor.isAlive()) {
            consumidor = new Consumidor();
            consumidor.start();
            agregarLog("Consumidor INICIADO");
        }
    }

    // ===========================
    // MÉTODOS: DETENER HILOS
    // ===========================

    private void detenerProductor1() {
        if (productor1 != null) {
            productor1.detener();
            agregarLog("Productor 1 DETENIDO");
        }
    }

    private void detenerProductor2() {
        if (productor2 != null) {
            productor2.detener();
            agregarLog("Productor 2 DETENIDO");
        }
    }

    private void detenerConsumidor() {
        if (consumidor != null) {
            consumidor.detener();
            agregarLog("Consumidor DETENIDO");
        } 
    }

    // ===========================
    // MÉTODOS: UTILIDADES
    // ===========================

    private void actualizarBuffer() {
        SwingUtilities.invokeLater(() -> {
            int tam = buffer.tamano();
            int cap = buffer.getCapacidad();
            barBuffer.setMaximum(cap);
            barBuffer.setValue(tam);
            barBuffer.setString(tam + " / " + cap);
        });
    }

    private void agregarLog(String mensaje) {
        SwingUtilities.invokeLater(() -> {
            String ts = "[" + LocalDateTime.now().format(FMT_HORA) + "] ";
            areaLog.append(ts + mensaje + "\n");
            areaLog.setCaretPosition(areaLog.getDocument().getLength());
        });
    }

    // ===========================
    // MAIN
    // ===========================

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new U3_Examen());
    }
}