import javax.swing.*;
import java.awt.*;
import java.util.Random;

public class P7U3_Hilos3 extends JFrame {

    // ============================
    // COMPONENTES
    // ============================

    JButton btnIniciar;

    JLabel lbl1;
    JLabel lbl2;
    JLabel lbl3;

    JProgressBar barra1;
    JProgressBar barra2;
    JProgressBar barra3;

    // ============================
    // VARIABLES GLOBALES
    // ============================

    Random aleatorio = new Random();

    int n1 = 0;
    int n2 = 0;
    int n3 = 0;

    String primero = "";
    String segundo = "";
    String tercero = "";

    // ============================
    // CONSTRUCTOR
    // ============================

    public P7U3_Hilos3() {

        setTitle("P7U3_Hilos3");

        setSize(700, 400);

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        setLocationRelativeTo(null);

        setLayout(null);

        inicializarComponentes();

        setVisible(true);
    }

    // ============================
    // CREAR COMPONENTES
    // ============================

    private void inicializarComponentes() {

        JLabel titulo = new JLabel("CARRERA DE HILOS");

        titulo.setFont(new Font("Arial", Font.BOLD, 28));

        titulo.setBounds(200, 20, 350, 40);

        add(titulo);

        // ===================================
        // BOTÓN
        // ===================================

        btnIniciar = new JButton("INICIAR");

        btnIniciar.setBounds(270, 80, 120, 40);

        add(btnIniciar);

        // ===================================
        // LABELS
        // ===================================

        lbl1 = new JLabel("0%");

        lbl1.setBounds(100, 150, 100, 30);

        lbl1.setFont(new Font("Arial", Font.BOLD, 18));

        add(lbl1);

        lbl2 = new JLabel("0%");

        lbl2.setBounds(300, 150, 100, 30);

        lbl2.setFont(new Font("Arial", Font.BOLD, 18));

        add(lbl2);

        lbl3 = new JLabel("0%");

        lbl3.setBounds(500, 150, 100, 30);

        lbl3.setFont(new Font("Arial", Font.BOLD, 18));

        add(lbl3);

        // ===================================
        // BARRAS
        // ===================================

        barra1 = new JProgressBar();

        barra1.setBounds(50, 200, 150, 30);

        barra1.setMaximum(100);

        barra1.setStringPainted(true);

        add(barra1);

        barra2 = new JProgressBar();

        barra2.setBounds(250, 200, 150, 30);

        barra2.setMaximum(100);

        barra2.setStringPainted(true);

        add(barra2);

        barra3 = new JProgressBar();

        barra3.setBounds(450, 200, 150, 30);

        barra3.setMaximum(100);

        barra3.setStringPainted(true);

        add(barra3);

        // ===================================
        // EVENTO BOTÓN
        // ===================================

        btnIniciar.addActionListener(e -> iniciarCarrera());
    }

    // ============================
    // MÉTODO INICIAR
    // ============================

    private void iniciarCarrera() {

        // Reiniciar valores

        n1 = 0;
        n2 = 0;
        n3 = 0;

        primero = "";
        segundo = "";
        tercero = "";

        lbl1.setText("0%");
        lbl2.setText("0%");
        lbl3.setText("0%");

        barra1.setValue(0);
        barra2.setValue(0);
        barra3.setValue(0);

        // Crear objetos Runnable

        Barra1 objeto1 = new Barra1();

        Barra2 objeto2 = new Barra2();

        Barra3 objeto3 = new Barra3();

        // Crear hilos

        Thread hilo1 = new Thread(objeto1);

        Thread hilo2 = new Thread(objeto2);

        Thread hilo3 = new Thread(objeto3);

        // Iniciar hilos

        hilo1.start();

        hilo2.start();

        hilo3.start();
    }

    // ============================
    // MÉTODO DORMIR
    // ============================

    public void dormir() {

        try {

            Thread.sleep(100);

        } catch (InterruptedException e) {

            e.printStackTrace();
        }
    }

    // ============================
    // CLASE BARRA 1
    // ============================

    public class Barra1 implements Runnable {

        @Override
        public void run() {

            while (n1 <= 100) {

                lbl1.setText(n1 + "%");

                barra1.setValue(n1);

                n1 += aleatorio.nextInt(5);

                dormir();
            }

            barra1.setValue(100);

            lbl1.setText("100%");

            verificarLugar("Barra 1");
        }
    }

    // ============================
    // CLASE BARRA 2
    // ============================

    public class Barra2 implements Runnable {

        @Override
        public void run() {

            while (n2 <= 100) {

                lbl2.setText(n2 + "%");

                barra2.setValue(n2);

                n2 += aleatorio.nextInt(5);

                dormir();
            }

            barra2.setValue(100);

            lbl2.setText("100%");

            verificarLugar("Barra 2");
        }
    }

    // ============================
    // CLASE BARRA 3
    // ============================

    public class Barra3 implements Runnable {

        @Override
        public void run() {

            while (n3 <= 100) {

                lbl3.setText(n3 + "%");

                barra3.setValue(n3);

                n3 += aleatorio.nextInt(5);

                dormir();
            }

            barra3.setValue(100);

            lbl3.setText("100%");

            verificarLugar("Barra 3");
        }
    }

    // ============================
    // VERIFICAR POSICIONES
    // ============================

    public synchronized void verificarLugar(String barra) {

        if (primero.equals("")) {

            primero = "1er Lugar: " + barra + "\n";

        } else if (segundo.equals("")) {

            segundo = "2do Lugar: " + barra + "\n";

        } else if (tercero.equals("")) {

            tercero = "3er Lugar: " + barra + "\n";

            JOptionPane.showMessageDialog(
                    null,
                    primero + segundo + tercero,
                    "RESULTADOS",
                    JOptionPane.INFORMATION_MESSAGE
            );
        }
    }

    // ============================
    // MAIN
    // ============================

    public static void main(String[] args) {

        new P7U3_Hilos3();
    }
}