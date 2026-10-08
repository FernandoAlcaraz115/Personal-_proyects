# Sistema de Simulación de Aire Acondicionado (Inverter + Histéresis)

Este proyecto simula de forma modular y pedagógica el funcionamiento termodinámico y el sistema de control de un **Aire Acondicionado con Tecnología Inverter e Histéresis**, preparado para integrarse con los módulos de sensores y actuadores provistos por el equipo de **Alonso Reséndiz**.

---

## 📚 Fundamentos Teóricos y Objetivos de Aprendizaje

### 1. ¿Por qué los aparatos no pueden estar encendidos 24 horas y qué es la Histéresis?
En los sistemas de refrigeración por compresión de vapor convencionales (On/Off), si el termostato intentara mantener exactamente 25.0 °C, el compresor se encendería a 25.01 °C y se apagaría a 24.99 °C. 
- Este fenómeno (denominado *chattering* o ciclado rápido) provocaría cientos de arranques por hora.
- Los motores eléctricos consumen entre **4 y 7 veces su corriente nominal** durante el arranque (corriente de rotor bloqueado), lo que calienta los devanados, desgasta los relevadores mecánicos y destruye prematuramente el compresor.
- **La Histéresis (Banda Muerta):** Establece dos umbrales alrededor del *setpoint* ($T_{deseada} = 25.0^\circ\text{C}$ con $\Delta = \pm 0.8^\circ\text{C}$):
  1. **Umbral de Encendido / Activación ($T \ge 25.8^\circ\text{C}$):** El equipo activa el ciclo de refrigeración.
  2. **Umbral de Reposo / Corte ($T \le 24.2^\circ\text{C}$):** El compresor se apaga completamente, permitiendo que las presiones del circuito se estabilicen y los componentes mecánicos descansen.
  3. **Banda de Tolerancia ($24.2^\circ\text{C} < T < 25.8^\circ\text{C}$):** Si ya está encendido, continúa refrigerando; si está apagado, permanece en reposo.

### 2. ¿Cómo complementa la Tecnología Inverter a la Histéresis?
A diferencia de los equipos tradicionales que solo conocen 0% o 100% de potencia:
- Un equipo **Inverter** utiliza un variador de frecuencia (VFD) para modular la velocidad angular del compresor de forma continua (ej. entre 25% y 100%).
- Cuando la temperatura está muy lejos del objetivo ($T > 28^\circ\text{C}$), el inversor trabaja al **100%**.
- A medida que la temperatura se aproxima a los 25.0 °C, el inversor reduce la velocidad (al 30% - 40%), extrayendo exactamente la cantidad de calor que ingresa a la habitación.
- Si aun a mínima modulación la temperatura sigue cayendo y cruza el umbral inferior de histéresis (24.2 °C), el compresor pasa a **reposo seguro**.

---

## 🤝 Guía de Integración con el Equipo de Alonso Reséndiz

El proyecto fue diseñado bajo el principio de **Inversión de Dependencias (DIP)**. Todos los componentes de hardware e interfaces están desacoplados en el archivo [dispositivos.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/dispositivos.py).

### Contratos de Interfaz (Protocolos Abstractos):

```python
class ISensorTemperatura(ABC):
    @abstractmethod
    def leer_temperatura(self) -> Optional[float]:
        """Debe retornar la temperatura en °C o None si hay falla."""
        pass

class IVentilador(ABC):
    @abstractmethod
    def set_velocidad_objetivo(self, porcentaje: float) -> None:
        """Recibe la velocidad requerida de 0.0% a 100.0%."""
        pass

    @abstractmethod
    def get_rpm_actual(self) -> float:
        """Debe retornar las RPM reales medidas por tacómetro."""
        pass

class ICompresor(ABC):
    @abstractmethod
    def set_capacidad(self, porcentaje: float) -> None:
        """Modula la frecuencia Inverter (0.0% a 100.0%)."""
        pass

    @abstractmethod
    def get_presion_refrigerante(self) -> float:
        """Retorna la presión de gas en PSI (120 PSI nominal para R410A)."""
        pass

class ISensorApertura(ABC):
    @abstractmethod
    def esta_abierto(self) -> bool:
        """Retorna True si la puerta o ventana está abierta."""
        pass
```

### ¿Cómo conecta su módulo el equipo de Alonso?
El equipo de Alonso solo necesita implementar estas interfaces en sus clases (ya sean mocks, comunicación por puerto serial, MQTT, microcontrolador ESP32 o simulación física propia) e inyectarlas en el constructor del controlador:

```python
from controlador import ControladorAireAcondicionado
# Clases desarrolladas por el equipo de Alonso Reséndiz:
from modulo_alonso import SensorAlonso, VentiladorAlonso, CompresorAlonso

controlador = ControladorAireAcondicionado(
    sensor_temp=SensorAlonso(),
    ventilador=VentiladorAlonso(),
    compresor=CompresorAlonso(),
    temperatura_deseada=25.0,
    histeresis_delta=0.8
)
```

---

## 🌡️ Factores de Sobreesfuerzo y Física del Recinto

En [ambiente.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/ambiente.py) se modela el balance de calor sensible en tiempo discreto:

$$\Delta T = \frac{\sum Q_{\text{ganancias}} - Q_{\text{enfriamiento}}}{m_{\text{aire}} \cdot c_p \cdot \text{inercia}} \cdot \Delta t$$

1. **Área y Volumen de la Habitación:** Determinan la masa de aire $m = A \times h \times \rho$. A mayor volumen, mayor inercia térmica y tiempo requerido para enfriar.
2. **Carga Humana (Personas):** Cada persona en reposo/oficina disipa aproximadamente $\mathbf{110\text{ W}}$ de calor metabólico continuo.
3. **Infiltración (Puertas / Ventanas abiertas):** Al abrir una puerta hacia el exterior caliente ($34-36^\circ\text{C}$), se produce un caudal convectivo de $0.35\text{ m}^3/\text{s}$ ($\approx 1200\text{ m}^3/\text{h}$), introduciendo miles de vatios de calor exterior y anulando el esfuerzo del equipo.
4. **Centro de Cómputo (Datacenter con servidores Blade):** Cada chasis blade disipa típicamente entre $\mathbf{2,500\text{ W}}$ y $\mathbf{3,500\text{ W}}$. En un cuarto con 3 a 5 chasis blade, la carga puede superar los $12,500\text{ W}$, requiriendo equipos de alta capacidad continua (36,000+ BTU/h).

---

## 🚨 Detección de Fallas y Alertas Implementadas

| Componente | Falla / Condición | Síntoma Físico | Diagnóstico y Alerta |
| :--- | :--- | :--- | :--- |
| **Tacómetro Ventilador** | Desgaste en rodamientos / suciedad | RPM medidas $< 65\%$ de las requeridas | `[ADVERTENCIA] (WARN_VENTILADOR_LENTO): Ventilador con revoluciones insuficientes. Enfriamiento lento.` |
| **Turbina Ventilador** | Motor quemado o trabado | $0\text{ RPM}$ con ventilador encendido | `[CRITICA] (ERR_VENTILADOR_DETENIDO): Ventilador bloqueado. Riesgo de congelamiento de serpentín.` |
| **Compresor** | Fuga de refrigerante / sin gas | Presión $< 70\text{ PSI}$ y temperatura no desciende a pesar del 100% de potencia | `[MANTENIMIENTO] (ALERTA_MANTENIMIENTO_GAS_BAJO): Presión baja de refrigerante. Posible fuga de gas.` |
| **Sensor Temp.** | Desconexión o cable roto | Lectura = `None` o fuera de $[-5^\circ\text{C}, 65^\circ\text{C}]$ | `[CRITICA] (ERR_SENSOR_DESCONECTADO): Apagado de seguridad preventivo del compresor.` |
| **Sensor Temp.** | Sensor trabado / congelado | Mismo valor continuo por $>60$ ciclos con enfriamiento activo | `[ADVERTENCIA] (WARN_SENSOR_CONGELADO): Posible sensor trabado.` |
| **Puerta / Ventana** | Olvidada abierta | Contacto magnético abierto por $> 15\text{ s}$ | `[ADVERTENCIA] (WARN_PUERTA_ABIERTA_PROLONGADA): Puerta abierta prolongadamente. Sobreesfuerzo del A/C.` |
| **Recinto** | Sobrecarga de calor | Compresor al $>80\%$ por $>20\text{ s}$ y temperatura sube | `[ADVERTENCIA] (WARN_SOBRECARGA_TERMICA): Carga de calor supera capacidad del A/C.` |

---

## 🚀 Guía de Ejecución

### 1. Interfaz Gráfica Interactiva (GUI con Ventilador Animado) 🖥️✨
Para abrir la aplicación gráfica con visualización de turbina rotatoria en tiempo real, termostato digital y panel de fallas:
```powershell
python gui.py
```
o también:
```powershell
python main.py --gui
```

#### Características de la GUI:
- **Turbina del Evaporador Animada:** Aspas que giran en tiempo real proporcionalmente a las RPM leídas por el tacómetro.
- **Efecto de Partículas de Aire:** Partículas cian/azules de aire frío expulsadas cuando el compresor opera y el ventilador gira; partículas tenues de recirculación si el compresor está en reposo; o ausencia total de flujo si el ventilador se traba.
- **Termostato Digital:** Ajuste del setpoint en vivo con botones `➕` / `➖`, visualización de la banda de histéresis y del estado del inversor (`REPOSO POR HISTÉRESIS`, `MODULACIÓN INVERTER`, `MÁXIMA POTENCIA`).
- **Medidores en Tiempo Real:** Barras de modulación Inverter (0% a 100%) y de presión de gas refrigerante (PSI).
- **Controles en Vivo:** Sliders de cantidad de personas (0 a 15) y temperatura exterior; botones para abrir/cerrar puerta y ventana; y switch para activar modo Datacenter con servidores Blade (+7,500 W).
- **Inyección Interactiva de Fallas:** Botones para simular desgaste del ventilador (bajas RPM), fuga de gas refrigerante, desconexión del sensor o bloqueo total, acompañados de un botón para **Restablecer / Reparar Todo**.
- **Panel de Alertas y Diagnóstico:** Semáforo de estado y bitácora con registro en tiempo real de advertencias de mantenimiento.

---

### 2. Menú Interactivo en Consola
Para iniciar el menú de consola:
```powershell
python main.py
```

### 3. Ejecución Directa de Escenarios en Consola
Puedes correr directamente cualquiera de los escenarios requeridos:

- **Escenario 1 (Operación Normal con Histéresis e Inverter):**
  ```powershell
  python main.py --scenario 1
  ```
- **Escenario 2 (Falla Mecánica de Ventilador - Bajas RPM):**
  ```powershell
  python main.py --scenario 2
  ```
- **Escenario 3 (Fuga de Gas y Alerta de Mantenimiento):**
  ```powershell
  python main.py --scenario 3
  ```
- **Escenario 4 (Falla en Sensor de Temperatura y Parada Segura):**
  ```powershell
  python main.py --scenario 4
  ```
- **Escenario 5 (Sobreesfuerzo por Personas y Puerta Abierta):**
  ```powershell
  python main.py --scenario 5
  ```
- **Escenario 6 (Caso Datacenter con Servidores Blade):**
  ```powershell
  python main.py --scenario 6
  ```

*(Agrega `--fast` si deseas ejecutar la simulación de forma instantánea sin pausas visuales).*

### 4. Pruebas Unitarias Automatizadas
Para ejecutar la suite de 6 pruebas unitarias:
```powershell
python test_sistema.py
```
o también:
```powershell
python main.py --test
```

---

## 📁 Estructura del Proyecto en la Carpeta `Ventilador`

- [gui.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/gui.py): **Interfaz Gráfica (GUI)** con animación fluida de turbina rotatoria, partículas de flujo de aire frío/neutro, termostato digital interactivo, medidores y panel de fallas.
- [dispositivos.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/dispositivos.py): Interfaces estándar (`ISensorTemperatura`, `IVentilador`, `ICompresor`, `ISensorApertura`) y componentes simulados con inyección de fallas.
- [ambiente.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/ambiente.py): Modelo físico termodinámico del cuarto (cálculo de $m^3$, masa de aire, cargas por personas, puertas y servidores blade).
- [controlador.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/controlador.py): Cerebro del aire acondicionado con algoritmos de histéresis, tecnología inverter y motor de diagnóstico de fallas y alertas de mantenimiento.
- [simulador.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/simulador.py): Motor de integración temporal en tiempo discreto con formato tabular de telemetría en terminal.
- [escenarios.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/escenarios.py): Catálogo con los escenarios de prueba preconfigurados.
- [test_sistema.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/test_sistema.py): Pruebas de regresión unitaria (`unittest`).
- [main.py](file:///c:/Users/ferna/OneDrive/Documentos/Portafolio/Ventilador/main.py): Interfaz de usuario interactiva y punto de entrada CLI.

