import javax.swing.*;
import java.awt.*;
import java.time.LocalTime;
import java.util.LinkedList;
import java.util.Queue;

public class P6U3_prodcons extends JFrame {

    // =========================
    // COMPONENTES DE LA GUI
    // =========================

    private JProgressBar barProd1;
    private JProgressBar barProd2;
    private JProgressBar barConsumidor;

    private JProgressBar barBuffer;

    private JSpinner spCapacidad;

    private JTextArea areaLog;

    private JButton btnStartP1;
    private JButton btnStopP1;

    private JButton btnStartP2;
    private JButton btnStopP2;

    private JButton btnStartC;
    private JButton btnStopC;

    // =========================
    // BUFFER COMPARTIDO
    // =========================

    private Buffer buffer;

    // =========================
    // HILOS
    // =========================

    private Productor productor1;
    private Productor productor2;
    private Consumidor consumidor;

    // =========================
    // CONSTRUCTOR
    // =========================

    public P6U3_prodcons() {

        setTitle("SIMULADOR DE MULTI-HILOS DE PRODUCTORES Y CONSUMIDOR");

        setSize(900, 600);

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        setLocationRelativeTo(null);

        setLayout(null);

        inicializarComponentes();

        setVisible(true);
    }

    // =========================
    // CREAR COMPONENTES
    // =========================

    private void inicializarComponentes() {

        JLabel titulo = new JLabel("SIMULADOR DE MULTI-HILOS DE PRODUCTORES Y CONSUMIDOR");

        titulo.setBounds(20, 20, 600, 30);

        titulo.setFont(new Font("Arial", Font.BOLD, 18));

        add(titulo);

        // =====================================================
        // PANEL PRODUCTOR 1
        // =====================================================

        JPanel panelP1 = new JPanel();

        panelP1.setLayout(null);

        panelP1.setBorder(BorderFactory.createTitledBorder("Productor 1"));

        panelP1.setBounds(20, 70, 220, 180);

        add(panelP1);

        barProd1 = new JProgressBar(0, 99);

        barProd1.setBounds(15, 40, 180, 30);

        barProd1.setStringPainted(true);

        barProd1.setString("En espera...");

        panelP1.add(barProd1);

        btnStartP1 = new JButton("Start");

        btnStartP1.setBounds(20, 100, 80, 30);

        panelP1.add(btnStartP1);

        btnStopP1 = new JButton("Stop");

        btnStopP1.setBounds(110, 100, 80, 30);

        panelP1.add(btnStopP1);

        // =====================================================
        // PANEL PRODUCTOR 2
        // =====================================================

        JPanel panelP2 = new JPanel();

        panelP2.setLayout(null);

        panelP2.setBorder(BorderFactory.createTitledBorder("Productor 2"));

        panelP2.setBounds(260, 70, 220, 180);

        add(panelP2);

        barProd2 = new JProgressBar(0, 99);

        barProd2.setBounds(15, 40, 180, 30);

        barProd2.setStringPainted(true);

        barProd2.setString("En espera...");

        panelP2.add(barProd2);

        btnStartP2 = new JButton("Start");

        btnStartP2.setBounds(20, 100, 80, 30);

        panelP2.add(btnStartP2);

        btnStopP2 = new JButton("Stop");

        btnStopP2.setBounds(110, 100, 80, 30);

        panelP2.add(btnStopP2);

        // =====================================================
        // PANEL CONSUMIDOR
        // =====================================================

        JPanel panelC = new JPanel();

        panelC.setLayout(null);

        panelC.setBorder(BorderFactory.createTitledBorder("Consumidor"));

        panelC.setBounds(520, 70, 220, 180);

        add(panelC);

        barConsumidor = new JProgressBar(0, 99);

        barConsumidor.setBounds(15, 40, 180, 30);

        barConsumidor.setStringPainted(true);

        barConsumidor.setString("En espera...");

        panelC.add(barConsumidor);

        btnStartC = new JButton("Start");

        btnStartC.setBounds(20, 100, 80, 30);

        panelC.add(btnStartC);

        btnStopC = new JButton("Stop");

        btnStopC.setBounds(110, 100, 80, 30);

        panelC.add(btnStopC);

        // =====================================================
        // BUFFER
        // =====================================================

        JLabel lblBuffer = new JLabel("TAMAÑO DEL BUFFER:");

        lblBuffer.setBounds(20, 290, 200, 30);

        lblBuffer.setFont(new Font("Arial", Font.BOLD, 16));

        add(lblBuffer);

        barBuffer = new JProgressBar(0, 5);

        barBuffer.setBounds(250, 290, 350, 30);

        barBuffer.setStringPainted(true);

        barBuffer.setString("0 / 5");

        barBuffer.setForeground(new Color(0, 180, 0));

        add(barBuffer);

        // =====================================================
        // CAPACIDAD
        // =====================================================

        JLabel lblCapacidad = new JLabel("CAPACIDAD MÁXIMA DEL BUFFER:");

        lblCapacidad.setBounds(20, 340, 320, 30);

        lblCapacidad.setFont(new Font("Arial", Font.BOLD, 16));

        add(lblCapacidad);

        spCapacidad = new JSpinner(new SpinnerNumberModel(5, 1, 20, 1));

        spCapacidad.setBounds(350, 340, 100, 30);

        add(spCapacidad);

        // =====================================================
        // ÁREA DE LOGS
        // =====================================================

        areaLog = new JTextArea();

        areaLog.setEditable(false);

        areaLog.setFont(new Font("Monospaced", Font.BOLD, 14));

        JScrollPane scroll = new JScrollPane(areaLog);

        scroll.setBounds(20, 400, 820, 140);

        add(scroll);

        // =====================================================
        // EVENTOS
        // =====================================================

        btnStartP1.addActionListener(e -> iniciarProductor1());

        btnStartP2.addActionListener(e -> iniciarProductor2());

        btnStartC.addActionListener(e -> iniciarConsumidor());

        btnStopP1.addActionListener(e -> detenerProductor1());

        btnStopP2.addActionListener(e -> detenerProductor2());

        btnStopC.addActionListener(e -> detenerConsumidor());

        // Crear buffer
        buffer = new Buffer((int) spCapacidad.getValue());

        spCapacidad.addChangeListener(e -> {
            boolean algunHiloActivo = (productor1 != null && productor1.isAlive())
                    || (productor2 != null && productor2.isAlive())
                    || (consumidor != null && consumidor.isAlive());
            if (algunHiloActivo) {
                agregarLog("Detén todos los hilos antes de cambiar la capacidad del buffer.");
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

    // =====================================================
    // CLASE BUFFER
    // =====================================================

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
                    return 0;
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

    // =====================================================
    // CLASE PRODUCTOR
    // =====================================================

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
        }
    }

    // =====================================================
    // CLASE CONSUMIDOR
    // =====================================================

    class Consumidor extends Thread {

        private volatile boolean ejecutar = true;

        public Consumidor() {

        }

        @Override
        public void run() {

            while (ejecutar) {

                int valor = buffer.consumir("Consumidor");

                if (!ejecutar) break;

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
        }
    }

    // =====================================================
    // MÉTODOS START
    // =====================================================

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

    // =====================================================
    // MÉTODOS STOP
    // =====================================================

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

    // =====================================================
    // ACTUALIZAR BUFFER
    // =====================================================

    private void actualizarBuffer() {

        SwingUtilities.invokeLater(() -> {

            int tam = buffer.tamano();
            int cap = buffer.getCapacidad();
            barBuffer.setMaximum(cap);
            barBuffer.setValue(tam);
            barBuffer.setString(tam + " / " + cap);
        });
    }

    // =====================================================
    // AGREGAR LOG
    // =====================================================

    private void agregarLog(String mensaje) {

        SwingUtilities.invokeLater(() -> {

            areaLog.append(
                    "[" + LocalTime.now().withNano(0) + "] "
                    + mensaje + "\n"
            );
        });
    }

    // =====================================================
    // MAIN
    // =====================================================

    public static void main(String[] args) {

        new P6U3_prodcons();
    }
}
