"""
test_sistema.py
Pruebas Unitarias y de Integración Automatizadas.

Verifica:
1. Lógica de Histéresis y control Inverter.
2. Detección de fallas del tacómetro del ventilador.
3. Detección de falta de gas refrigerante y alerta de mantenimiento.
4. Falla y desconexión del sensor de temperatura.
5. Impacto de cargas térmicas (área, personas, puertas abiertas y servidores blade).
"""

import unittest
from dispositivos import SensorTemperaturaSimulado, VentiladorSimulado, CompresorSimulado
from ambiente import AmbienteTermico, ConfiguracionRecinto
from controlador import ControladorAireAcondicionado, TipoAlerta, EstadoCompresor
from simulador import SimuladorAC


class TestSistemaAireAcondicionado(unittest.TestCase):

    def setUp(self):
        self.sensor = SensorTemperaturaSimulado(ruido_std=0.0)
        self.ventilador = VentiladorSimulado()
        self.compresor = CompresorSimulado()
        self.controlador = ControladorAireAcondicionado(
            sensor_temp=self.sensor,
            ventilador=self.ventilador,
            compresor=self.compresor,
            temperatura_deseada=25.0,
            histeresis_delta=0.8
        )

    def test_histeresis_encendido_y_apagado(self):
        """
        Prueba de histéresis:
        - Setpoint: 25.0°C, Delta: ±0.8°C.
        - Umbral de encendido: >= 25.8°C
        - Umbral de reposo/apagado: <= 24.2°C
        """
        # 1. Temperatura a 25.5°C (entre 24.2 y 25.8) iniciando en apagado -> no debe encender
        self.sensor.actualizar_temperatura_real(25.5)
        self.controlador.ejecutar_ciclo()
        self.assertFalse(self.controlador.en_enfriamiento_activo)
        self.assertEqual(self.controlador.estado_compresor, EstadoCompresor.APAGADO)

        # 2. Temperatura sube a 26.0°C (supera umbral encendido 25.8°C) -> enciende
        self.sensor.actualizar_temperatura_real(26.0)
        self.controlador.ejecutar_ciclo()
        self.assertTrue(self.controlador.en_enfriamiento_activo)
        self.assertGreater(self.compresor.get_capacidad(), 0.0)

        # 3. Temperatura baja a 24.9°C (dentro de la banda muerta) -> sigue encendido modulando
        self.sensor.actualizar_temperatura_real(24.9)
        self.controlador.ejecutar_ciclo()
        self.assertTrue(self.controlador.en_enfriamiento_activo)
        self.assertEqual(self.controlador.estado_compresor, EstadoCompresor.MODULANDO)

        # 4. Temperatura baja a 24.1°C (por debajo del umbral de apagado 24.2°C) -> entra en reposo
        self.sensor.actualizar_temperatura_real(24.1)
        self.controlador.ejecutar_ciclo()
        self.assertFalse(self.controlador.en_enfriamiento_activo)
        self.assertEqual(self.controlador.estado_compresor, EstadoCompresor.APAGADO)
        self.assertEqual(self.compresor.get_capacidad(), 0.0)

    def test_falla_tacometro_ventilador_revoluciones_insuficientes(self):
        """
        Prueba la detección de desgaste o daño mecánico en el ventilador (revoluciones bajas).
        """
        # Solicitamos enfriamiento y dejamos pasar el periodo de arranque normal (5s)
        self.sensor.actualizar_temperatura_real(28.0)
        for _ in range(5):
            self.controlador.ejecutar_ciclo(dt=1.0)
            self.ventilador.actualizar(dt=1.0)

        # Ahora simulamos que ocurre desgaste mecánico severo (fricción en baleros)
        self.ventilador.provocar_degradacion(0.70)  # pierde 70% de velocidad
        self.ventilador.actualizar(dt=3.0)  # dar tiempo a que bajen las RPM físicamente

        # Ejecutar ciclo de control
        self.controlador.ejecutar_ciclo(dt=1.0)

        # Debe haberse registrado alerta de ventilador lento
        self.assertIn("WARN_VENTILADOR_LENTO", self.controlador.alertas_activas)
        alerta = self.controlador.alertas_activas["WARN_VENTILADOR_LENTO"]
        self.assertEqual(alerta.tipo, TipoAlerta.ADVERTENCIA)

    def test_alerta_mantenimiento_falta_de_gas_compresor(self):
        """
        Prueba que si el compresor se queda sin refrigerante, emite alerta de mantenimiento.
        """
        self.sensor.actualizar_temperatura_real(30.0)
        self.controlador.ejecutar_ciclo()

        # Simular que el compresor perdió gas (presión < 70 PSI)
        self.compresor.set_carga_gas(20.0)  # 20% de carga
        self.controlador.ejecutar_ciclo()

        # Debe haberse generado la alerta de mantenimiento
        self.assertIn("ALERTA_MANTENIMIENTO_GAS_BAJO", self.controlador.alertas_activas)
        alerta = self.controlador.alertas_activas["ALERTA_MANTENIMIENTO_GAS_BAJO"]
        self.assertEqual(alerta.tipo, TipoAlerta.MANTENIMIENTO)

    def test_falla_sensor_temperatura_desconectado(self):
        """
        Prueba que la desconexión del sensor apaga el compresor por seguridad y emite alerta crítica.
        """
        self.sensor.actualizar_temperatura_real(29.0)
        self.controlador.ejecutar_ciclo()
        self.assertTrue(self.controlador.en_enfriamiento_activo)

        # Provocar desconexión
        self.sensor.provocar_falla_desconexion(True)
        self.controlador.ejecutar_ciclo()

        # Compresor debe apagarse por seguridad
        self.assertEqual(self.controlador.estado_compresor, EstadoCompresor.BLOQUEADO_POR_FALLA)
        self.assertEqual(self.compresor.get_capacidad(), 0.0)
        self.assertIn("ERR_SENSOR_DESCONECTADO", self.controlador.alertas_activas)

    def test_impacto_cargas_termicas_personas_puerta_datacenter(self):
        """
        Verifica el modelo físico del ambiente:
        - Más personas = mayor calor disipado.
        - Puerta abierta = alta infiltración.
        - Datacenter = enorme carga térmica.
        """
        config_base = ConfiguracionRecinto(area_m2=20.0, personas=0, puerta_abierta=False)
        amb_base = AmbienteTermico(config_base, temp_inicial=25.0)
        cargas_base = amb_base.calcular_cargas_termicas()

        # Con 5 personas
        amb_base.set_personas(5)
        cargas_5_personas = amb_base.calcular_cargas_termicas()
        self.assertGreater(cargas_5_personas["q_personas_w"], cargas_base["q_personas_w"])

        # Con puerta abierta
        amb_base.set_puerta(True)
        cargas_puerta_abierta = amb_base.calcular_cargas_termicas()
        self.assertGreater(cargas_puerta_abierta["q_infiltracion_w"], 0.0)

        # Datacenter con servidores Blade
        config_dc = ConfiguracionRecinto(area_m2=20.0, es_datacenter=True, servidores_blade_activos=4)
        amb_dc = AmbienteTermico(config_dc, temp_inicial=25.0)
        cargas_dc = amb_dc.calcular_cargas_termicas()
        # 4 blades * 2500W = 10,000 W
        self.assertEqual(cargas_dc["q_datacenter_w"], 10000.0)

    def test_alerta_puerta_abierta_prolongada(self):
        """
        Verifica que una puerta abierta por más de 15 segundos genera la alerta de sobreesfuerzo.
        """
        from dispositivos import SensorAperturaSimulado
        sensor_p = SensorAperturaSimulado(estado_inicial_abierto=True)
        self.controlador.sensor_puerta = sensor_p

        # 10 segundos abierta -> aún no debe disparar alerta
        for _ in range(10):
            self.controlador.ejecutar_ciclo(dt=1.0)
        self.assertNotIn("WARN_PUERTA_ABIERTA_PROLONGADA", self.controlador.alertas_activas)

        # 6 segundos más (total 16s > 15s) -> debe disparar alerta
        for _ in range(6):
            self.controlador.ejecutar_ciclo(dt=1.0)
        self.assertIn("WARN_PUERTA_ABIERTA_PROLONGADA", self.controlador.alertas_activas)


if __name__ == "__main__":
    unittest.main()

