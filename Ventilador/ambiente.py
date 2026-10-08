"""
ambiente.py
Modelo Termodinámico del Ambiente / Recinto.

Calcula el balance térmico de una habitación o datacenter considerando:
- Área y volumen del recinto.
- Calor metabólico emitido por personas presentes.
- Infiltración masiva por puertas y ventanas abiertas.
- Cargas térmicas especiales (como racks de servidores Blade de alta densidad).
- Transmisión de calor a través de paredes y techo desde el exterior.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class ConfiguracionRecinto:
    """Parámetros de diseño físico del recinto."""
    area_m2: float = 25.0               # Superficie en metros cuadrados
    altura_m: float = 2.6               # Altura promedio de techo
    personas: int = 1                   # Cantidad de personas ocupando la habitación
    puerta_abierta: bool = False        # Estado de la puerta
    ventana_abierta: bool = False       # Estado de la ventana
    es_datacenter: bool = False         # Si es un centro de cómputo con servidores Blade
    servidores_blade_activos: int = 0   # Cantidad de chasis/servidores blade
    temperatura_exterior: float = 34.0  # Temperatura del aire exterior (°C)


class AmbienteTermico:
    """
    Simula la dinámica de temperatura del aire interior mediante
    balance de energía en tiempo discreto:
    
    Q_neto = Q_exterior + Q_personas + Q_datacenter + Q_infiltracion - Q_enfriamiento
    dT = (Q_neto * dt) / Capacidad_Termica
    """

    # Constantes físicas
    DENSIDAD_AIRE = 1.204            # kg/m^3 a 20°C y 1 atm
    CALOR_ESPECIFICO_AIRE = 1005.0   # J / (kg * K)
    CALOR_POR_PERSONA_WATTS = 110.0  # W disipados por persona promedio en reposo/oficina
    CALOR_POR_BLADE_WATTS = 2500.0   # W por chasis blade (alta densidad de cómputo)
    COEF_TRANSMISION_PAREDES = 2.2   # W / (m^2 * K) coeficiente global U promedio

    def __init__(
        self,
        config: Optional[ConfiguracionRecinto] = None,
        temp_inicial: float = 30.0,
        factor_aceleracion_termica: float = 1.0,
        inercia_estructural: float = 2.0
    ):
        self.config = config if config is not None else ConfiguracionRecinto()
        self.temperatura_interior = temp_inicial
        self.factor_aceleracion_termica = max(0.1, factor_aceleracion_termica)
        self.inercia_estructural = max(0.5, inercia_estructural)

        # Duración acumulada de eventos
        self.segundos_puerta_abierta = 0.0

    @property
    def volumen_m3(self) -> float:
        return self.config.area_m2 * self.config.altura_m

    @property
    def masa_aire_kg(self) -> float:
        return self.volumen_m3 * self.DENSIDAD_AIRE

    @property
    def capacidad_termica_total_j_k(self) -> float:
        """
        Capacidad calorífica efectiva del aire más inercia de mobiliario.
        Ajustada por el factor de aceleración térmica para respuesta ágil.
        """
        cap_base = self.masa_aire_kg * self.CALOR_ESPECIFICO_AIRE * self.inercia_estructural
        return cap_base / self.factor_aceleracion_termica

    def set_personas(self, cantidad: int) -> None:
        """Modifica la ocupación de personas en el cuarto."""
        self.config.personas = max(0, cantidad)

    def set_puerta(self, abierta: bool) -> None:
        """Abre o cierra la puerta."""
        self.config.puerta_abierta = abierta
        if not abierta:
            self.segundos_puerta_abierta = 0.0

    def set_ventana(self, abierta: bool) -> None:
        """Abre o cierra la ventana."""
        self.config.ventana_abierta = abierta

    def calcular_cargas_termicas(self) -> dict:
        """
        Calcula las distintas fuentes de calor entrantes al recinto en Watts (J/s).
        Transferencia bidireccional según diferencias de temperatura.
        """
        delta_t_ext = self.config.temperatura_exterior - self.temperatura_interior

        # 1. Ganancia o pérdida por paredes y techo
        lado = self.config.area_m2 ** 0.5
        area_envolvente = (4 * lado * self.config.altura_m) + self.config.area_m2
        q_paredes = self.COEF_TRANSMISION_PAREDES * area_envolvente * delta_t_ext

        # 2. Ganancia metabólica humana
        q_personas = self.config.personas * self.CALOR_POR_PERSONA_WATTS

        # 3. Ganancia por equipos informáticos (Datacenter / Blades)
        q_datacenter = 0.0
        if self.config.es_datacenter:
            n_blades = max(self.config.servidores_blade_activos, 3)
            q_datacenter = n_blades * self.CALOR_POR_BLADE_WATTS

        # 4. Infiltración de aire por puertas y ventanas abiertas
        caudal_infiltracion_m3_s = 0.0
        if self.config.puerta_abierta:
            caudal_infiltracion_m3_s += 0.35  # Aproximadamente 1200 m^3/h por puerta estándar abierta
        if self.config.ventana_abierta:
            caudal_infiltracion_m3_s += 0.20

        # Flujo de masa infiltrado (kg/s)
        m_punto_infil = caudal_infiltracion_m3_s * self.DENSIDAD_AIRE
        q_infiltracion = m_punto_infil * self.CALOR_ESPECIFICO_AIRE * delta_t_ext

        q_ganancia_total = q_paredes + q_personas + q_datacenter + q_infiltracion

        return {
            "q_paredes_w": q_paredes,
            "q_personas_w": q_personas,
            "q_datacenter_w": q_datacenter,
            "q_infiltracion_w": q_infiltracion,
            "q_ganancia_total_w": q_ganancia_total
        }

    def actualizar(self, calor_enfriamiento_watts: float, dt: float = 1.0) -> float:
        """
        Ejecuta un paso de integración temporal térmica.
        calor_enfriamiento_watts: calor retirado por el aire acondicionado (W).
        dt: delta de tiempo en segundos.
        Retorna la nueva temperatura interior en °C.
        """
        if self.config.puerta_abierta:
            self.segundos_puerta_abierta += dt

        cargas = calcular_cargas = self.calcular_cargas_termicas()
        q_ganancia = cargas["q_ganancia_total_w"]

        # Calor neto (Positivo = calienta el cuarto, Negativo = enfría el cuarto)
        q_neto = q_ganancia - calor_enfriamiento_watts

        # Variación de temperatura según primer principio de la termodinámica
        delta_t = (q_neto * dt) / self.capacidad_termica_total_j_k
        self.temperatura_interior += delta_t

        return self.temperatura_interior
