"""
escenarios.py
Catálogo de Escenarios de Prueba y Casos de Uso para el Aire Acondicionado.

Cubre todos los requerimientos de simulación y aprendizaje:
1. Histéresis y modulación Inverter óptima.
2. Falla mecánica del ventilador (bajas revoluciones y lentitud de enfriamiento).
3. Compresor sin gas refrigerante y alerta de mantenimiento.
4. Falla del sensor de temperatura (circuito abierto y lecturas anómalas).
5. Sobreesfuerzo térmico: entrada masiva de personas y puerta abierta.
6. Centro de datos (Datacenter) con servidores tipo Blade.
"""

from ambiente import AmbienteTermico, ConfiguracionRecinto
from dispositivos import SensorTemperaturaSimulado, VentiladorSimulado, CompresorSimulado
from controlador import ControladorAireAcondicionado
from simulador import SimuladorAC


def crear_escenario_normal(pausa: float = 0.02) -> SimuladorAC:
    """
    Caso 1: Operación Normal (Histéresis e Inverter).
    Objetivo: Demostrar cómo el sistema enfría desde 28.5°C hasta 25°C,
    modula el compresor para ahorrar energía, y al llegar al umbral inferior
    de histéresis (24.2°C) apaga el compresor para darle descanso al equipo.
    """
    config = ConfiguracionRecinto(
        area_m2=20.0,
        altura_m=2.5,
        personas=2,
        puerta_abierta=False,
        ventana_abierta=False,
        temperatura_exterior=32.0
    )
    ambiente = AmbienteTermico(config, temp_inicial=28.5)
    sim = SimuladorAC(ambiente=ambiente)
    return sim


def crear_escenario_falla_ventilador(pausa: float = 0.02) -> SimuladorAC:
    """
    Caso 2: Ventilador con bajas revoluciones por daño mecánico.
    Objetivo: El ventilador está encendido pero solo entrega una fracción de sus RPM
    debido a fricción en rodamientos. Se observa que tarda mucho más en enfriar
    y el controlador emite una alerta por tacómetro.
    """
    config = ConfiguracionRecinto(
        area_m2=22.0,
        altura_m=2.5,
        personas=2,
        temperatura_exterior=33.0
    )
    ambiente = AmbienteTermico(config, temp_inicial=29.0)
    vent = VentiladorSimulado()
    sim = SimuladorAC(ambiente=ambiente, ventilador=vent)

    # En el segundo 15 se produce desgaste mecánico severo (pierde 65% de velocidad)
    def degradar_ventilador(s: SimuladorAC):
        s.ventilador.provocar_degradacion(0.65)

    sim.programar_evento(15, degradar_ventilador, "Fricción mecánica en rodamientos del ventilador (-65% RPM)")
    return sim


def crear_escenario_compresor_sin_gas(pausa: float = 0.02) -> SimuladorAC:
    """
    Caso 3: Compresor sin gas refrigerante (Alerta de Mantenimiento).
    Objetivo: El compresor funciona y el ventilador recircula aire, pero al no haber
    gas refrigerante (fuga), no hay absorción de calor. El controlador detecta
    que la temperatura no desciende y la presión cae, generando ALERTA DE MANTENIMIENTO.
    """
    config = ConfiguracionRecinto(
        area_m2=25.0,
        altura_m=2.6,
        personas=2,
        temperatura_exterior=34.0
    )
    ambiente = AmbienteTermico(config, temp_inicial=30.0)
    comp = CompresorSimulado()
    sim = SimuladorAC(ambiente=ambiente, compresor=comp)

    # En el segundo 10 ocurre una fuga rápida de refrigerante
    def iniciar_fuga(s: SimuladorAC):
        s.compresor.provocar_fuga_gas(porcentaje_por_segundo=3.5)

    sim.programar_evento(10, iniciar_fuga, "Fuga súbita de gas refrigerante en circuito frigorífico")
    return sim


def crear_escenario_falla_sensor_temperatura(pausa: float = 0.02) -> SimuladorAC:
    """
    Caso 4: Falla del sensor de temperatura.
    Objetivo: El sensor de temperatura sufre desconexión (circuito abierto).
    El controlador entra en modo seguro de parada para evitar congelamiento de serpentín.
    """
    config = ConfiguracionRecinto(
        area_m2=20.0,
        altura_m=2.5,
        personas=1,
        temperatura_exterior=31.0
    )
    ambiente = AmbienteTermico(config, temp_inicial=28.0)
    sensor = SensorTemperaturaSimulado()
    sim = SimuladorAC(ambiente=ambiente, sensor=sensor)

    # En el segundo 20 el sensor se desconecta
    def desconectar_sensor(s: SimuladorAC):
        s.sensor.provocar_falla_desconexion(True)

    sim.programar_evento(20, desconectar_sensor, "Desconexión física del sensor de temperatura")
    return sim


def crear_escenario_sobreesfuerzo_puerta_y_personas(pausa: float = 0.02) -> SimuladorAC:
    """
    Caso 5: Sobreesfuerzo por puerta abierta y llegada de múltiples personas.
    Objetivo: Demostrar el impacto de perturbaciones térmicas no consideradas.
    En el segundo 15 ingresan 8 personas adicionales (total 10 personas).
    En el segundo 30 se deja la puerta abierta al exterior caliente.
    """
    config = ConfiguracionRecinto(
        area_m2=25.0,
        altura_m=2.6,
        personas=2,
        puerta_abierta=False,
        temperatura_exterior=36.0
    )
    ambiente = AmbienteTermico(config, temp_inicial=27.5)
    sim = SimuladorAC(ambiente=ambiente)

    def entrar_personas(s: SimuladorAC):
        s.ambiente.set_personas(10)

    def abrir_puerta(s: SimuladorAC):
        s.ambiente.set_puerta(True)

    sim.programar_evento(15, entrar_personas, "Entran 8 personas a la sala (Total: 10 personas)")
    sim.programar_evento(30, abrir_puerta, "Dejan la puerta exterior completamente ABIERTA")
    return sim


def crear_escenario_datacenter_blade(pausa: float = 0.02) -> SimuladorAC:
    """
    Caso 6: Cuarto de Datacenter con servidores Blade.
    Objetivo: Un centro de cómputo con múltiples servidores blade genera miles de Watts
    de calor continuo (ej. 4 chasis blade = 10,000 W). El equipo de A/C trabaja a
    máxima demanda continua para contener la temperatura.
    """
    config = ConfiguracionRecinto(
        area_m2=35.0,
        altura_m=3.0,
        personas=0,
        es_datacenter=True,
        servidores_blade_activos=3,  # 3 chasis blade x 2500W = 7500 Watts constantes
        temperatura_exterior=32.0
    )
    ambiente = AmbienteTermico(config, temp_inicial=26.0)
    # Compresor de alta capacidad para datacenter (36000 BTU)
    comp = CompresorSimulado(potencia_frigorifica_max_btu=36000.0)
    sim = SimuladorAC(ambiente=ambiente, compresor=comp)

    # En el segundo 25 se enciende un chasis blade adicional por carga de procesamiento pico
    def activar_mas_servidores(s: SimuladorAC):
        s.ambiente.config.servidores_blade_activos = 5  # Sube a 12500 Watts de carga

    sim.programar_evento(25, activar_mas_servidores, "Aumento de carga en Datacenter (+2 Chasis Blade encendidos)")
    return sim
