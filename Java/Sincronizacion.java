import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

// Clase principal
public class Sincronizacion {

    // RECURSO COMPARTIDO
    static class Recurso {

        private int dato;
        private boolean hayDato = false;

        // Método para CONSUMIR
        public synchronized int get() {

            while (!hayDato) {
                try {
                    wait(); // Espera a que el productor genere dato
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            hayDato = false;
            notify(); // Despierta al productor

            return dato;
        }

        // Método para PRODUCIR
        public synchronized void set(int valor) {

            while (hayDato) {
                try {
                    wait(); // Espera a que el consumidor lea
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            this.dato = valor;
            hayDato = true;

            notify(); // Despierta al consumidor
        }
    }

    // PRODUCTOR
    static class Productor extends Thread {

        private Recurso recurso;

        public Productor(Recurso r) {
            this.recurso = r;
        }

        public void run() {

            DateTimeFormatter formato = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");

            for (int i = 0; i < 10; i++) {

                recurso.set(i);

                String hora = LocalTime.now().format(formato);

                System.out.println("Productor - Valor: " + i);
                System.out.println("Hora de ejecución: " + hora);

                try {
                    Thread.sleep(800);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // CONSUMIDOR
    static class Consumidor extends Thread {

        private Recurso recurso;

        public Consumidor(Recurso r) {
            this.recurso = r;
        }

        public void run() {

            DateTimeFormatter formato = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");

            for (int i = 0; i < 10; i++) {

                int valor = recurso.get();

                String hora = LocalTime.now().format(formato);

                System.out.println("Consumidor - Valor: " + valor);
                System.out.println("Hora de ejecución: " + hora);

                try {
                    Thread.sleep(800);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // 🔹 MAIN
    public static void main(String[] args) {

        Recurso recurso = new Recurso();

        Productor p = new Productor(recurso);
        Consumidor c = new Consumidor(recurso);

        p.start();
        c.start();
    }
}