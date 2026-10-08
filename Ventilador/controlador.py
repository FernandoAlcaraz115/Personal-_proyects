"""
controlador.py
Módulo del Controlador Inteligente de Aire Acondicionado con Tecnología Inverter e Histéresis.

Implementa:
1. Control de histéresis con modulación Inverter alrededor del setpoint (25.0 °C).
2. Control dinámico y monitoreo de tacómetro del ventilador.
3. Diagnóstico preventivo de falta de gas refrigerante y emisión de alertas de mantenimiento.
4. Detección de fallas en sensores de temperatura y sobreesfuerzo ambiental.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from dispositivos import ISensorTemperatura, IVentilador, ICompresor, ISensorApertura


class EstadoCompresor(Enum):
    APAGADO = "APAGADO"
    MODULANDO = "MODULANDO"
    MAXIMA_POTENCIA = "MAXIMA_POTENCIA"
    BLOQUEADO_POR_FALLA = "BLOQUEADO_POR_FALLA"


class TipoAlerta(Enum):
    INFO = "INFO"
    ADVERTENCIA = "ADVERTENCIA"
    MANTENIMIENTO = "MANTENIMIENTO"
    CRITICA = "CRITICA"


class Alerta:
    """Representa una notificación o alarma generada por el controlador."""
    def __init__(self, tipo: TipoAlerta, codigo: str, mensaje: str, tiempo_simulado_seg: float):
        self.tipo = tipo
        self.codigo = codigo
        self.mensaje = mensaje
        self.tiempo_simulado_seg = tiempo_simulado_seg

    def __repr__(self):
        minutos = int(self.tiempo_simulado_seg // 60)
        segundos = int(self.tiempo_simulado_seg % 60)
        return f"[{self.tipo.value} @ {minutos:02d}:{segundos:02d}] ({self.codigo}): {self.mensaje}"


class ControladorAireAcondicionado:
    """
    Controlador de A/C compatible con los sensores y actuadores del equipo de Alonso Reséndiz.
    """

    def __init__(
        self,
        sensor_temp: ISensorTemperatura,
        ventilador: IVentilador,
        compresor: ICompresor,
        sensor_puerta: Optional[ISensorApertura] = None,
        temperatura_deseada: float = 25.0,
        histeresis_delta: float = 0.8
    ):
        # Componentes inyectados (pueden ser los simulados o los del equipo de Alonso)
        self.sensor_temp = sensor_temp
        self.ventilador = ventilador
        self.compresor = compresor
        self.sensor_puerta = sensor_puerta

        # Parámetros térmicos de consigna
        self.setpoint: float = temperatura_deseada          # 25.0 °C
        self.histeresis_delta: float = histeresis_delta    # Banda muerta (+/- 0.8 °C)
        self.umbral_encendido = self.setpoint + self.histeresis_delta  # 25.8 °C
        self.umbral_apagado = self.setpoint - self.histeresis_delta    # 24.2 °C

        # Estados internos del controlador
        self.estado_compresor = EstadoCompresor.APAGADO
        self.en_enfriamiento_activo: bool = False
        self.alertas_activas: Dict[str, Alerta] = {}
        self.historial_alertas: List[Alerta] = []

        # Variables para diagnóstico y telemetría
        self.tiempo_compresor_alta_potencia_seg: float = 0.0
        self.tiempo_ventilador_activo_seg: float = 0.0
        self.tiempo_puerta_abierta_seg: float = 0.0
        self.temp_anterior: Optional[float] = None
        self.tiempo_sin_bajar_temperatura_seg: float = 0.0
        self.lecturas_sensor_consecutivas_iguales: int = 0
        self.tiempo_total_simulacion: float = 0.0

    def registrar_alerta(self, tipo: TipoAlerta, codigo: str, mensaje: str) -> None:
        """Registra una alerta si no está activa actualmente."""
        if codigo not in self.alertas_activas:
            alerta = Alerta(tipo, codigo, mensaje, self.tiempo_total_simulacion)
            self.alertas_activas[codigo] = alerta
            self.historial_alertas.append(alerta)

    def despejar_alerta(self, codigo: str) -> None:
        """Elimina una alerta cuando la condición de falla se normaliza."""
        if codigo in self.alertas_activas:
            del self.alertas_activas[codigo]

    def evaluar_sensor_temperatura(self, temp_leida: Optional[float]) -> bool:
        """
        Verifica la integridad de las lecturas del sensor.
        Retorna True si la lectura es válida; False si hay anomalía.
        """
        # 1. Falla de circuito abierto / desconexión
        if temp_leida is None:
            self.registrar_alerta(
                TipoAlerta.CRITICA,
                "ERR_SENSOR_DESCONECTADO",
                "Falla en sensor de temperatura: no hay señal (circuito abierto)."
            )
            return False

        # 2. Falla de lectura fuera de rango físico operativo (-5°C a 65°C)
        if temp_leida < -5.0 or temp_leida > 65.0:
            self.registrar_alerta(
                TipoAlerta.CRITICA,
                "ERR_SENSOR_OUT_OF_RANGE",
                f"Lectura anómala fuera de rango en sensor: {temp_leida} °C."
            )
            return False

        # 3. Detección de sensor congelado (stuck reading)
        if self.temp_anterior is not None and abs(temp_leida - self.temp_anterior) < 0.001:
            self.lecturas_sensor_consecutivas_iguales += 1
            if self.lecturas_sensor_consecutivas_iguales > 60 and self.en_enfriamiento_activo:
                self.registrar_alerta(
                    TipoAlerta.ADVERTENCIA,
                    "WARN_SENSOR_CONGELADO",
                    f"Posible falla de sensor congelado en {temp_leida} °C por más de 60 ciclos."
                )
        else:
            self.lecturas_sensor_consecutivas_iguales = 0
            self.despejar_alerta("WARN_SENSOR_CONGELADO")

        self.despejar_alerta("ERR_SENSOR_DESCONECTADO")
        self.despejar_alerta("ERR_SENSOR_OUT_OF_RANGE")
        return True

    def evaluar_tacometro_ventilador(self, potencia_solicitada: float, dt: float = 1.0) -> None:
        """
        Monitorea el ventilador. Compara la velocidad solicitada contra
        las revoluciones medidas por el tacómetro para detectar fricción o daño.
        Incluye un periodo de gracia para transiciones y arranque inercial.
        """
        rpm_medidas = self.ventilador.get_rpm_actual()

        # Si hay cambio de escalón de velocidad, reiniciar contador de aceleración
        if not hasattr(self, "_potencia_ventilador_previa"):
            self._potencia_ventilador_previa = 0.0

        if abs(potencia_solicitada - self._potencia_ventilador_previa) > 15.0:
            self.tiempo_ventilador_activo_seg = 0.0
        self._potencia_ventilador_previa = potencia_solicitada

        # Si el ventilador debería estar girando
        if potencia_solicitada > 15.0:
            self.tiempo_ventilador_activo_seg += dt

            # Periodo de gracia para que el motor acelere (evita falsas alarmas de arranque)
            if self.tiempo_ventilador_activo_seg < 4.0:
                return

            rpm_esperadas_minimas = (potencia_solicitada / 100.0) * 1400.0 * 0.65

            if rpm_medidas < 50.0:
                self.registrar_alerta(
                    TipoAlerta.CRITICA,
                    "ERR_VENTILADOR_DETENIDO",
                    "El ventilador está bloqueado o dañado mecánicamente (0 RPM). Riesgo de congelamiento."
                )
            elif rpm_medidas < rpm_esperadas_minimas:
                self.registrar_alerta(
                    TipoAlerta.ADVERTENCIA,
                    "WARN_VENTILADOR_LENTO",
                    f"Ventilador con revoluciones insuficientes ({rpm_medidas:.0f} RPM vs min {rpm_esperadas_minimas:.0f} RPM). Enfriamiento lento por degradación mecánica."
                )
            else:
                self.despejar_alerta("ERR_VENTILADOR_DETENIDO")
                self.despejar_alerta("WARN_VENTILADOR_LENTO")
        else:
            self.tiempo_ventilador_activo_seg = 0.0
            self.despejar_alerta("ERR_VENTILADOR_DETENIDO")
            self.despejar_alerta("WARN_VENTILADOR_LENTO")

    def evaluar_rendimiento_compresor(self, temp_actual: float, dt: float) -> None:
        """
        Monitorea si el compresor está consumiendo energía sin poder enfriar.
        Detecta fugas de gas refrigerante y genera alerta de mantenimiento.
        """
        capacidad = self.compresor.get_capacidad()
        presion_psi = self.compresor.get_presion_refrigerante()

        # Detección directa por sensor de presión de baja
        if presion_psi < 70.0 and capacidad > 10.0:
            self.registrar_alerta(
                TipoAlerta.MANTENIMIENTO,
                "ALERTA_MANTENIMIENTO_GAS_BAJO",
                f"ALERTA DE MANTENIMIENTO: Presión baja de refrigerante ({presion_psi:.1f} PSI). Posible fuga de gas."
            )

        # Detección termodinámica indirecta:
        # Si el compresor está a más del 60% de capacidad y la temperatura no baja
        if capacidad >= 60.0:
            self.tiempo_compresor_alta_potencia_seg += dt
            if self.temp_anterior is not None:
                if temp_actual >= self.temp_anterior - 0.01:
                    self.tiempo_sin_bajar_temperatura_seg += dt
                else:
                    self.tiempo_sin_bajar_temperatura_seg = max(0.0, self.tiempo_sin_bajar_temperatura_seg - dt * 0.5)

            # Si lleva 40 segundos simulados a máxima capacidad sin lograr descensos térmicos
            if self.tiempo_sin_bajar_temperatura_seg >= 40.0:
                self.registrar_alerta(
                    TipoAlerta.MANTENIMIENTO,
                    "ALERTA_MANTENIMIENTO_COMPRESOR_SIN_ENFRIAMIENTO",
                    "ALERTA DE MANTENIMIENTO: Compresor operando pero no se reduce la temperatura. Verifique carga de gas refrigerante o serpentín."
                )
        else:
            self.tiempo_compresor_alta_potencia_seg = 0.0
            self.tiempo_sin_bajar_temperatura_seg = 0.0

    def evaluar_puerta_y_sobrecarga(self, temp_actual: float, dt: float) -> None:
        """
        Monitorea el estado de puertas/ventanas e identifica sobreesfuerzo térmico.
        """
        if self.sensor_puerta is not None:
            if self.sensor_puerta.esta_abierto():
                self.tiempo_puerta_abierta_seg += dt
                if self.tiempo_puerta_abierta_seg >= 15.0:
                    self.registrar_alerta(
                        TipoAlerta.ADVERTENCIA,
                        "WARN_PUERTA_ABIERTA_PROLONGADA",
                        f"Puerta o ventana abierta prolongadamente ({self.tiempo_puerta_abierta_seg:.0f}s). Sobreesfuerzo del A/C."
                    )
            else:
                self.tiempo_puerta_abierta_seg = 0.0
                self.despejar_alerta("WARN_PUERTA_ABIERTA_PROLONGADA")

        # Detección de sobrecarga térmica extrema
        if self.compresor.get_capacidad() >= 80.0 and self.tiempo_compresor_alta_potencia_seg > 20.0:
            if temp_actual > self.setpoint + 1.2:
                self.registrar_alerta(
                    TipoAlerta.ADVERTENCIA,
                    "WARN_SOBRECARGA_TERMICA",
                    "Sobrecarga termica: la carga de calor del recinto supera la capacidad de enfriamiento."
                )
            else:
                self.despejar_alerta("WARN_SOBRECARGA_TERMICA")
        else:
            self.despejar_alerta("WARN_SOBRECARGA_TERMICA")

    def ejecutar_ciclo(self, dt: float = 1.0) -> Dict[str, Any]:
        """
        Ciclo principal de control en tiempo discreto:
        1. Lee sensor de temperatura.
        2. Aplica lógica de histéresis y modulación Inverter.
        3. Controla ventilador y compresor.
        4. Ejecuta diagnósticos de seguridad y mantenimiento.
        """
        self.tiempo_total_simulacion += dt
        temp_leida = self.sensor_temp.leer_temperatura()

        # 1. Validación de sensor
        sensor_valido = self.evaluar_sensor_temperatura(temp_leida)
        if not sensor_valido:
            # Modo de seguridad: Apagar compresor para evitar daños por lectura desconocida
            self.compresor.set_capacidad(0.0)
            self.ventilador.set_velocidad_objetivo(20.0)  # ventilación mínima de emergencia
            self.estado_compresor = EstadoCompresor.BLOQUEADO_POR_FALLA
            self.en_enfriamiento_activo = False
            return self._generar_telemetria(temp_leida, 0.0, 20.0)

        # 2. Algoritmo de Histéresis + Modulación Inverter
        if temp_leida >= self.umbral_encendido:
            self.en_enfriamiento_activo = True
        elif temp_leida <= self.umbral_apagado:
            self.en_enfriamiento_activo = False

        if not self.en_enfriamiento_activo:
            # Compresor en reposo por histéresis (temperatura ideal alcanzada)
            capacidad_compresor = 0.0
            velocidad_ventilador = 15.0  # Flujo de recirculación suave
            self.estado_compresor = EstadoCompresor.APAGADO
        else:
            # Modulación Inverter proporcional a la distancia del setpoint
            error_temperatura = temp_leida - self.setpoint

            if error_temperatura >= 3.0:
                # Muy caliente: máxima potencia
                capacidad_compresor = 100.0
                velocidad_ventilador = 100.0
                self.estado_compresor = EstadoCompresor.MAXIMA_POTENCIA
            elif error_temperatura >= 1.0:
                # Carga moderada-alta: 60% a 90%
                capacidad_compresor = 60.0 + (error_temperatura - 1.0) * 15.0
                velocidad_ventilador = 70.0
                self.estado_compresor = EstadoCompresor.MODULANDO
            else:
                # Cerca del objetivo (25.0°C): Modulación económica Inverter (25% a 50%)
                capacidad_compresor = max(25.0, 30.0 + (error_temperatura * 25.0))
                velocidad_ventilador = 40.0
                self.estado_compresor = EstadoCompresor.MODULANDO

        # Aplicar comandos a actuadores
        self.compresor.set_capacidad(capacidad_compresor)
        self.ventilador.set_velocidad_objetivo(velocidad_ventilador)

        # 3. Diagnósticos de ventilador, compresor, puertas y sobrecarga
        self.evaluar_tacometro_ventilador(velocidad_ventilador, dt=dt)
        self.evaluar_rendimiento_compresor(temp_leida, dt)
        self.evaluar_puerta_y_sobrecarga(temp_leida, dt)

        # Guardar para el siguiente ciclo
        self.temp_anterior = temp_leida

        return self._generar_telemetria(temp_leida, capacidad_compresor, velocidad_ventilador)

    def _generar_telemetria(
        self,
        temp_leida: Optional[float],
        cap_compresor: float,
        vel_ventilador: float
    ) -> Dict[str, Any]:
        return {
            "tiempo_seg": self.tiempo_total_simulacion,
            "temp_leida": temp_leida,
            "setpoint": self.setpoint,
            "en_enfriamiento": self.en_enfriamiento_activo,
            "estado_compresor": self.estado_compresor.value,
            "capacidad_compresor_pct": cap_compresor,
            "presion_gas_psi": self.compresor.get_presion_refrigerante(),
            "rpm_ventilador_actual": self.ventilador.get_rpm_actual(),
            "alertas": list(self.alertas_activas.values())
        }
