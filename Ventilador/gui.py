"""
gui.py
Interfaz Gráfica de Usuario (GUI) interactiva para el Sistema de Aire Acondicionado.

Incluye:
- Representación visual animada del ventilador con aspas giratorias según RPM reales.
- Efecto de partículas de flujo de aire (frío / recirculación).
- Acelerador dinámico de tiempo de simulación (1x, 5x, 10x, 25x) para observación ágil.
- Termostato digital interactivo con setpoint ajustable y bandas de histéresis.
- Medidores en tiempo real de modulación Inverter del compresor y presión de refrigerante.
- Inyección interactiva de fallas (ventilador lento, fuga de gas, desconexión de sensor).
- Selector de escenarios rápidos (Normal, Falla ventilador, Fuga gas, Datacenter, etc.).
- Manipulación en vivo de variables (personas, área, puertas/ventanas, servidores blade).
- Panel de alertas de mantenimiento y seguridad con registro sin spam.
"""

import math
import random
import tkinter as tk
from tkinter import ttk, messagebox
from typing import List, Dict, Any, Optional, Set

from ambiente import AmbienteTermico, ConfiguracionRecinto
from dispositivos import (
    SensorTemperaturaSimulado,
    VentiladorSimulado,
    CompresorSimulado,
    SensorAperturaSimulado
)
from controlador import ControladorAireAcondicionado, TipoAlerta, EstadoCompresor


# Paleta de colores Dark Modern (estilo Catppuccin / Dashboard Industrial)
COLOR_BG = "#181825"
COLOR_SURFACE = "#1e1e2e"
COLOR_CARD = "#24273a"
COLOR_CARD_BORDER = "#363a4f"
COLOR_TEXT_MAIN = "#cdd6f4"
COLOR_TEXT_MUTED = "#a6adc8"
COLOR_ACCENT_BLUE = "#89b4fa"
COLOR_CYAN = "#89dceb"
COLOR_GREEN = "#a6e3a1"
COLOR_YELLOW = "#f9e2af"
COLOR_RED = "#f38ba8"
COLOR_ORANGE = "#fab387"


class ParticulaAire:
    """Partícula visual de flujo de aire expulsada por el aire acondicionado."""
    def __init__(self, x: float, y: float, vx: float, vy: float, color: str, vida: int):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.color = color
        self.vida = vida
        self.vida_max = vida


class SimuladorGUI:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Simulador de Aire Acondicionado Inverter | Control con Histéresis")
        self.root.geometry("1220x840")
        self.root.minsize(1050, 750)
        self.root.configure(bg=COLOR_BG)

        # -------------------------------------------------------------
        # Instancias del modelo y simulación
        # -------------------------------------------------------------
        self.config_ambiente = ConfiguracionRecinto(
            area_m2=25.0,
            altura_m=2.6,
            personas=2,
            puerta_abierta=False,
            ventana_abierta=False,
            es_datacenter=False,
            servidores_blade_activos=0,
            temperatura_exterior=33.0
        )
        # inercia_estructural=2.0 permite una respuesta térmica ágil y realista
        self.ambiente = AmbienteTermico(self.config_ambiente, temp_inicial=28.5, inercia_estructural=2.0)
        self.sensor = SensorTemperaturaSimulado(ruido_std=0.08)
        self.ventilador = VentiladorSimulado()
        self.compresor = CompresorSimulado(potencia_frigorifica_max_btu=18000.0)
        self.sensor_puerta = SensorAperturaSimulado(False)

        self.controlador = ControladorAireAcondicionado(
            sensor_temp=self.sensor,
            ventilador=self.ventilador,
            compresor=self.compresor,
            sensor_puerta=self.sensor_puerta,
            temperatura_deseada=25.0,
            histeresis_delta=0.8
        )

        # Variables de animación y física
        self.angulo_ventilador_grados = 0.0
        self.particulas: List[ParticulaAire] = []
        self.simulacion_pausada = False
        self.velocidad_simulacion = 10.0  # 10x aceleración predeterminada para respuesta ágil

        # Registro de alertas activas para evitar spam en bitácora
        self._codigos_alertas_activas: Set[str] = set()

        # Construir UI
        self._construir_estilos()
        self._construir_interfaz()

        # Iniciar loop de simulación y animación (30 FPS)
        self.ciclo_frame_ms = 33
        self.root.after(self.ciclo_frame_ms, self._loop_actualizacion)

    def _construir_estilos(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TFrame", background=COLOR_BG)
        style.configure("Card.TFrame", background=COLOR_CARD, relief="flat")
        style.configure("TLabel", background=COLOR_CARD, foreground=COLOR_TEXT_MAIN, font=("Segoe UI", 10))
        style.configure("Header.TLabel", background=COLOR_BG, foreground=COLOR_TEXT_MAIN, font=("Segoe UI", 14, "bold"))
        style.configure("SubHeader.TLabel", background=COLOR_CARD, foreground=COLOR_ACCENT_BLUE, font=("Segoe UI", 11, "bold"))
        style.configure("TCheckbutton", background=COLOR_CARD, foreground=COLOR_TEXT_MAIN, font=("Segoe UI", 9))
        style.configure("TScale", background=COLOR_CARD)

    def _construir_interfaz(self):
        # 1. Barra Superior (Header & Estado Global & Velocidad)
        header_frame = tk.Frame(self.root, bg=COLOR_SURFACE, height=60, padx=15, pady=8)
        header_frame.pack(fill="x", side="top")

        lbl_titulo = tk.Label(
            header_frame,
            text="❄️ SIMULADOR DE AIRE ACONDICIONADO INVERTER",
            font=("Segoe UI", 14, "bold"),
            bg=COLOR_SURFACE,
            fg=COLOR_CYAN
        )
        lbl_titulo.pack(side="left")

        lbl_sub = tk.Label(
            header_frame,
            text="|  Control con Histéresis",
            font=("Segoe UI", 10),
            bg=COLOR_SURFACE,
            fg=COLOR_TEXT_MUTED
        )
        lbl_sub.pack(side="left", padx=8)

        # Botón de Reinicio Global
        btn_reset = tk.Button(
            header_frame,
            text="🔄 Restablecer Todo",
            bg=COLOR_CARD_BORDER,
            fg=COLOR_GREEN,
            font=("Segoe UI", 9, "bold"),
            relief="flat",
            padx=10,
            pady=3,
            command=self._reparar_todo
        )
        btn_reset.pack(side="right", padx=4)

        # Botón de Pausa / Reanudar
        self.btn_pausa = tk.Button(
            header_frame,
            text="⏸️ Pausar",
            bg=COLOR_CARD_BORDER,
            fg=COLOR_TEXT_MAIN,
            font=("Segoe UI", 9, "bold"),
            relief="flat",
            padx=10,
            pady=3,
            command=self._toggle_pausa
        )
        self.btn_pausa.pack(side="right", padx=4)

        # Selector de Velocidad de Simulación (Acelerador de tiempo)
        speed_frame = tk.Frame(header_frame, bg=COLOR_SURFACE)
        speed_frame.pack(side="right", padx=12)

        tk.Label(
            speed_frame,
            text="⚡ Velocidad:",
            font=("Segoe UI", 9, "bold"),
            bg=COLOR_SURFACE,
            fg=COLOR_YELLOW
        ).pack(side="left", padx=3)

        self.btn_speeds: Dict[float, tk.Button] = {}
        for spd in [1.0, 5.0, 10.0, 25.0]:
            is_active = (spd == 10.0)
            b = tk.Button(
                speed_frame,
                text=f"{int(spd)}x",
                font=("Segoe UI", 8, "bold"),
                bg=COLOR_ACCENT_BLUE if is_active else COLOR_CARD_BORDER,
                fg=COLOR_BG if is_active else COLOR_TEXT_MAIN,
                relief="flat",
                padx=6,
                pady=2,
                command=lambda s=spd: self._set_velocidad_simulacion(s)
            )
            b.pack(side="left", padx=2)
            self.btn_speeds[spd] = b

        # 2. Contenedor Principal (2 columnas: Izquierda Visualización, Derecha Controles y Alertas)
        main_container = tk.Frame(self.root, bg=COLOR_BG, padx=12, pady=10)
        main_container.pack(fill="both", expand=True)

        col_izquierda = tk.Frame(main_container, bg=COLOR_BG)
        col_izquierda.pack(side="left", fill="both", expand=True, padx=(0, 8))

        col_derecha = tk.Frame(main_container, bg=COLOR_BG, width=460)
        col_derecha.pack(side="right", fill="both", padx=(8, 0))
        col_derecha.pack_propagate(False)

        # -------------------------------------------------------------
        # COLUMNA IZQUIERDA: VISUALIZACIÓN
        # -------------------------------------------------------------
        # Card del Ventilador y Unidad Interior
        card_ventilador = tk.Frame(col_izquierda, bg=COLOR_CARD, padx=12, pady=10, relief="solid", bd=1)
        card_ventilador.pack(fill="x", pady=(0, 10))

        lbl_tit_vent = tk.Label(
            card_ventilador,
            text="TURBINA DEL EVAPORADOR (VENTILADOR & FLUJO DE AIRE)",
            font=("Segoe UI", 11, "bold"),
            bg=COLOR_CARD,
            fg=COLOR_ACCENT_BLUE
        )
        lbl_tit_vent.pack(anchor="w", pady=(0, 4))

        self.canvas_ventilador = tk.Canvas(
            card_ventilador,
            width=680,
            height=260,
            bg="#11111b",
            highlightthickness=1,
            highlightbackground=COLOR_CARD_BORDER
        )
        self.canvas_ventilador.pack(fill="x", expand=True)

        # Telemetría de turbina
        telemetria_vent_frame = tk.Frame(card_ventilador, bg=COLOR_CARD, pady=4)
        telemetria_vent_frame.pack(fill="x")

        self.lbl_rpm_display = tk.Label(
            telemetria_vent_frame,
            text="Velocidad: 0 RPM (0%)",
            font=("Consolas", 11, "bold"),
            bg=COLOR_CARD,
            fg=COLOR_CYAN
        )
        self.lbl_rpm_display.pack(side="left", padx=5)

        self.lbl_flujo_display = tk.Label(
            telemetria_vent_frame,
            text="Flujo de Aire: 0% | Frío: 0 Watts",
            font=("Consolas", 10),
            bg=COLOR_CARD,
            fg=COLOR_TEXT_MAIN
        )
        self.lbl_flujo_display.pack(side="right", padx=5)

        # Card del Termostato y Monitoreo Térmico
        card_termostato = tk.Frame(col_izquierda, bg=COLOR_CARD, padx=14, pady=10, relief="solid", bd=1)
        card_termostato.pack(fill="both", expand=True)

        lbl_tit_termo = tk.Label(
            card_termostato,
            text="TERMOSTATO DIGITAL & CONTROL DE HISTÉRESIS",
            font=("Segoe UI", 11, "bold"),
            bg=COLOR_CARD,
            fg=COLOR_ACCENT_BLUE
        )
        lbl_tit_termo.pack(anchor="w", pady=(0, 6))

        thermo_grid = tk.Frame(card_termostato, bg=COLOR_CARD)
        thermo_grid.pack(fill="x", pady=4)

        # Display Temperatura Interior Real
        box_temp_actual = tk.Frame(thermo_grid, bg="#11111b", padx=12, pady=8, relief="solid", bd=1)
        box_temp_actual.grid(row=0, column=0, padx=6, sticky="nsew")

        tk.Label(box_temp_actual, text="TEMPERATURA HABITACIÓN", font=("Segoe UI", 8, "bold"), bg="#11111b", fg=COLOR_TEXT_MUTED).pack()
        self.lbl_temp_actual = tk.Label(box_temp_actual, text="28.5 °C", font=("Consolas", 22, "bold"), bg="#11111b", fg=COLOR_YELLOW)
        self.lbl_temp_actual.pack(pady=2)
        self.lbl_sensor_leida = tk.Label(box_temp_actual, text="Sensor: 28.5 °C", font=("Consolas", 9), bg="#11111b", fg=COLOR_TEXT_MUTED)
        self.lbl_sensor_leida.pack()

        # Display Setpoint con botones +/-
        box_setpoint = tk.Frame(thermo_grid, bg="#11111b", padx=12, pady=8, relief="solid", bd=1)
        box_setpoint.grid(row=0, column=1, padx=6, sticky="nsew")

        tk.Label(box_setpoint, text="TEMPERATURA DESEADA", font=("Segoe UI", 8, "bold"), bg="#11111b", fg=COLOR_TEXT_MUTED).pack()
        
        sp_control_frame = tk.Frame(box_setpoint, bg="#11111b")
        sp_control_frame.pack(pady=2)

        btn_down = tk.Button(sp_control_frame, text="➖", bg=COLOR_CARD_BORDER, fg=COLOR_TEXT_MAIN, font=("Segoe UI", 9, "bold"), relief="flat", width=3, command=self._bajar_setpoint)
        btn_down.pack(side="left", padx=4)

        self.lbl_setpoint_display = tk.Label(sp_control_frame, text="25.0 °C", font=("Consolas", 20, "bold"), bg="#11111b", fg=COLOR_CYAN)
        self.lbl_setpoint_display.pack(side="left", padx=4)

        btn_up = tk.Button(sp_control_frame, text="➕", bg=COLOR_CARD_BORDER, fg=COLOR_TEXT_MAIN, font=("Segoe UI", 9, "bold"), relief="flat", width=3, command=self._subir_setpoint)
        btn_up.pack(side="left", padx=4)

        self.lbl_histeresis_band = tk.Label(
            box_setpoint,
            text="Histéresis: [24.2°C - 25.8°C]",
            font=("Segoe UI", 8),
            bg="#11111b",
            fg=COLOR_TEXT_MUTED
        )
        self.lbl_histeresis_band.pack()

        # Estado del Compresor / Histéresis
        box_estado = tk.Frame(thermo_grid, bg="#11111b", padx=12, pady=8, relief="solid", bd=1)
        box_estado.grid(row=0, column=2, padx=6, sticky="nsew")

        tk.Label(box_estado, text="ESTADO COMPRESOR INVERTER", font=("Segoe UI", 8, "bold"), bg="#11111b", fg=COLOR_TEXT_MUTED).pack()
        self.lbl_compresor_estado = tk.Label(box_estado, text="MÁXIMA POTENCIA", font=("Segoe UI", 10, "bold"), bg="#11111b", fg=COLOR_RED)
        self.lbl_compresor_estado.pack(pady=2)
        self.lbl_compresor_pct = tk.Label(box_estado, text="100% de Capacidad", font=("Consolas", 9), bg="#11111b", fg=COLOR_TEXT_MAIN)
        self.lbl_compresor_pct.pack()

        thermo_grid.columnconfigure(0, weight=1)
        thermo_grid.columnconfigure(1, weight=1)
        thermo_grid.columnconfigure(2, weight=1)

        # Barras de Progreso: Compresor Inverter y Presión de Gas
        gauges_frame = tk.Frame(card_termostato, bg=COLOR_CARD, pady=6)
        gauges_frame.pack(fill="x")

        # Barra Compresor
        lbl_g1 = tk.Label(gauges_frame, text="Frecuencia Inverter Compresor:", font=("Segoe UI", 9, "bold"), bg=COLOR_CARD, fg=COLOR_TEXT_MAIN)
        lbl_g1.grid(row=0, column=0, sticky="w", pady=2)
        self.pb_compresor = ttk.Progressbar(gauges_frame, orient="horizontal", mode="determinate", length=380)
        self.pb_compresor.grid(row=0, column=1, sticky="ew", padx=8, pady=2)
        self.lbl_pb_comp_val = tk.Label(gauges_frame, text="100%", font=("Consolas", 9, "bold"), bg=COLOR_CARD, fg=COLOR_TEXT_MAIN)
        self.lbl_pb_comp_val.grid(row=0, column=2, sticky="w")

        # Barra Gas Refrigerante
        lbl_g2 = tk.Label(gauges_frame, text="Presión Gas Refrigerante:", font=("Segoe UI", 9, "bold"), bg=COLOR_CARD, fg=COLOR_TEXT_MAIN)
        lbl_g2.grid(row=1, column=0, sticky="w", pady=2)
        self.pb_gas = ttk.Progressbar(gauges_frame, orient="horizontal", mode="determinate", length=380)
        self.pb_gas.grid(row=1, column=1, sticky="ew", padx=8, pady=2)
        self.lbl_pb_gas_val = tk.Label(gauges_frame, text="120 PSI", font=("Consolas", 9, "bold"), bg=COLOR_CARD, fg=COLOR_GREEN)
        self.lbl_pb_gas_val.grid(row=1, column=2, sticky="w")

        gauges_frame.columnconfigure(1, weight=1)

        # -------------------------------------------------------------
        # COLUMNA DERECHA: CONTROLES, PRESETS Y ALERTAS
        # -------------------------------------------------------------
        # 1. Barra de Escenarios Predefinidos Rápidos
        card_presets = tk.Frame(col_derecha, bg=COLOR_CARD, padx=10, pady=8, relief="solid", bd=1)
        card_presets.pack(fill="x", pady=(0, 8))

        lbl_tit_presets = tk.Label(
            card_presets,
            text="CARGAR ESCENARIOS RÁPIDOS",
            font=("Segoe UI", 9, "bold"),
            bg=COLOR_CARD,
            fg=COLOR_CYAN
        )
        lbl_tit_presets.pack(anchor="w", pady=(0, 4))

        f_presets = tk.Frame(card_presets, bg=COLOR_CARD)
        f_presets.pack(fill="x")

        presets = [
            ("❄️ Normal", self._cargar_preset_normal),
            ("⚠️ Vent. Lento", self._cargar_preset_ventilador_lento),
            ("🧪 Fuga Gas", self._cargar_preset_fuga_gas),
            ("🚪 Puerta+10p", self._cargar_preset_puerta_personas),
            ("🖥️ Datacenter", self._cargar_preset_datacenter)
        ]
        for col_idx, (nombre, callback) in enumerate(presets):
            b_p = tk.Button(
                f_presets,
                text=nombre,
                font=("Segoe UI", 8, "bold"),
                bg="#313244",
                fg=COLOR_TEXT_MAIN,
                relief="flat",
                pady=2,
                command=callback
            )
            b_p.grid(row=0, column=col_idx, padx=2, sticky="ew")
            f_presets.columnconfigure(col_idx, weight=1)

        # 2. Panel de Perturbaciones Térmicas (Variables del ambiente)
        card_ambiente = tk.Frame(col_derecha, bg=COLOR_CARD, padx=10, pady=8, relief="solid", bd=1)
        card_ambiente.pack(fill="x", pady=(0, 8))

        lbl_tit_amb = tk.Label(
            card_ambiente,
            text="VARIABLES AMBIENTALES Y CARGA TÉRMICA",
            font=("Segoe UI", 9, "bold"),
            bg=COLOR_CARD,
            fg=COLOR_ACCENT_BLUE
        )
        lbl_tit_amb.pack(anchor="w", pady=(0, 4))

        # Slider Personas
        f_pers = tk.Frame(card_ambiente, bg=COLOR_CARD)
        f_pers.pack(fill="x", pady=2)
        self.lbl_personas_txt = tk.Label(f_pers, text="Personas en el cuarto: 2 (220 W)", font=("Segoe UI", 9), bg=COLOR_CARD, fg=COLOR_TEXT_MAIN)
        self.lbl_personas_txt.pack(side="left")
        self.scale_personas = tk.Scale(
            f_pers, from_=0, to=15, orient="horizontal", bg=COLOR_CARD, fg=COLOR_TEXT_MAIN,
            highlightthickness=0, showvalue=False, command=self._on_change_personas
        )
        self.scale_personas.set(2)
        self.scale_personas.pack(side="right", fill="x", expand=True, padx=(8, 0))

        # Slider Temp Exterior
        f_ext = tk.Frame(card_ambiente, bg=COLOR_CARD)
        f_ext.pack(fill="x", pady=2)
        self.lbl_ext_txt = tk.Label(f_ext, text="Temperatura Exterior: 33.0 °C", font=("Segoe UI", 9), bg=COLOR_CARD, fg=COLOR_TEXT_MAIN)
        self.lbl_ext_txt.pack(side="left")
        self.scale_ext = tk.Scale(
            f_ext, from_=15, to=45, orient="horizontal", bg=COLOR_CARD, fg=COLOR_TEXT_MAIN,
            highlightthickness=0, showvalue=False, command=self._on_change_temp_exterior
        )
        self.scale_ext.set(33)
        self.scale_ext.pack(side="right", fill="x", expand=True, padx=(8, 0))

        # Puerta y Ventana Toggles
        f_puerta_vent = tk.Frame(card_ambiente, bg=COLOR_CARD, pady=3)
        f_puerta_vent.pack(fill="x")

        self.btn_puerta = tk.Button(
            f_puerta_vent,
            text="🚪 Puerta: CERRADA",
            bg=COLOR_CARD_BORDER,
            fg=COLOR_GREEN,
            font=("Segoe UI", 9, "bold"),
            relief="flat",
            command=self._toggle_puerta
        )
        self.btn_puerta.pack(side="left", fill="x", expand=True, padx=(0, 3))

        self.btn_ventana = tk.Button(
            f_puerta_vent,
            text="🪟 Ventana: CERRADA",
            bg=COLOR_CARD_BORDER,
            fg=COLOR_GREEN,
            font=("Segoe UI", 9, "bold"),
            relief="flat",
            command=self._toggle_ventana
        )
        self.btn_ventana.pack(side="right", fill="x", expand=True, padx=(3, 0))

        # Datacenter Toggle
        self.btn_datacenter = tk.Button(
            card_ambiente,
            text="🖥️ Modo Datacenter (3 Servidores Blade): DESACTIVADO",
            bg=COLOR_CARD_BORDER,
            fg=COLOR_TEXT_MUTED,
            font=("Segoe UI", 9, "bold"),
            relief="flat",
            pady=3,
            command=self._toggle_datacenter
        )
        self.btn_datacenter.pack(fill="x", pady=(3, 0))

        # 3. Panel de Inyección de Fallas
        card_fallas = tk.Frame(col_derecha, bg=COLOR_CARD, padx=10, pady=8, relief="solid", bd=1)
        card_fallas.pack(fill="x", pady=(0, 8))

        lbl_tit_fallas = tk.Label(
            card_fallas,
            text="INYECCIÓN DE FALLAS Y PRUEBAS DE MANTENIMIENTO",
            font=("Segoe UI", 9, "bold"),
            bg=COLOR_CARD,
            fg=COLOR_ORANGE
        )
        lbl_tit_fallas.pack(anchor="w", pady=(0, 4))

        grid_fallas = tk.Frame(card_fallas, bg=COLOR_CARD)
        grid_fallas.pack(fill="x")

        self.btn_falla_vent = tk.Button(
            grid_fallas,
            text="⚠️ Desgaste Ventilador\n(Bajas RPM)",
            bg="#313244",
            fg=COLOR_TEXT_MAIN,
            font=("Segoe UI", 8),
            relief="flat",
            pady=3,
            command=self._inyectar_falla_ventilador
        )
        self.btn_falla_vent.grid(row=0, column=0, sticky="ew", padx=2, pady=2)

        self.btn_fuga_gas = tk.Button(
            grid_fallas,
            text="🧪 Fuga Refrigerante\n(Compresor sin Gas)",
            bg="#313244",
            fg=COLOR_TEXT_MAIN,
            font=("Segoe UI", 8),
            relief="flat",
            pady=3,
            command=self._inyectar_fuga_gas
        )
        self.btn_fuga_gas.grid(row=0, column=1, sticky="ew", padx=2, pady=2)

        self.btn_falla_sensor = tk.Button(
            grid_fallas,
            text="🔌 Desconectar Sensor\n(Circuito Abierto)",
            bg="#313244",
            fg=COLOR_TEXT_MAIN,
            font=("Segoe UI", 8),
            relief="flat",
            pady=3,
            command=self._inyectar_falla_sensor
        )
        self.btn_falla_sensor.grid(row=1, column=0, sticky="ew", padx=2, pady=2)

        self.btn_bloqueo_vent = tk.Button(
            grid_fallas,
            text="🚫 Trabar Turbina\n(0 RPM Motor Quemado)",
            bg="#313244",
            fg=COLOR_TEXT_MAIN,
            font=("Segoe UI", 8),
            relief="flat",
            pady=3,
            command=self._inyectar_bloqueo_total_ventilador
        )
        self.btn_bloqueo_vent.grid(row=1, column=1, sticky="ew", padx=2, pady=2)

        grid_fallas.columnconfigure(0, weight=1)
        grid_fallas.columnconfigure(1, weight=1)

        # 4. Panel de Alertas en Tiempo Real y Bitácora
        card_alertas = tk.Frame(col_derecha, bg=COLOR_CARD, padx=10, pady=8, relief="solid", bd=1)
        card_alertas.pack(fill="both", expand=True)

        lbl_tit_alert = tk.Label(
            card_alertas,
            text="SISTEMA DE DIAGNÓSTICO Y ALERTAS EN VIVO",
            font=("Segoe UI", 9, "bold"),
            bg=COLOR_CARD,
            fg=COLOR_RED
        )
        lbl_tit_alert.pack(anchor="w", pady=(0, 3))

        self.banner_alerta = tk.Label(
            card_alertas,
            text="✅ SISTEMA OPERATIVO Y NORMAL",
            font=("Segoe UI", 9, "bold"),
            bg="#1e3a29",
            fg=COLOR_GREEN,
            padx=8,
            pady=4,
            relief="solid",
            bd=1
        )
        self.banner_alerta.pack(fill="x", pady=(0, 4))

        # Log de eventos / Alertas
        self.txt_alertas = tk.Text(
            card_alertas,
            bg="#11111b",
            fg=COLOR_TEXT_MAIN,
            font=("Consolas", 8),
            wrap="word",
            height=8,
            relief="flat",
            highlightthickness=1,
            highlightbackground=COLOR_CARD_BORDER
        )
        self.txt_alertas.pack(fill="both", expand=True)

        # Botón para limpiar logs
        btn_clear_log = tk.Button(
            card_alertas,
            text="Limpiar Historial",
            bg=COLOR_CARD_BORDER,
            fg=COLOR_TEXT_MUTED,
            font=("Segoe UI", 8),
            relief="flat",
            command=lambda: self.txt_alertas.delete("1.0", tk.END)
        )
        btn_clear_log.pack(anchor="e", pady=(3, 0))

    # -------------------------------------------------------------
    # CONTROLADORES DE EVENTOS Y ACCIONES
    # -------------------------------------------------------------
    def _toggle_pausa(self):
        self.simulacion_pausada = not self.simulacion_pausada
        self.btn_pausa.config(
            text="▶️ Reanudar" if self.simulacion_pausada else "⏸️ Pausar",
            fg=COLOR_YELLOW if self.simulacion_pausada else COLOR_TEXT_MAIN
        )

    def _set_velocidad_simulacion(self, spd: float):
        self.velocidad_simulacion = spd
        for s, btn in self.btn_speeds.items():
            if s == spd:
                btn.config(bg=COLOR_ACCENT_BLUE, fg=COLOR_BG)
            else:
                btn.config(bg=COLOR_CARD_BORDER, fg=COLOR_TEXT_MAIN)
        self._log_mensaje(f"⚡ Velocidad de simulación ajustada a {int(spd)}x.")

    def _subir_setpoint(self):
        nuevo_sp = round(self.controlador.setpoint + 0.5, 1)
        if nuevo_sp <= 32.0:
            self._ajustar_setpoint(nuevo_sp)

    def _bajar_setpoint(self):
        nuevo_sp = round(self.controlador.setpoint - 0.5, 1)
        if nuevo_sp >= 18.0:
            self._ajustar_setpoint(nuevo_sp)

    def _ajustar_setpoint(self, nuevo_sp: float):
        self.controlador.setpoint = nuevo_sp
        self.controlador.umbral_encendido = nuevo_sp + self.controlador.histeresis_delta
        self.controlador.umbral_apagado = nuevo_sp - self.controlador.histeresis_delta
        self.lbl_setpoint_display.config(text=f"{nuevo_sp:.1f} °C")
        self.lbl_histeresis_band.config(
            text=f"Histéresis: [{self.controlador.umbral_apagado:.1f}°C - {self.controlador.umbral_encendido:.1f}°C]"
        )

    def _on_change_personas(self, val):
        n = int(val)
        self.ambiente.set_personas(n)
        watts = n * int(AmbienteTermico.CALOR_POR_PERSONA_WATTS)
        self.lbl_personas_txt.config(text=f"Personas en el cuarto: {n} ({watts} W)")

    def _on_change_temp_exterior(self, val):
        t_ext = float(val)
        self.ambiente.config.temperatura_exterior = t_ext
        self.lbl_ext_txt.config(text=f"Temperatura Exterior: {t_ext:.1f} °C")

    def _toggle_puerta(self):
        abierta = not self.ambiente.config.puerta_abierta
        self.ambiente.set_puerta(abierta)
        if abierta:
            self.btn_puerta.config(text="🚪 Puerta: ABIERTA", fg=COLOR_RED, bg="#4a2530")
        else:
            self.btn_puerta.config(text="🚪 Puerta: CERRADA", fg=COLOR_GREEN, bg=COLOR_CARD_BORDER)

    def _toggle_ventana(self):
        abierta = not self.ambiente.config.ventana_abierta
        self.ambiente.set_ventana(abierta)
        if abierta:
            self.btn_ventana.config(text="🪟 Ventana: ABIERTA", fg=COLOR_RED, bg="#4a2530")
        else:
            self.btn_ventana.config(text="🪟 Ventana: CERRADA", fg=COLOR_GREEN, bg=COLOR_CARD_BORDER)

    def _toggle_datacenter(self):
        activo = not self.ambiente.config.es_datacenter
        self.ambiente.config.es_datacenter = activo
        self.ambiente.config.servidores_blade_activos = 3 if activo else 0
        if activo:
            self.btn_datacenter.config(
                text="🖥️ Modo Datacenter (3 Blades = 7,500W): ACTIVADO",
                fg=COLOR_ORANGE,
                bg="#452a1e"
            )
        else:
            self.btn_datacenter.config(
                text="🖥️ Modo Datacenter (3 Servidores Blade): DESACTIVADO",
                fg=COLOR_TEXT_MUTED,
                bg=COLOR_CARD_BORDER
            )

    def _inyectar_falla_ventilador(self):
        self.ventilador.provocar_degradacion(0.65)
        self.btn_falla_vent.config(bg="#452a1e", fg=COLOR_ORANGE)
        self._log_mensaje("⚠️ INYECCIÓN: Desgaste en rodamientos del ventilador (-65% RPM).")

    def _inyectar_bloqueo_total_ventilador(self):
        self.ventilador.provocar_danio_total(True)
        self.btn_bloqueo_vent.config(bg="#4a2530", fg=COLOR_RED)
        self._log_mensaje("🚫 INYECCIÓN: Turbina de ventilador trabada / quemada (0 RPM).")

    def _inyectar_fuga_gas(self):
        self.compresor.provocar_fuga_gas(porcentaje_por_segundo=2.5)
        self.btn_fuga_gas.config(bg="#4a2530", fg=COLOR_RED)
        self._log_mensaje("🧪 INYECCIÓN: Fuga súbita de gas refrigerante en circuito.")

    def _inyectar_falla_sensor(self):
        self.sensor.provocar_falla_desconexion(True)
        self.btn_falla_sensor.config(bg="#4a2530", fg=COLOR_RED)
        self._log_mensaje("🔌 INYECCIÓN: Desconexión física de cable de sensor de temperatura.")

    def _reparar_todo(self):
        # Restablecer componentes a estado nominal
        self.ventilador.provocar_degradacion(0.0)
        self.ventilador.provocar_danio_total(False)
        self.compresor.tasa_fuga_gas = 0.0
        self.compresor.set_carga_gas(100.0)
        self.sensor.provocar_falla_desconexion(False)
        self.sensor.provocar_falla_congelamiento(False)

        # Rearmar diagnóstico y limpiar registros de alertas
        self.controlador.rearmar_sistema()
        self._codigos_alertas_activas.clear()

        # Restaurar botones
        self.btn_falla_vent.config(bg="#313244", fg=COLOR_TEXT_MAIN)
        self.btn_bloqueo_vent.config(bg="#313244", fg=COLOR_TEXT_MAIN)
        self.btn_fuga_gas.config(bg="#313244", fg=COLOR_TEXT_MAIN)
        self.btn_falla_sensor.config(bg="#313244", fg=COLOR_TEXT_MAIN)

        self._log_mensaje("✅ REPARACIÓN: Todos los componentes han sido restaurados a operación nominal.")

    # -------------------------------------------------------------
    # PRESETS DE ESCENARIOS
    # -------------------------------------------------------------
    def _cargar_preset_normal(self):
        self._reparar_todo()
        self.ambiente.temperatura_interior = 28.5
        self.ambiente.set_personas(2)
        self.scale_personas.set(2)
        self.ambiente.set_puerta(False)
        self.ambiente.set_ventana(False)
        self.btn_puerta.config(text="🚪 Puerta: CERRADA", fg=COLOR_GREEN, bg=COLOR_CARD_BORDER)
        self.btn_ventana.config(text="🪟 Ventana: CERRADA", fg=COLOR_GREEN, bg=COLOR_CARD_BORDER)
        if self.ambiente.config.es_datacenter:
            self._toggle_datacenter()
        self._ajustar_setpoint(25.0)
        self._log_mensaje("🎯 PRESET: Escenario 1 cargado (Operación Normal con Histéresis 28.5°C -> 25°C).")

    def _cargar_preset_ventilador_lento(self):
        self._cargar_preset_normal()
        self._inyectar_falla_ventilador()
        self._log_mensaje("🎯 PRESET: Escenario 2 cargado (Ventilador con Fricción / Bajas RPM).")

    def _cargar_preset_fuga_gas(self):
        self._cargar_preset_normal()
        self.ambiente.temperatura_interior = 29.5
        self._inyectar_fuga_gas()
        self._log_mensaje("🎯 PRESET: Escenario 3 cargado (Fuga de Gas -> Alerta de Mantenimiento).")

    def _cargar_preset_puerta_personas(self):
        self._reparar_todo()
        self.ambiente.temperatura_interior = 28.0
        self.ambiente.set_personas(10)
        self.scale_personas.set(10)
        self.ambiente.set_puerta(True)
        self.btn_puerta.config(text="🚪 Puerta: ABIERTA", fg=COLOR_RED, bg="#4a2530")
        self._log_mensaje("🎯 PRESET: Escenario 5 cargado (Sobreesfuerzo: 10 Personas y Puerta Abierta).")

    def _cargar_preset_datacenter(self):
        self._reparar_todo()
        self.ambiente.temperatura_interior = 26.5
        self.ambiente.set_personas(0)
        self.scale_personas.set(0)
        if not self.ambiente.config.es_datacenter:
            self._toggle_datacenter()
        self._log_mensaje("🎯 PRESET: Escenario 6 cargado (Datacenter con Servidores Blade de Alta Carga).")

    def _log_mensaje(self, msg: str):
        self.txt_alertas.insert(tk.END, msg + "\n")
        self.txt_alertas.see(tk.END)

    # -------------------------------------------------------------
    # BUCLE DE ACTUALIZACIÓN (Física + Control + Renderizado)
    # -------------------------------------------------------------
    def _loop_actualizacion(self):
        # Desacoplamiento:
        # dt_anim se mantiene constante a ~0.033 s para animación fluida a 30 FPS.
        # dt_sim escala con la velocidad_simulacion para acelerar la termodinámica.
        dt_anim = self.ciclo_frame_ms / 1000.0
        dt_sim = dt_anim * self.velocidad_simulacion

        if not self.simulacion_pausada:
            # 1. Sincronizar sensores con física
            self.sensor.actualizar_temperatura_real(self.ambiente.temperatura_interior)
            self.sensor_puerta.set_estado(self.ambiente.config.puerta_abierta or self.ambiente.config.ventana_abierta)

            # 2. Ciclo de control (Histéresis / Inverter)
            telemetria = self.controlador.ejecutar_ciclo(dt=dt_sim)

            # 3. Avance de actuadores
            self.ventilador.actualizar(dt=dt_sim)
            self.compresor.actualizar(dt=dt_sim)

            # 4. Cálculo de calor retirado y actualización del ambiente
            flujo_aire = self.ventilador.get_flujo_aire_relativo()
            calor_extraido_w = self.compresor.get_calor_extraido_watts(flujo_aire)
            self.ambiente.actualizar(calor_extraido_w, dt=dt_sim)

            # 5. Actualizar interfaz y dashboard
            self._actualizar_dashboard(telemetria, calor_extraido_w)

        # 6. Renderizar gráficos del ventilador y partículas con dt_anim suave
        self._renderizar_canvas_ventilador(dt_anim)

        self.root.after(self.ciclo_frame_ms, self._loop_actualizacion)

    def _actualizar_dashboard(self, tel: Dict[str, Any], calor_extraido_w: float):
        t_real = self.ambiente.temperatura_interior
        t_sensor = tel["temp_leida"]
        rpm = tel["rpm_ventilador_actual"]
        cap_comp = tel["capacidad_compresor_pct"]
        presion_psi = tel["presion_gas_psi"]
        alertas = tel["alertas"]

        # Display de Temperatura Habitación
        self.lbl_temp_actual.config(text=f"{t_real:.1f} °C")
        if t_real > self.controlador.setpoint + 2.0:
            self.lbl_temp_actual.config(fg=COLOR_RED)
        elif t_real > self.controlador.setpoint + 0.5:
            self.lbl_temp_actual.config(fg=COLOR_YELLOW)
        elif t_real < self.controlador.setpoint - 0.5:
            self.lbl_temp_actual.config(fg=COLOR_CYAN)
        else:
            self.lbl_temp_actual.config(fg=COLOR_GREEN)

        if t_sensor is not None:
            self.lbl_sensor_leida.config(text=f"Sensor: {t_sensor:.1f} °C", fg=COLOR_TEXT_MUTED)
        else:
            self.lbl_sensor_leida.config(text="Sensor: ERROR (DESCONECTADO)", fg=COLOR_RED)

        # Display Estado Compresor
        estado_nombre = tel["estado_compresor"]
        color_estado = COLOR_TEXT_MUTED
        if estado_nombre == EstadoCompresor.APAGADO.value:
            color_estado = COLOR_TEXT_MUTED
            texto_estado = "REPOSO (CORTE HISTÉRESIS)"
        elif estado_nombre == EstadoCompresor.MODULANDO.value:
            color_estado = COLOR_GREEN
            texto_estado = "MODULACIÓN INVERTER"
        elif estado_nombre == EstadoCompresor.MAXIMA_POTENCIA.value:
            color_estado = COLOR_RED
            texto_estado = "MÁXIMA POTENCIA (100%)"
        else:
            color_estado = COLOR_RED
            texto_estado = "BLOQUEO POR FALLA"

        self.lbl_compresor_estado.config(text=texto_estado, fg=color_estado)
        self.lbl_compresor_pct.config(text=f"{cap_comp:.0f}% de Capacidad ({calor_extraido_w:.0f} W Frío)")

        # Barras de Progreso
        self.pb_compresor["value"] = cap_comp
        self.lbl_pb_comp_val.config(text=f"{cap_comp:.0f}%")

        pct_gas = max(0, min(100, (presion_psi / 120.0) * 100))
        self.pb_gas["value"] = pct_gas
        self.lbl_pb_gas_val.config(text=f"{presion_psi:.0f} PSI")
        if presion_psi < 70.0:
            self.lbl_pb_gas_val.config(fg=COLOR_RED)
        elif presion_psi < 95.0:
            self.lbl_pb_gas_val.config(fg=COLOR_YELLOW)
        else:
            self.lbl_pb_gas_val.config(fg=COLOR_GREEN)

        # Telemetría de turbina
        self.lbl_rpm_display.config(text=f"Velocidad: {rpm:.0f} RPM ({self.ventilador.get_flujo_aire_relativo()*100:.0f}%)")
        self.lbl_flujo_display.config(
            text=f"Flujo Aire: {self.ventilador.get_flujo_aire_relativo()*100:.0f}% | Frío Extraído: {calor_extraido_w:.0f} Watts"
        )

        # Registro de alertas sin duplicados / spam
        codigos_actuales = {a.codigo for a in alertas}
        for a in alertas:
            if a.codigo not in self._codigos_alertas_activas:
                self._codigos_alertas_activas.add(a.codigo)
                self._log_mensaje(f"⚠️ [{a.tipo.value}] ({a.codigo}): {a.mensaje}")

        despejadas = self._codigos_alertas_activas - codigos_actuales
        for c in list(despejadas):
            self._codigos_alertas_activas.remove(c)
            self._log_mensaje(f"✅ NORMALIZADO: Se resolvió la condición de alerta ({c}).")

        # Banner superior de diagnóstico
        if alertas:
            alerta_top = alertas[-1]
            if alerta_top.tipo == TipoAlerta.CRITICA:
                self.banner_alerta.config(text=f"🚨 {alerta_top.mensaje}", bg="#4a2530", fg=COLOR_RED)
            elif alerta_top.tipo == TipoAlerta.MANTENIMIENTO:
                self.banner_alerta.config(text=f"🔧 {alerta_top.mensaje}", bg="#452a1e", fg=COLOR_ORANGE)
            else:
                self.banner_alerta.config(text=f"⚠️ {alerta_top.mensaje}", bg="#423b20", fg=COLOR_YELLOW)
        else:
            self.banner_alerta.config(text="✅ SISTEMA OPERATIVO Y NORMAL", bg="#1e3a29", fg=COLOR_GREEN)

    # -------------------------------------------------------------
    # RENDERIZADO VISUAL DEL VENTILADOR Y PARTÍCULAS
    # -------------------------------------------------------------
    def _renderizar_canvas_ventilador(self, dt_anim: float):
        canvas = self.canvas_ventilador
        canvas.delete("all")

        w = canvas.winfo_width() or 680
        h = canvas.winfo_height() or 260

        rpm = self.ventilador.get_rpm_actual()

        # Incrementar ángulo del ventilador según RPM real y dt_animación suave
        velocidad_angular_grados_seg = (rpm / 60.0) * 360.0
        self.angulo_ventilador_grados = (self.angulo_ventilador_grados + velocidad_angular_grados_seg * dt_anim) % 360.0

        # 1. Dibujar Carcasa de la Unidad Interior (Split)
        x_ac1, y_ac1 = 30, 20
        x_ac2, y_ac2 = w - 30, 150

        # Fondo chasis
        canvas.create_rectangle(x_ac1, y_ac1, x_ac2, y_ac2, fill="#1e1e2e", outline="#45475a", width=2)
        # Borde biselado
        canvas.create_rectangle(x_ac1 + 5, y_ac1 + 5, x_ac2 - 5, y_ac2 - 5, fill="#181825", outline="#313244", width=1)
        
        # Display LED digital integrado en la carcasa
        canvas.create_rectangle(x_ac2 - 130, y_ac1 + 20, x_ac2 - 30, y_ac1 + 75, fill="#11111b", outline="#313244")
        t_disp = f"{self.ambiente.temperatura_interior:.1f}°" if self.sensor.leer_temperatura() is not None else "--°"
        canvas.create_text(x_ac2 - 80, y_ac1 + 47, text=t_disp, fill=COLOR_CYAN, font=("Consolas", 18, "bold"))
        canvas.create_text(x_ac2 - 80, y_ac1 + 88, text="TEMP AMBIENTE", fill=COLOR_TEXT_MUTED, font=("Segoe UI", 7, "bold"))

        # Rejilla de aspiración superior
        for lx in range(x_ac1 + 20, x_ac2 - 150, 15):
            canvas.create_line(lx, y_ac1 + 8, lx + 5, y_ac1 + 22, fill="#313244", width=2)

        # 2. Dibujar Turbina Tangencial / Ventilador Circular
        cx = (x_ac1 + x_ac2 - 140) / 2
        cy = (y_ac1 + y_ac2) / 2
        radio = 50

        # Alojamiento circular del ventilador
        canvas.create_oval(cx - radio - 6, cy - radio - 6, cx + radio + 6, cy + radio + 6, fill="#11111b", outline="#45475a", width=2)
        canvas.create_oval(cx - radio, cy - radio, cx + radio, cy + radio, fill="#181825", outline="#313244")

        # Dibujar aspas rotatorias (6 aspas curvas)
        num_aspas = 6
        angulo_base_rad = math.radians(self.angulo_ventilador_grados)

        # Color de las aspas según salud mecánica
        color_aspa = COLOR_ACCENT_BLUE
        if not self.ventilador.esta_operativo():
            color_aspa = COLOR_RED
        elif self.ventilador.degradacion_mecanica > 0.3:
            color_aspa = COLOR_ORANGE

        for i in range(num_aspas):
            theta = angulo_base_rad + (2 * math.pi * i / num_aspas)
            
            x_ini = cx + 12 * math.cos(theta)
            y_ini = cy + 12 * math.sin(theta)

            x_mid = cx + (radio * 0.65) * math.cos(theta + 0.3)
            y_mid = cy + (radio * 0.65) * math.sin(theta + 0.3)

            x_fin = cx + radio * math.cos(theta + 0.1)
            y_fin = cy + radio * math.sin(theta + 0.1)

            canvas.create_line(x_ini, y_ini, x_mid, y_mid, x_fin, y_fin, fill=color_aspa, width=4, smooth=True)

        # Núcleo / Eje central metálico
        canvas.create_oval(cx - 14, cy - 14, cx + 14, cy + 14, fill="#313244", outline="#585b70", width=2)
        canvas.create_oval(cx - 6, cy - 6, cx + 6, cy + 6, fill="#cdd6f4")

        # 3. Deflector inferior y salida de aire
        canvas.create_rectangle(x_ac1 + 20, y_ac2 - 12, x_ac2 - 20, y_ac2 + 2, fill="#313244", outline="#45475a")

        # 4. Generación y Renderizado de Partículas de Flujo de Aire
        if rpm > 80:
            flujo = self.ventilador.get_flujo_aire_relativo()
            particulas_por_frame = int(1 + flujo * 3)

            # Azul frío si el compresor está trabajando con gas; gris si solo recircula aire
            if self.compresor.get_capacidad() > 10 and self.compresor.get_presion_refrigerante() > 60:
                color_p = COLOR_CYAN if random.random() > 0.3 else COLOR_ACCENT_BLUE
            else:
                color_p = "#585b70"

            for _ in range(particulas_por_frame):
                px = random.uniform(x_ac1 + 40, x_ac2 - 40)
                py = y_ac2 + 4
                vx = random.uniform(-0.8, 0.8)
                vy = random.uniform(2.0, 4.5) * (flujo + 0.2)
                vida = random.randint(18, 30)
                self.particulas.append(ParticulaAire(px, py, vx, vy, color_p, vida))

        # Actualizar y pintar partículas activas
        particulas_vivas = []
        for p in self.particulas:
            p.x += p.vx
            p.y += p.vy
            p.vida -= 1

            if p.vida > 0 and p.y < h - 8:
                alfa_radio = (p.vida / p.vida_max) * 3.5
                canvas.create_oval(
                    p.x - alfa_radio,
                    p.y - alfa_radio,
                    p.x + alfa_radio,
                    p.y + alfa_radio,
                    fill=p.color,
                    outline=""
                )
                particulas_vivas.append(p)

        self.particulas = particulas_vivas


def iniciar_gui():
    root = tk.Tk()
    app = SimuladorGUI(root)
    root.mainloop()


if __name__ == "__main__":
    iniciar_gui()
