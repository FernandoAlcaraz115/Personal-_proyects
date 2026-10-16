public class Examen {

    public static void combinaciones(int limite, int serie, String mensaje) {

        for (int i = 1; i <= limite; i++) {

            for (int s = serie; s <= 2 * limite; s += serie) {

                for (int j = 0; j < mensaje.length(); j++) {

                    char c = mensaje.charAt(j);

                    if (c >= 'a' && c <= 'z') {
                        System.out.println("(" + i + "," + s + ",'" + c + "')");
                    }
                }
            }
        }
    }

    public static void main(String[] args) {
        combinaciones(5, 3, "Hi Tec");
    }
}