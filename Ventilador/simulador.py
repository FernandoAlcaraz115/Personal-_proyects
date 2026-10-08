"""
simulador.py
Motor de Simulación Integral del Sistema de Aire Acondicionado.

Coordina en tiempo discreto:
- La física térmica del ambiente (ambiente.py).
- Los dispositivos y actuadores (dispositivos.py).
- La lógica del controlador con histéresis e inverter (controlador.py).
- Reportes visuales claros y comprensibles en consola.
"""

import time
import sys
from typing import Callable, Optional, Dict, Any, List
from ambiente import AmbienteTermico, ConfiguracionRecinto
from dispositivos import SensorTemperaturaSimulado, VentiladorSimulado, CompresorSimulado, SensorAperturaSimulado
from controlador import ControladorAireAcondicionado, TipoAlerta

# Asegurar codificación utf-8 en Windows para terminales si es posible
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class SimuladorAC:
    """
    Orquestador de simulación en tiempo discreto.
    """

    def __init__(
        self,
        ambiente: Optional[AmbienteTermico] = None,
        sensor: Optional[SensorTemperaturaSimulado] = None,
        ventilador: Optional[VentiladorSimulado] = None,
        compresor: Optional[CompresorSimulado] = None,
        sensor_puerta: Optional[SensorAperturaSimulado] = None,
        controlador: Optional[ControladorAireAcondicionado] = None
    ):
        self.ambiente = ambiente if ambiente is not None else AmbienteTermico()
        self.sensor = sensor if sensor is not None else SensorTemperaturaSimulado()
        self.ventilador = ventilador if ventilador is not None else VentiladorSimulado()
        self.compresor = compresor if compresor is not None else CompresorSimulado()
        self.sensor_puerta = sensor_puerta if sensor_puerta is not None else SensorAperturaSimulado(
            self.ambiente.config.puerta_abierta or self.ambiente.config.ventana_abierta
        )

        if controlador is not None:
            self.controlador = controlador
        else:
            self.controlador = ControladorAireAcondicionado(
                sensor_temp=self.sensor,
                ventilador=self.ventilador,
                compresor=self.compresor,
                sensor_puerta=self.sensor_puerta,
                temperatura_deseada=25.0,
                histeresis_delta=0.8
            )

        # Modificadores de evento a lo largo del tiempo
        # lista de tuplas: (segundo_activacion, callback_modificacion, descripcion)
        self.eventos_programados: List[tuple] = []

    def programar_evento(self, segundo: float, accion: Callable[['SimuladorAC'], None], descripcion: str):
        """Programa una alteración dinámica durante la corrida de simulación."""
        self.eventos_programados.append((segundo, accion, descripcion))
        self.eventos_programados.sort(key=lambda x: x[0])

    def ejecutar_paso(self, dt: float = 1.0) -> Dict[str, Any]:
        """
        Ejecuta un ciclo discreto de actualización:
        1. El sensor lee la temperatura física del ambiente.
        2. El controlador toma decisiones (Histéresis/Inverter).
        3. El ventilador y compresor se mueven físicamente según inercia y estado.
        4. El calor frigorífico extraído impacta el balance térmico de la habitación.
        """
        # 1. Los sensores se sincronizan con las condiciones físicas reales
        self.sensor.actualizar_temperatura_real(self.ambiente.temperatura_interior)
        self.sensor_puerta.set_estado(self.ambiente.config.puerta_abierta or self.ambiente.config.ventana_abierta)

        # 2. El controlador evalúa y envía comandos a actuadores
        telemetria = self.controlador.ejecutar_ciclo(dt=dt)

        # 3. Los actuadores avanzan físicamente
        self.ventilador.actualizar(dt=dt)
        self.compresor.actualizar(dt=dt)

        # 4. Cálculo de calor retirado
        flujo_aire = self.ventilador.get_flujo_aire_relativo()
        calor_extraido_w = self.compresor.get_calor_extraido_watts(flujo_aire)

        # 5. La física del ambiente actualiza su temperatura
        nueva_temp_real = self.ambiente.actualizar(calor_extraido_w, dt=dt)

        # Registrar métricas adicionales
        telemetria["temp_real_habitacion"] = round(nueva_temp_real, 2)
        telemetria["calor_extraido_w"] = round(calor_extraido_w, 1)
        telemetria["cargas_termicas"] = self.ambiente.calcular_cargas_termicas()

        return telemetria

    def imprimir_encabezado(self, titulo: str):
        print("\n" + "=" * 94)
        print(f" {titulo.upper()} ")
        print("=" * 94)
        print(f"SetPoint: {self.controlador.setpoint} C | Histeresis: +/-{self.controlador.histeresis_delta} C "
              f"(Enciende >= {self.controlador.umbral_encendido} C, Reposo <= {self.controlador.umbral_apagado} C)")
        cfg = self.ambiente.config
        print(f"Ambiente: {cfg.area_m2} m2 ({cfg.area_m2*cfg.altura_m:.1f} m3) | Personas: {cfg.personas} | "
              f"Puerta: {'ABIERTA' if cfg.puerta_abierta else 'Cerrada'} | T.Ext: {cfg.temperatura_exterior} C | "
              f"Datacenter: {'SI (' + str(cfg.servidores_blade_activos) + ' blades)' if cfg.es_datacenter else 'No'}")
        print("-" * 94)
        print(f"{'Tiempo':<8} | {'T.Real':<7} | {'T.Sensor':<8} | {'Compresor':<10} | {'Gas':<7} | {'Ventilador':<13} | {'Frio (W)':<9} | {'Alertas / Eventos'}")
        print("-" * 94)

    def imprimir_fila(self, tel: Dict[str, Any], evento_msg: str = ""):
        t_seg = int(tel["tiempo_seg"])
        t_fmt = f"{t_seg//60:02d}:{t_seg%60:02d}"

        t_real = f"{tel['temp_real_habitacion']:.1f} C"
        t_sens = f"{tel['temp_leida']:.1f} C" if tel['temp_leida'] is not None else "ERROR"

        cap_comp = f"{tel['capacidad_compresor_pct']:.0f}%"
        gas_psi = f"{tel['presion_gas_psi']:.0f}psi"
        rpm_vent = f"{tel['rpm_ventilador_actual']:.0f} RPM"
        frio_w = f"{tel['calor_extraido_w']:.0f}W"

        # Mensajes de alertas
        alertas = tel["alertas"]
        alert_str = ""
        if alertas:
            # Tomamos la más prioritaria
            alert_str = f"[ALERTA: {alertas[-1].mensaje[:35]}...]"
        if evento_msg:
            alert_str = f"[{evento_msg}] " + alert_str

        print(f"{t_fmt:<8} | {t_real:<7} | {t_sens:<8} | {cap_comp:<10} | {gas_psi:<7} | {rpm_vent:<13} | {frio_w:<9} | {alert_str}")

    def correr_simulacion(
        self,
        duracion_segundos: int = 120,
        dt: float = 1.0,
        pausa_visual_seg: float = 0.05,
        titulo: str = "Simulación de Aire Acondicionado"
    ) -> List[Dict[str, Any]]:
        """
        Ejecuta el bucle de simulación con visualización paso a paso.
        """
        self.imprimir_encabezado(titulo)
        historial = []

        tiempo_actual = 0.0
        while tiempo_actual < duracion_segundos:
            # Revisar eventos programados en este instante
            evento_msg = ""
            for seg, accion, desc in self.eventos_programados:
                if int(tiempo_actual) == int(seg):
                    accion(self)
                    evento_msg = desc

            telemetria = self.ejecutar_paso(dt=dt)
            historial.append(telemetria)

            # Imprimir cada paso o agrupar para no saturar si dt es pequeño
            self.imprimir_fila(telemetria, evento_msg)

            tiempo_actual += dt
            if pausa_visual_seg > 0:
                time.sleep(pausa_visual_seg)

        print("-" * 90)
        self._imprimir_resumen(historial)
        return historial

    def _imprimir_resumen(self, historial: List[Dict[str, Any]]):
        if not historial:
            return
        temp_inicial = historial[0]["temp_real_habitacion"]
        temp_final = historial[-1]["temp_real_habitacion"]
        alertas = self.controlador.historial_alertas

        print("\n=== RESUMEN DE LA SIMULACION ===")
        print(f" - Temperatura inicial: {temp_inicial:.2f} C -> Temperatura final: {temp_final:.2f} C (Delta: {temp_final - temp_inicial:+.2f} C)")
        print(f" - Alertas generadas en total: {len(alertas)}")
        if alertas:
            print("   Lista de alertas registradas:")
            for a in alertas:
                print(f"     * {a}")
        else:
            print("   [OK] El sistema opero dentro de los parametros normales sin anomalias.")
        print("=" * 94 + "\n")
