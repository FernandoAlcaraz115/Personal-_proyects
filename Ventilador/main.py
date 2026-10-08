"""
main.py
Punto de Entrada Principal del Simulador de Aire Acondicionado Inverter.

Permite:
- Ejecutar interactivamente los escenarios de uso.
- Observar en tiempo real la histéresis, consumo, RPM y alertas.
- Configurar recintos personalizados con diferentes cargas térmicas.
- Pasar parámetros por línea de comando (ej: python main.py --scenario 1).
"""

import sys
import argparse
from ambiente import AmbienteTermico, ConfiguracionRecinto
from simulador import SimuladorAC
import escenarios
import unittest
import test_sistema


def menu_interactivo():
    while True:
        print("\n" + "=" * 65)
        print("  SISTEMA DE CONTROL DE AIRE ACONDICIONADO (TECNOLOGÍA INVERTER)")
        print("=" * 65)
        print(" Seleccione el modo de ejecución o escenario:\n")
        print(" [G] INICIAR INTERFAZ GRÁFICA (GUI con Ventilador Animado)")
        print(" [1] Operación Normal (Demostración de Histéresis e Inverter)")
        print(" [2] Falla Mecánica de Ventilador (Bajas RPM / Enfriamiento Lento)")
        print(" [3] Compresor sin Gas / Fuga -> ALERTA DE MANTENIMIENTO")
        print(" [4] Falla en Sensor de Temperatura (Desconexión / Modo Seguro)")
        print(" [5] Sobreesfuerzo: Llegada de Personas y Puerta Abierta")
        print(" [6] Caso Datacenter: Cuarto con Servidores Blade de Alta Densidad")
        print(" [7] Simulación Personalizada (Definir m², personas, ventanas...)")
        print(" [8] Ejecutar Pruebas Automatizadas (Unit Tests)")
        print(" [0] Salir")
        print("-" * 65)

        opcion = input(" Ingrese una opción [G, 0-8]: ").strip().lower()

        if opcion == "g":
            print("\nIniciando Interfaz Gráfica (GUI)...")
            import gui
            gui.iniciar_gui()

        elif opcion == "1":
            print("\nExplicación: Observa cómo el compresor arranca a alta potencia y al")
            print("acercarse a 25°C modula al mínimo, apagándose solo al tocar 24.2°C (histéresis).")
            sim = escenarios.crear_escenario_normal()
            sim.correr_simulacion(duracion_segundos=70, pausa_visual_seg=0.04, titulo="Caso 1: Operación Normal")

        elif opcion == "2":
            print("\nExplicación: El ventilador pierde revoluciones por desgaste mecánico.")
            print("El controlador detecta la discrepancia por tacómetro y emite advertencia.")
            sim = escenarios.crear_escenario_falla_ventilador()
            sim.correr_simulacion(duracion_segundos=60, pausa_visual_seg=0.04, titulo="Caso 2: Ventilador con Bajas RPM")

        elif opcion == "3":
            print("\nExplicación: Se produce una fuga de refrigerante en el circuito frigorífico.")
            print("El aire circula pero no enfría. Se dispara ALERTA DE MANTENIMIENTO.")
            sim = escenarios.crear_escenario_compresor_sin_gas()
            sim.correr_simulacion(duracion_segundos=60, pausa_visual_seg=0.04, titulo="Caso 3: Fuga de Gas y Alerta de Mantenimiento")

        elif opcion == "4":
            print("\nExplicación: El sensor se desconecta físicamente en el segundo 20.")
            print("El sistema detiene el compresor para evitar accidentes o congelamiento.")
            sim = escenarios.crear_escenario_falla_sensor_temperatura()
            sim.correr_simulacion(duracion_segundos=45, pausa_visual_seg=0.04, titulo="Caso 4: Falla de Sensor de Temperatura")

        elif opcion == "5":
            print("\nExplicación: Entran 8 personas más y se deja la puerta abierta.")
            print("La enorme infiltración de calor exterior somete al equipo a sobreesfuerzo.")
            sim = escenarios.crear_escenario_sobreesfuerzo_puerta_y_personas()
            sim.correr_simulacion(duracion_segundos=65, pausa_visual_seg=0.04, titulo="Caso 5: Sobreesfuerzo (Personas + Puerta Abierta)")

        elif opcion == "6":
            print("\nExplicación: Datacenter con 3 a 5 chasis blade (7,500W a 12,500W constantes).")
            print("Demuestra la respuesta del sistema ante calor industrial continuo.")
            sim = escenarios.crear_escenario_datacenter_blade()
            sim.correr_simulacion(duracion_segundos=60, pausa_visual_seg=0.04, titulo="Caso 6: Cuarto de Datacenter con Servidores Blade")

        elif opcion == "7":
            ejecutar_personalizado()

        elif opcion == "8":
            print("\nEjecutando pruebas unitarias...")
            suite = unittest.TestLoader().loadTestsFromModule(test_sistema)
            unittest.TextTestRunner(verbosity=2).run(suite)

        elif opcion == "0":
            print("\nFinalizando simulador. ¡Hasta pronto!\n")
            break
        else:
            print("\nOpción inválida. Intente de nuevo.")


def ejecutar_personalizado():
    print("\n" + "-" * 55)
    print(" CONFIGURACIÓN DEL RECINTO PERSONALIZADO")
    print("-" * 55)
    try:
        area = float(input(" Área de la habitación en m² [ej: 25.0]: ") or "25.0")
        personas = int(input(" Cantidad de personas presentes [ej: 2]: ") or "2")
        puerta = input(" ¿Puerta abierta? (s/n) [n]: ").strip().lower() == "s"
        ventana = input(" ¿Ventana abierta? (s/n) [n]: ").strip().lower() == "s"
        t_ext = float(input(" Temperatura exterior en °C [ej: 34.0]: ") or "34.0")
        t_ini = float(input(" Temperatura inicial interior en °C [ej: 29.0]: ") or "29.0")
        duracion = int(input(" Duración de simulación en segundos [ej: 60]: ") or "60")
    except ValueError:
        print(" Valor ingresado no válido. Usando valores predeterminados.")
        area, personas, puerta, ventana, t_ext, t_ini, duracion = 25.0, 2, False, False, 34.0, 29.0, 60

    config = ConfiguracionRecinto(
        area_m2=area,
        personas=personas,
        puerta_abierta=puerta,
        ventana_abierta=ventana,
        temperatura_exterior=t_ext
    )
    ambiente = AmbienteTermico(config, temp_inicial=t_ini)
    sim = SimuladorAC(ambiente=ambiente)
    sim.correr_simulacion(duracion_segundos=duracion, pausa_visual_seg=0.03, titulo="Simulación Personalizada")


def parsear_argumentos():
    parser = argparse.ArgumentParser(description="Simulador de Aire Acondicionado Inverter")
    parser.add_argument("--gui", action="store_true", help="Inicia la interfaz gráfica con ventilador animado")
    parser.add_argument("--scenario", type=int, choices=[1, 2, 3, 4, 5, 6], help="Ejecuta un escenario específico")
    parser.add_argument("--test", action="store_true", help="Corre las pruebas unitarias")
    parser.add_argument("--duration", type=int, default=50, help="Duración en segundos")
    parser.add_argument("--fast", action="store_true", help="Ejecuta sin pausas visuales de tiempo")
    return parser.parse_args()


if __name__ == "__main__":
    args = parsear_argumentos()
    pausa = 0.0 if args.fast else 0.03

    if args.gui:
        import gui
        gui.iniciar_gui()
        sys.exit(0)

    if args.test:
        suite = unittest.TestLoader().loadTestsFromModule(test_sistema)
        unittest.TextTestRunner(verbosity=2).run(suite)
        sys.exit(0)

    if args.scenario is not None:
        mapeo = {
            1: (escenarios.crear_escenario_normal, "Caso 1: Operación Normal"),
            2: (escenarios.crear_escenario_falla_ventilador, "Caso 2: Bajas RPM de Ventilador"),
            3: (escenarios.crear_escenario_compresor_sin_gas, "Caso 3: Fuga de Gas y Mantenimiento"),
            4: (escenarios.crear_escenario_falla_sensor_temperatura, "Caso 4: Falla de Sensor"),
            5: (escenarios.crear_escenario_sobreesfuerzo_puerta_y_personas, "Caso 5: Sobreesfuerzo"),
            6: (escenarios.crear_escenario_datacenter_blade, "Caso 6: Datacenter Blade")
        }
        creador, titulo = mapeo[args.scenario]
        sim = creador(pausa=pausa)
        sim.correr_simulacion(duracion_segundos=args.duration, pausa_visual_seg=pausa, titulo=titulo)
    else:
        menu_interactivo()
