"""
dispositivos.py
Módulo de Sensores y Actuadores para el Sistema de Aire Acondicionado.

Diseñado con interfaces claras para facilitar la integración con el equipo
de Alonso Reséndiz. Define tanto los contratos esperados como implementaciones
simuladas completas con soporte para inyección de fallas.
"""

from abc import ABC, abstractmethod
import random
import time
from typing import Optional, Dict, Any


# =====================================================================
# INTERFACES BASE (Contratos de integración con el equipo de Alonso)
# =====================================================================

class ISensorTemperatura(ABC):
    """Interfaz estándar para sensores de temperatura."""
    @abstractmethod
    def leer_temperatura(self) -> Optional[float]:
        """Retorna la temperatura leída en °C o None si el sensor falló."""
        pass


class IVentilador(ABC):
    """Interfaz estándar para el ventilador del evaporador."""
    @abstractmethod
    def set_velocidad_objetivo(self, nivel_o_rpm: float) -> None:
        """Establece la velocidad requerida (0% a 100% o RPM objetivo)."""
        pass

    @abstractmethod
    def get_rpm_actual(self) -> float:
        """Retorna las revoluciones por minuto reales medidas por tacómetro."""
        pass

    @abstractmethod
    def esta_operativo(self) -> bool:
        """Indica si el ventilador está libre de fallas críticas."""
        pass


class ICompresor(ABC):
    """Interfaz estándar para el compresor (tecnología Inverter)."""
    @abstractmethod
    def set_capacidad(self, porcentaje: float) -> None:
        """Modula la capacidad del compresor (0.0% = apagado, 100.0% = máxima potencia)."""
        pass

    @abstractmethod
    def get_capacidad(self) -> float:
        """Retorna el porcentaje de trabajo actual del compresor."""
        pass

    @abstractmethod
    def get_presion_refrigerante(self) -> float:
        """Retorna la presión de gas refrigerante en PSI (o % de carga restante)."""
        pass


class ISensorApertura(ABC):
    """Interfaz estándar para sensores de contacto magnético de puertas/ventanas."""
    @abstractmethod
    def esta_abierto(self) -> bool:
        """Retorna True si la puerta o ventana está abierta."""
        pass



# =====================================================================
# IMPLEMENTACIONES SIMULADAS (Con inyección de fallas)
# =====================================================================

class SensorTemperaturaSimulado(ISensorTemperatura):
    """
    Simulación de sensor de temperatura digital (ej. termistor NTC o DS18B20).
    Permite simular ruido de lectura, desconexiones y lecturas congeladas.
    """
    def __init__(self, ruido_std: float = 0.1):
        self.ruido_std = ruido_std
        self._temperatura_real = 25.0
        self.falla_desconexion: bool = False
        self.falla_lectura_congelada: bool = False
        self._valor_congelado: Optional[float] = None

    def actualizar_temperatura_real(self, temp_ambiente: float) -> None:
        """Actualiza la temperatura física que rodea al sensor."""
        self._temperatura_real = temp_ambiente

    def provocar_falla_desconexion(self, activar: bool = True) -> None:
        """Simula que el sensor se desconecta físicamente o da error."""
        self.falla_desconexion = activar

    def provocar_falla_congelamiento(self, activar: bool = True) -> None:
        """Simula que el sensor se queda congelado en su última lectura."""
        self.falla_lectura_congelada = activar
        if activar:
            self._valor_congelado = self._temperatura_real

    def leer_temperatura(self) -> Optional[float]:
        """
        Retorna la temperatura medida con una pequeña variación por ruido eléctrico.
        Si hay falla de desconexión, retorna None.
        Si está congelado, retorna siempre el mismo valor.
        """
        if self.falla_desconexion:
            return None

        if self.falla_lectura_congelada and self._valor_congelado is not None:
            return round(self._valor_congelado, 2)

        # Lectura normal con pequeño ruido Gaussiano
        ruido = random.gauss(0, self.ruido_std)
        return round(self._temperatura_real + ruido, 2)


class VentiladorSimulado(IVentilador):
    """
    Simulación de ventilador BLDC (motor sin escobillas) con tacómetro.
    Soporta degradación mecánica (fricción en bujes/baleros) y daño total.
    """
    RPM_MAXIMAS = 1400.0  # RPM estándar de turbina evaporadora

    def __init__(self):
        self.potencia_objetivo: float = 0.0  # 0.0 a 100.0%
        self.rpm_actual: float = 0.0
        self.degradacion_mecanica: float = 0.0  # 0.0 = nuevo, 1.0 = completamente trabado
        self.falla_quemado: bool = False

    def set_velocidad_objetivo(self, porcentaje: float) -> None:
        """Establece la velocidad deseada de 0 a 100%."""
        self.potencia_objetivo = max(0.0, min(100.0, porcentaje))

    def provocar_degradacion(self, factor_friccion: float) -> None:
        """
        Simula desgaste o suciedad en baleros:
        0.0 = óptimo, 0.5 = pierde 50% de RPMs, 1.0 = atascado.
        """
        self.degradacion_mecanica = max(0.0, min(1.0, factor_friccion))

    def provocar_danio_total(self, activar: bool = True) -> None:
        """Simula falla catastrófica (motor quemado o aspas rotas)."""
        self.falla_quemado = activar

    def actualizar(self, dt: float = 1.0) -> None:
        """
        Actualiza la inercia del ventilador para alcanzar las RPM deseadas.
        dt: intervalo en segundos.
        """
        if self.falla_quemado or self.potencia_objetivo <= 0.0:
            rpm_deseada = 0.0
        else:
            # RPM teóricas según porcentaje solicitado
            rpm_teorica = (self.potencia_objetivo / 100.0) * self.RPM_MAXIMAS
            # Afectado por la degradación mecánica
            rpm_deseada = rpm_teorica * (1.0 - self.degradacion_mecanica)

        # Inercia física: el ventilador tarda unos instantes en acelerar o frenar
        tau = 2.0  # constante de tiempo en segundos
        self.rpm_actual += (rpm_deseada - self.rpm_actual) * (dt / max(dt, tau))
        self.rpm_actual = max(0.0, round(self.rpm_actual, 1))

    def get_rpm_actual(self) -> float:
        return self.rpm_actual

    def get_flujo_aire_relativo(self) -> float:
        """Retorna la proporción de flujo de aire de 0.0 a 1.0 según las RPM reales."""
        return min(1.0, self.rpm_actual / self.RPM_MAXIMAS)

    def esta_operativo(self) -> bool:
        return not self.falla_quemado and self.degradacion_mecanica < 0.9


class CompresorSimulado(ICompresor):
    """
    Simulación de compresor rotativo Inverter.
    Permite variar su velocidad/capacidad continua de 0% a 100%.
    Incluye estado de gas refrigerante (R410A / R32) y detección de fuga.
    """
    PRESION_NOMINAL_PSI = 120.0  # Presión típica en baja para R410A

    def __init__(self, potencia_frigorifica_max_btu: float = 18000.0):
        """
        potencia_frigorifica_max_btu: Capacidad del compresor (ej. 18000 BTU/h ~ 5275 Watts).
        """
        self.btu_max = potencia_frigorifica_max_btu
        self.watts_frio_max = self.btu_max * 0.293071  # 1 BTU/h = 0.293071 Watts
        self.capacidad_actual: float = 0.0  # 0.0 a 100.0%
        self.carga_gas_porcentaje: float = 100.0  # 100% = carga óptima
        self.tasa_fuga_gas: float = 0.0  # Pérdida de gas por segundo
        self.horas_uso_acumuladas: float = 0.0

    def set_capacidad(self, porcentaje: float) -> None:
        """Modula la frecuencia Inverter (0.0% = apagado, hasta 100.0%)."""
        self.capacidad_actual = max(0.0, min(100.0, porcentaje))

    def get_capacidad(self) -> float:
        return self.capacidad_actual

    def get_presion_refrigerante(self) -> float:
        """Presión calculada en base a la carga de gas restante."""
        return (self.carga_gas_porcentaje / 100.0) * self.PRESION_NOMINAL_PSI

    def provocar_fuga_gas(self, porcentaje_por_segundo: float = 0.5) -> None:
        """Inicia una fuga continua de refrigerante."""
        self.tasa_fuga_gas = porcentaje_por_segundo

    def set_carga_gas(self, porcentaje: float) -> None:
        """Ajusta manualmente el nivel de gas (ej. para probar falta total)."""
        self.carga_gas_porcentaje = max(0.0, min(100.0, porcentaje))

    def actualizar(self, dt: float = 1.0) -> None:
        """Actualiza desgaste y fuga de gas."""
        if self.capacidad_actual > 0.0:
            self.horas_uso_acumuladas += (dt / 3600.0)

        if self.tasa_fuga_gas > 0.0:
            self.carga_gas_porcentaje = max(0.0, self.carga_gas_porcentaje - (self.tasa_fuga_gas * dt))

    def get_calor_extraido_watts(self, flujo_aire_relativo: float) -> float:
        """
        Calcula la potencia térmica frigorífica neta transferida al ambiente en Watts.
        Depende de:
        1. Porcentaje de modulación del compresor.
        2. Carga de gas refrigerante disponible (sin gas no hay ciclo de evaporación).
        3. Flujo de aire del ventilador sobre el evaporador (si el ventilador no sopla,
           el calor no se transfiere y el serpentín se congela).
        """
        if self.capacidad_actual <= 0.0:
            return 0.0

        factor_compresor = self.capacidad_actual / 100.0
        # Eficiencia por gas: por debajo del 40% de gas la capacidad cae abruptamente
        factor_gas = (self.carga_gas_porcentaje / 100.0) ** 1.5
        # Intercambio térmico dependiente del aire forzado
        factor_ventilacion = min(1.0, max(0.05, flujo_aire_relativo))

        return self.watts_frio_max * factor_compresor * factor_gas * factor_ventilacion


class SensorAperturaSimulado(ISensorApertura):
    """
    Simulación de switch magnético para puerta o ventana.
    """
    def __init__(self, estado_inicial_abierto: bool = False):
        self.abierto = estado_inicial_abierto

    def set_estado(self, abierto: bool) -> None:
        self.abierto = abierto

    def esta_abierto(self) -> bool:
        return self.abierto

