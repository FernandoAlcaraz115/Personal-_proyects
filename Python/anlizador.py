"""
═══════════════════════════════════════════════════════════════════════════════
  ANALIZADOR SEMÁNTICO DESCENDENTE RECURSIVO  —  VERSIÓN MEJORADA (TURBO)
═══════════════════════════════════════════════════════════════════════════════

Mejoras implementadas:
  ✓ Operadores unarios  (+5, -3, -(2+1))
  ✓ Exponente (^) con precedencia CORRECTA: más fuerte que * y /,
    más débil que los paréntesis, asociativo a la derecha
  ✓ Variables con tabla de símbolos  (x = 5, luego x + 3)
  ✓ Manejo de errores robusto con posición exacta del token problemático
  ✓ Protección contra división por cero
  ✓ Panel de tests automáticos integrado
  ✓ Historial de expresiones evaluadas
  ✓ Exportación de árbol y bitácora a archivo
  ✓ Tooltips y UX pulida

Gramática (LL(1) extendida) — orden de precedencia de mayor a menor:
    F (paréntesis / número / variable)  >  P (^)  >  T (*, /)  >  U (unario)  >  E (+, -)

    S   -> ID = E | E        (S es el símbolo inicial: asignación o expresión)
    E   -> U E'
    E'  -> + U E' | - U E' | ε
    U   -> + U | - U | T
    T   -> P T'
    T'  -> * P T' | / P T' | ε
    P   -> F P'
    P'  -> ^ U | ε          (exponente, asociativo por la derecha)
    F   -> ( E ) | NUM | ID
"""

import re
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from datetime import datetime


# ═══════════════════════════════════════════════════════════════════════════════
# 1. ANALIZADOR LÉXICO  (con posiciones para reporte de errores)
# ═══════════════════════════════════════════════════════════════════════════════
TOKEN_RE = re.compile(r"\s*(?:(\d+\.\d+|\d+)|([A-Za-z_][A-Za-z0-9_]*)|(.))")


def tokenize(texto):
    """Tokeniza la entrada y devuelve tokens con posición de inicio."""
    tokens = []
    pos = 0
    while pos < len(texto):
        m = TOKEN_RE.match(texto, pos)
        if not m:
            raise SyntaxError(f"Carácter no válido en posición {pos}: '{texto[pos]}'")
        num, ident, otro = m.groups()
        if num:
            tokens.append(("NUM", float(num), m.start()))
        elif ident:
            tokens.append(("ID", ident, m.start()))
        elif otro.strip():
            tokens.append((otro, otro, m.start()))
        pos = m.end()
    tokens.append(("EOF", None, len(texto)))
    return tokens


# ═══════════════════════════════════════════════════════════════════════════════
# 2. NODO DEL ÁRBOL DE ANÁLISIS ANOTADO
# ═══════════════════════════════════════════════════════════════════════════════
class Nodo:
    def __init__(self, etiqueta, valor, hijos=None, pos=None):
        self.etiqueta = etiqueta
        self.valor = valor
        self.hijos = hijos or []
        self.pos = pos  # posición del token, útil para resaltar errores


# ═══════════════════════════════════════════════════════════════════════════════
# 3. PARSER DESCENDENTE RECURSIVO CON ACCIONES SEMÁNTICAS + BITÁCORA
# ═══════════════════════════════════════════════════════════════════════════════
class Parser:
    def __init__(self, tokens, texto_original=""):
        self.tokens = tokens
        self.pos = 0
        self.trace = []
        self.texto = texto_original
        self.variables = {}  # reservado para una futura extensión con variables

    def actual(self):
        return self.tokens[self.pos]

    def avanzar(self):
        self.pos += 1

    def error(self, mensaje):
        """Genera un error con posición exacta en la cadena."""
        tipo, val, idx = self.actual()
        if tipo == "EOF":
            raise SyntaxError(f"{mensaje}  (al final de la expresión)")
        antes = self.texto[:idx]
        linea = antes.count('\n') + 1
        col = len(antes) - antes.rfind('\n') if '\n' in antes else idx + 1
        raise SyntaxError(f"{mensaje}\n  → Token: '{val}' en posición {idx} (línea {linea}, col {col})")

    # ---------- E  (suma / resta, la menor precedencia) ----------
    def E(self):
        return self.E_prima(self.U())

    def E_prima(self, izq):
        tipo, _, idx = self.actual()
        if tipo in ("+", "-"):
            op = tipo
            self.avanzar()
            der = self.U()
            valor = izq.valor + der.valor if op == "+" else izq.valor - der.valor
            self.trace.append(f"E → E {op} U   :  {izq.valor} {op} {der.valor} = {valor}")
            return self.E_prima(Nodo(f"E ({op})", valor, [izq, der], idx))
        return izq

    # ---------- U  (unarios +/-) ----------
    def U(self):
        tipo, _, idx = self.actual()
        if tipo in ("+", "-"):
            op = tipo
            self.avanzar()
            hijo = self.U()
            valor = hijo.valor if op == "+" else -hijo.valor
            self.trace.append(f"U → {op} U     :  {op}{hijo.valor} = {valor}")
            return Nodo(f"U ({op})", valor, [hijo], idx)
        return self.T()

    # ---------- T  (multiplicación / división) ----------
    def T(self):
        return self.T_prima(self.P())

    def T_prima(self, izq):
        tipo, _, idx = self.actual()
        if tipo in ("*", "/"):
            op = tipo
            self.avanzar()
            der = self.P()
            if op == "/" and der.valor == 0:
                self.error("División por cero")
            valor = izq.valor * der.valor if op == "*" else izq.valor / der.valor
            self.trace.append(f"T → T {op} P   :  {izq.valor} {op} {der.valor} = {valor}")
            return self.T_prima(Nodo(f"T ({op})", valor, [izq, der], idx))
        return izq

    # ---------- P  (potencia, mayor precedencia que *, / ) ----------
    def P(self):
        izq = self.F()
        return self.P_prima(izq)

    def P_prima(self, izq):
        tipo, _, idx = self.actual()
        if tipo == "^":
            self.avanzar()
            der = self.U()  # asociatividad derecha: a ^ b ^ c = a ^ (b ^ c)
            # Manejo de base negativa con exponente no entero
            if izq.valor < 0 and not float(der.valor).is_integer():
                self.error("No se puede elevar un número negativo a un exponente no entero")
            valor = izq.valor ** der.valor
            self.trace.append(f"P → P ^ U    :  {izq.valor} ^ {der.valor} = {valor}")
            return Nodo("P (^)", valor, [izq, der], idx)
        return izq

    # ---------- F  (paréntesis, números y variables — la mayor precedencia) ----------
    def F(self):
        tipo, val, idx = self.actual()
        if tipo == "NUM":
            self.avanzar()
            self.trace.append(f"F → NUM      :  valor = {val}")
            return Nodo("NUM", val, pos=idx)
        elif tipo == "ID":
            self.avanzar()
            if val not in self.variables:
                self.error(f"Variable no definida: '{val}'")
            valor = self.variables[val]
            self.trace.append(f"F → ID       :  {val} = {valor}")
            return Nodo(f"ID ({val})", valor, pos=idx)
        elif tipo == "(":
            self.avanzar()
            nodo_e = self.E()
            if self.actual()[0] != ")":
                self.error("Se esperaba ')'")
            self.avanzar()
            self.trace.append(f"F → ( E )    :  valor = {nodo_e.valor}")
            return Nodo("F ( )", nodo_e.valor, [nodo_e], idx)
        else:
            self.error("Token inesperado: se esperaba número, variable o '('")

    # ---------- S  (símbolo inicial: asignación o expresión) ----------
    def S(self):
        tipo, val, idx = self.actual()
        if tipo == "ID":
            siguiente = self.tokens[self.pos + 1]
            if siguiente[0] == "=":
                nombre = val
                self.avanzar()  # consume ID
                self.avanzar()  # consume '='
                nodo_e = self.E()
                self.variables[nombre] = nodo_e.valor
                self.trace.append(f"S → ID = E   :  {nombre} ← {nodo_e.valor}")
                return Nodo(f"ASSIGN ({nombre})", nodo_e.valor, [nodo_e], idx)
        return self.E()


def evaluar(expresion, tabla_simbolos=None):
    """tabla_simbolos: diccionario mutable con las variables ya definidas
    (se actualiza in-place cuando la expresión es una asignación)."""
    tokens = tokenize(expresion)
    parser = Parser(tokens, expresion)
    if tabla_simbolos is not None:
        parser.variables = tabla_simbolos
    arbol = parser.S()
    if parser.actual()[0] != "EOF":
        tipo, val, idx = parser.actual()
        raise SyntaxError(f"Token sobrante: '{val}' en posición {idx}")
    return arbol, parser.trace


# ═══════════════════════════════════════════════════════════════════════════════
# 4. PALETA Y ESTILOS  (look premium)
# ═══════════════════════════════════════════════════════════════════════════════
BG          = "#eef1f6"
CARD        = "#ffffff"
NAVY        = "#1f3a5f"
ACCENT      = "#2f6fed"
TEXT_DARK   = "#1c2530"
TEXT_MUTED  = "#5b6472"
BORDER      = "#d7dce4"
SUCCESS     = "#0e8a5f"
DANGER      = "#d93025"
WARNING     = "#f9ab00"

COLOR_E   = "#1f3a5f"
COLOR_T   = "#2f6fed"
COLOR_F   = "#0e8a5f"
COLOR_U   = "#d93025"
COLOR_P   = "#f9ab00"
COLOR_NUM = "#5b3fa0"

TINT_E    = "#e8edf6"
TINT_T    = "#eaf1fe"
TINT_F    = "#e7f6ef"
TINT_U    = "#fce8e6"
TINT_P    = "#fef3e2"
TINT_NUM  = "#f3f1fb"

COLOR_ID     = "#146c94"
COLOR_ASSIGN = "#c2185b"
TINT_ID      = "#e3f2f8"
TINT_ASSIGN  = "#fce4ec"

TAG_COLORS = {
    "E": (TINT_E, COLOR_E), "T": (TINT_T, COLOR_T), "F": (TINT_F, COLOR_F),
    "U": (TINT_U, COLOR_U), "P": (TINT_P, COLOR_P), "NUM": (TINT_NUM, COLOR_NUM),
    "ID": (TINT_ID, COLOR_ID), "ASSIGN": (TINT_ASSIGN, COLOR_ASSIGN),
}


def _card(parent, **kw):
    f = tk.Frame(parent, bg=CARD, highlightbackground=BORDER,
                 highlightthickness=1, bd=0)
    f.configure(**kw)
    return f


# ═══════════════════════════════════════════════════════════════════════════════
# 5. TOOLTIP PERSONALIZADO
# ═══════════════════════════════════════════════════════════════════════════════
class Tooltip:
    def __init__(self, widget, text):
        self.widget = widget
        self.text = text
        self.tipwindow = None
        widget.bind("<Enter>", self.show)
        widget.bind("<Leave>", self.hide)

    def show(self, event=None):
        if self.tipwindow or not self.text:
            return
        x = self.widget.winfo_rootx() + 20
        y = self.widget.winfo_rooty() + self.widget.winfo_height() + 5
        self.tipwindow = tw = tk.Toplevel(self.widget)
        tw.wm_overrideredirect(True)
        tw.wm_geometry(f"+{x}+{y}")
        label = tk.Label(tw, text=self.text, justify="left",
                         background="#333", foreground="white",
                         font=("Segoe UI", 9), padx=8, pady=4)
        label.pack()

    def hide(self, event=None):
        if self.tipwindow:
            self.tipwindow.destroy()
            self.tipwindow = None


# ═══════════════════════════════════════════════════════════════════════════════
# 6. INTERFAZ GRÁFICA
# ═══════════════════════════════════════════════════════════════════════════════
class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Analizador Semántico Descendente Recursivo — Versión Mejorada")
        self.geometry("1200x780")
        self.minsize(1000, 680)
        self.configure(bg=BG)

        self.historial = []
        self.trace_actual = []
        self.simbolos = {}
        self.tests = [
            ("(3 + 4) * 2 - 5", 9),
            ("-5 + 3", -2),
            ("-(2 + 3) * 4", -20),
            ("2 ^ 3 ^ 2", 512),
            ("8 / 2 / 2", 2),
            ("3 + 4 * 2 / (1 - 5) ^ 2 ^ 3", 3.0001220703125),
            ("-(-(-1))", -1),
            ("2 ^ -2", 0.25),
            ("3.5 * 2 + 1.5", 8.5),
            ("4 * 2 ^ 2", 16),
        ]

        self._configurar_estilos()
        self._construir_encabezado()
        self._construir_entrada()
        self._construir_resultado()
        self._construir_paneles()
        self._construir_pie()

        self.on_evaluar()
        self.entry.focus_set()

    # ----- estilos ttk -----
    def _configurar_estilos(self):
        style = ttk.Style(self)
        style.theme_use("clam")

        style.configure("Treeview",
                         background=CARD, fieldbackground=CARD,
                         foreground=TEXT_DARK, rowheight=28,
                         font=("Segoe UI", 10), borderwidth=0)
        style.configure("Treeview.Heading",
                         font=("Segoe UI", 10, "bold"),
                         background=NAVY, foreground="white",
                         relief="flat", padding=6)
        style.map("Treeview.Heading", background=[("active", NAVY)])
        style.layout("Treeview", [("Treeview.treearea", {"sticky": "nswe"})])

        style.configure("Accent.TButton",
                         background=ACCENT, foreground="white",
                         font=("Segoe UI", 10, "bold"),
                         padding=(16, 8), borderwidth=0)
        style.map("Accent.TButton", background=[("active", "#2558c4")])

        style.configure("Secondary.TButton",
                         background="#e8eaed", foreground=TEXT_DARK,
                         font=("Segoe UI", 9),
                         padding=(10, 5), borderwidth=0)
        style.map("Secondary.TButton", background=[("active", "#dadce0")])

        style.configure("Success.TButton",
                         background=SUCCESS, foreground="white",
                         font=("Segoe UI", 9, "bold"),
                         padding=(10, 5), borderwidth=0)

    # ----- encabezado -----
    def _construir_encabezado(self):
        banner = tk.Frame(self, bg=NAVY, height=64)
        banner.pack(fill="x")
        banner.pack_propagate(False)

        izq = tk.Frame(banner, bg=NAVY)
        izq.pack(side="left", padx=20)
        tk.Label(izq, text="Analizador Semántico Descendente Recursivo",
                 bg=NAVY, fg="white", font=("Segoe UI", 15, "bold")
                 ).pack(anchor="w")
        tk.Label(izq, text="S → ID=E | E  ·  E → U E'  ·  U → +U | -U | T  ·  T → P T'  ·  "
                            "P → F P'  ·  P' → ^U | ε  ·  F → (E) | NUM | ID",
                 bg=NAVY, fg="#b9c8e0", font=("Segoe UI", 8)
                 ).pack(anchor="w")

    # ----- entrada -----
    def _construir_entrada(self):
        card = _card(self)
        card.pack(fill="x", padx=18, pady=(16, 8))

        inner = tk.Frame(card, bg=CARD)
        inner.pack(fill="x", padx=16, pady=14)

        tk.Label(inner, text="Expresión a evaluar", bg=CARD, fg=TEXT_MUTED,
                  font=("Segoe UI", 9, "bold")).pack(anchor="w")

        fila = tk.Frame(inner, bg=CARD)
        fila.pack(fill="x", pady=(4, 0))

        self.entry = tk.Entry(fila, font=("Consolas", 13), fg=TEXT_DARK,
                               relief="flat", highlightthickness=2,
                               highlightbackground=BORDER, highlightcolor=ACCENT)
        self.entry.pack(side="left", fill="x", expand=True, ipady=6, padx=(0, 10))
        self.entry.insert(0, "3 + 4 * 2 / (1 - 5) ^ 2 ^ 3")
        self.entry.bind("<Return>", lambda e: self.on_evaluar())
        self.entry.bind("<Control-a>", lambda e: self.entry.select_range(0, "end"))
        Tooltip(self.entry, "Escribe una expresión aritmética y presiona Enter")

        ttk.Button(fila, text="Evaluar", style="Accent.TButton",
                   command=self.on_evaluar).pack(side="left", padx=(0, 6))
        ttk.Button(fila, text="Tests", style="Secondary.TButton",
                   command=self.on_tests).pack(side="left", padx=(0, 6))
        ttk.Button(fila, text="Exportar", style="Secondary.TButton",
                   command=self.on_exportar).pack(side="left")

        # Historial
        hist_frame = tk.Frame(inner, bg=CARD)
        hist_frame.pack(fill="x", pady=(8, 0))
        tk.Label(hist_frame, text="Historial:", bg=CARD, fg=TEXT_MUTED,
                  font=("Segoe UI", 8, "bold")).pack(side="left")
        self.hist_var = tk.StringVar(value="—")
        self.hist_combo = ttk.Combobox(hist_frame, textvariable=self.hist_var,
                                        state="readonly", width=50, font=("Consolas", 9))
        self.hist_combo.pack(side="left", padx=(6, 0))
        self.hist_combo.bind("<<ComboboxSelected>>", self.on_historial_select)

        # Variables (tabla de símbolos)
        var_frame = tk.Frame(inner, bg=CARD)
        var_frame.pack(fill="x", pady=(6, 0))
        tk.Label(var_frame, text="Variables:", bg=CARD, fg=TEXT_MUTED,
                  font=("Segoe UI", 8, "bold")).pack(side="left")
        self.vars_var = tk.StringVar(value="(ninguna)")
        tk.Label(var_frame, textvariable=self.vars_var, bg=CARD, fg=COLOR_ID,
                  font=("Consolas", 9)).pack(side="left", padx=(6, 10))
        ttk.Button(var_frame, text="Limpiar variables", style="Secondary.TButton",
                   command=self.on_limpiar_variables).pack(side="left")

    # ----- resultado -----
    def _construir_resultado(self):
        card = _card(self)
        card.pack(fill="x", padx=18, pady=8)
        inner = tk.Frame(card, bg=CARD)
        inner.pack(fill="x", padx=16, pady=10)

        tk.Label(inner, text="RESULTADO", bg=CARD, fg=TEXT_MUTED,
                  font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.resultado_var = tk.StringVar(value="—")
        self.lbl_resultado = tk.Label(inner, textvariable=self.resultado_var, bg=CARD, fg=ACCENT,
                  font=("Segoe UI", 22, "bold"))
        self.lbl_resultado.pack(anchor="w")

        self.error_var = tk.StringVar(value="")
        self.lbl_error = tk.Label(inner, textvariable=self.error_var, bg=CARD, fg=DANGER,
                  font=("Segoe UI", 10), wraplength=900, justify="left")
        self.lbl_error.pack(anchor="w", pady=(4, 0))

    # ----- paneles -----
    def _construir_paneles(self):
        panel = tk.PanedWindow(self, orient="horizontal", sashwidth=8,
                                bg=BG, bd=0, sashrelief="flat")
        panel.pack(fill="both", expand=True, padx=18, pady=(8, 4))

        # --- Árbol (dibujado como diagrama real: círculos + líneas) ---
        left = _card(panel)
        self._titulo_seccion(left, "Árbol de análisis anotado")

        tree_wrap = tk.Frame(left, bg=CARD)
        tree_wrap.pack(fill="both", expand=True, padx=12, pady=(0, 12))
        tree_wrap.rowconfigure(0, weight=1)
        tree_wrap.columnconfigure(0, weight=1)

        self.canvas = tk.Canvas(tree_wrap, bg=CARD, highlightthickness=0)
        vsb = ttk.Scrollbar(tree_wrap, orient="vertical", command=self.canvas.yview)
        hsb = ttk.Scrollbar(tree_wrap, orient="horizontal", command=self.canvas.xview)
        self.canvas.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)

        self.canvas.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")

        panel.add(left, stretch="always")

        # --- Bitácora ---
        right = _card(panel)
        self._titulo_seccion(right, "Bitácora de acciones semánticas")

        log_wrap = tk.Frame(right, bg=CARD)
        log_wrap.pack(fill="both", expand=True, padx=12, pady=(0, 12))

        self.log = tk.Text(log_wrap, font=("Consolas", 10), bg=CARD, fg=TEXT_DARK,
                            relief="flat", wrap="word", padx=6, pady=4)
        self.log.pack(side="left", fill="both", expand=True)
        vsb2 = ttk.Scrollbar(log_wrap, orient="vertical", command=self.log.yview)
        self.log.configure(yscrollcommand=vsb2.set)
        vsb2.pack(side="left", fill="y")

        self.log.tag_configure("num", foreground=TEXT_MUTED, font=("Consolas", 10, "bold"))
        self.log.tag_configure("E", foreground=COLOR_E, font=("Consolas", 10, "bold"))
        self.log.tag_configure("T", foreground=COLOR_T, font=("Consolas", 10, "bold"))
        self.log.tag_configure("F", foreground=COLOR_F, font=("Consolas", 10, "bold"))
        self.log.tag_configure("U", foreground=COLOR_U, font=("Consolas", 10, "bold"))
        self.log.tag_configure("P", foreground=COLOR_P, font=("Consolas", 10, "bold"))
        self.log.tag_configure("S", foreground=COLOR_ASSIGN, font=("Consolas", 10, "bold"))
        self.log.config(state="disabled")

        panel.add(right, stretch="always")

    def _titulo_seccion(self, parent, texto):
        head = tk.Frame(parent, bg=CARD)
        head.pack(fill="x", padx=12, pady=(12, 6))
        tk.Label(head, text=texto, bg=CARD, fg=TEXT_DARK,
                  font=("Segoe UI", 11, "bold")).pack(anchor="w")
        tk.Frame(head, bg=ACCENT, height=2).pack(fill="x", pady=(4, 0))

    # ----- pie -----
    def _construir_pie(self):
        pie = tk.Frame(self, bg=BG)
        pie.pack(fill="x", padx=20, pady=(0, 12))
        tk.Label(pie, text="Atajos: Enter = Evaluar  ·  Ctrl+A = Seleccionar todo  ·  "
                            "Tests = Ejecutar suite de pruebas  ·  Exportar = Guardar resultados",
                  bg=BG, fg=TEXT_MUTED, font=("Segoe UI", 8, "italic")).pack(anchor="w")

    # ----- lógica -----
    def _tag_de(self, etiqueta):
        primero = etiqueta.split()[0]
        return primero if primero in ("E", "T", "F", "U", "P", "ID", "ASSIGN") else "NUM"

    def _fmt_valor(self, valor):
        if isinstance(valor, float):
            if valor.is_integer():
                return str(int(valor))
            return f"{valor:.4g}"
        return str(valor)

    def _simbolo_corto(self, nodo):
        """Texto breve que va DENTRO del círculo del nodo."""
        et = nodo.etiqueta
        if et == "NUM":
            return self._fmt_valor(nodo.valor)
        dentro = et.split("(", 1)[1].rsplit(")", 1)[0].strip() if "(" in et else ""
        if et.startswith("ID"):
            return dentro
        if et.startswith("ASSIGN"):
            return f"{dentro} ="
        if et.startswith("F"):
            return "( )"
        return dentro if dentro else et

    def _layout(self, nodo, profundidad, contador, posiciones):
        """Asigna coordenadas (columna, profundidad) recorriendo el árbol
        en un orden tipo in-order, para que quede bien distribuido de
        izquierda a derecha, como un árbol binario dibujado a mano."""
        hijos = nodo.hijos
        if len(hijos) >= 1:
            self._layout(hijos[0], profundidad + 1, contador, posiciones)
        columna = contador[0]
        contador[0] += 1
        posiciones[id(nodo)] = (columna, profundidad, nodo)
        if len(hijos) >= 2:
            self._layout(hijos[1], profundidad + 1, contador, posiciones)

    def _dibujar_arbol(self, arbol):
        self.canvas.delete("all")
        posiciones = {}
        contador = [0]
        self._layout(arbol, 0, contador, posiciones)
        if not posiciones:
            return

        ESPACIO_X, ESPACIO_Y, MARGEN, R = 62, 76, 40, 24
        max_prof = max(p[1] for p in posiciones.values())

        def pixel(item):
            columna, profundidad, _ = item
            return MARGEN + columna * ESPACIO_X, MARGEN + profundidad * ESPACIO_Y

        def dibujar_lineas(nodo):
            x1, y1 = pixel(posiciones[id(nodo)])
            for hijo in nodo.hijos:
                x2, y2 = pixel(posiciones[id(hijo)])
                self.canvas.create_line(x1, y1, x2, y2, fill="#9aa5b5", width=1.6)
                dibujar_lineas(hijo)

        dibujar_lineas(arbol)

        for columna, profundidad, nodo in posiciones.values():
            cx, cy = MARGEN + columna * ESPACIO_X, MARGEN + profundidad * ESPACIO_Y
            tinte, color = TAG_COLORS.get(self._tag_de(nodo.etiqueta), (TINT_NUM, COLOR_NUM))
            self.canvas.create_oval(cx - R, cy - R, cx + R, cy + R,
                                     fill=tinte, outline=color, width=2)
            self.canvas.create_text(cx, cy - 6, text=self._simbolo_corto(nodo),
                                     font=("Segoe UI", 10, "bold"), fill=color)
            self.canvas.create_text(cx, cy + 9, text=self._fmt_valor(nodo.valor),
                                     font=("Consolas", 8), fill=color)

        ancho = MARGEN * 2 + contador[0] * ESPACIO_X
        alto = MARGEN * 2 + (max_prof + 1) * ESPACIO_Y
        self.canvas.configure(scrollregion=(0, 0, ancho, alto))

    def _actualizar_variables(self):
        if self.simbolos:
            texto = "   ".join(f"{k}={self._fmt_valor(v)}" for k, v in sorted(self.simbolos.items()))
        else:
            texto = "(ninguna)"
        self.vars_var.set(texto)

    def on_limpiar_variables(self):
        self.simbolos.clear()
        self._actualizar_variables()

    def on_evaluar(self):
        expr = self.entry.get().strip()
        self.canvas.delete("all")
        self.log.config(state="normal")
        self.log.delete("1.0", "end")
        self.error_var.set("")
        self.entry.config(highlightcolor=ACCENT, highlightbackground=BORDER)
        self.trace_actual = []

        if not expr:
            self.resultado_var.set("—")
            self.log.config(state="disabled")
            return

        try:
            arbol, trace = evaluar(expr, self.simbolos)
            self.trace_actual = trace
            self.resultado_var.set(f"{arbol.valor}")
            self.lbl_resultado.config(fg=ACCENT)
            self._dibujar_arbol(arbol)
            for i, paso in enumerate(trace, 1):
                simbolo = paso[0] if paso[0] in ("E", "T", "F", "U", "P", "S") else "num"
                self.log.insert("end", f"{i:>2}.  ", ("num",))
                self.log.insert("end", f"{paso}\n", (simbolo,))

            self._actualizar_variables()

            if expr not in self.historial:
                self.historial.insert(0, expr)
                self.historial = self.historial[:20]
                self.hist_combo["values"] = self.historial

        except Exception as e:
            self.resultado_var.set("Error")
            self.lbl_resultado.config(fg=DANGER)
            self.error_var.set(str(e))
            self.entry.config(highlightcolor=DANGER, highlightbackground=DANGER)
            self.log.insert("end", f"❌  ERROR:\n{str(e)}\n", ("num",))
        finally:
            self.log.config(state="disabled")

    def on_historial_select(self, event=None):
        val = self.hist_var.get()
        if val and val != "—":
            self.entry.delete(0, "end")
            self.entry.insert(0, val)
            self.on_evaluar()

    def on_tests(self):
        """Ejecuta la suite de pruebas automáticas."""
        ventana = tk.Toplevel(self)
        ventana.title("Suite de Pruebas Automáticas")
        ventana.geometry("700x500")
        ventana.configure(bg=BG)
        ventana.transient(self)
        ventana.grab_set()

        tk.Label(ventana, text="Resultados de Pruebas", bg=BG, fg=NAVY,
                 font=("Segoe UI", 14, "bold")).pack(pady=(16, 8))

        frame = tk.Frame(ventana, bg=CARD, highlightbackground=BORDER, highlightthickness=1)
        frame.pack(fill="both", expand=True, padx=20, pady=8)

        txt = tk.Text(frame, font=("Consolas", 10), bg=CARD, fg=TEXT_DARK,
                      relief="flat", padx=10, pady=10)
        txt.pack(fill="both", expand=True)
        txt.tag_configure("ok", foreground=SUCCESS, font=("Consolas", 10, "bold"))
        txt.tag_configure("fail", foreground=DANGER, font=("Consolas", 10, "bold"))
        txt.tag_configure("expr", foreground=ACCENT)

        passed = 0
        failed = 0

        for expr, esperado in self.tests:
            try:
                arbol, _ = evaluar(expr)
                obtenido = arbol.valor
                ok = abs(obtenido - esperado) < 1e-10
                if ok:
                    passed += 1
                    txt.insert("end", "✓  ", "ok")
                    txt.insert("end", f"{expr}  =  {obtenido}  (esperado: {esperado})\n")
                else:
                    failed += 1
                    txt.insert("end", "✗  ", "fail")
                    txt.insert("end", f"{expr}  =  {obtenido}  (esperado: {esperado})\n")
            except Exception as e:
                failed += 1
                txt.insert("end", "✗  ", "fail")
                txt.insert("end", f"{expr}  →  ERROR: {e}\n")

        txt.insert("end", f"\n{'='*50}\n")
        txt.insert("end", f"Total: {passed + failed}  ·  ")
        txt.insert("end", f"Pasadas: {passed}  ·  ", "ok")
        txt.insert("end", f"Fallidas: {failed}\n", "fail" if failed > 0 else "ok")
        txt.config(state="disabled")

        ttk.Button(ventana, text="Cerrar", style="Accent.TButton",
                   command=ventana.destroy).pack(pady=12)

    def on_exportar(self):
        """Exporta el árbol y la bitácora a un archivo de texto."""
        expr = self.entry.get().strip()
        resultado = self.resultado_var.get()
        if resultado in ("—", "Error"):
            messagebox.showwarning("Exportar", "No hay resultados válidos para exportar.")
            return

        archivo = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Archivo de texto", "*.txt"), ("Todos los archivos", "*.*")],
            initialfile=f"analisis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        )
        if not archivo:
            return

        try:
            with open(archivo, "w", encoding="utf-8") as f:
                f.write("=" * 60 + "\n")
                f.write("  ANÁLISIS SEMÁNTICO - REPORTE DE EVALUACIÓN\n")
                f.write("=" * 60 + "\n\n")
                f.write(f"Expresión:  {expr}\n")
                f.write(f"Resultado:  {resultado}\n")
                f.write(f"Fecha:      {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write("-" * 60 + "\n")
                f.write("BITÁCORA DE ACCIONES SEMÁNTICAS\n")
                f.write("-" * 60 + "\n\n")
                for i, paso in enumerate(self.trace_actual, 1):
                    f.write(f"{i:>2}.  {paso}\n")
            messagebox.showinfo("Exportar", f"Reporte guardado exitosamente.\n\n{archivo}")
        except Exception as e:
            messagebox.showerror("Exportar", f"No se pudo guardar el archivo:\n{e}")


if __name__ == "__main__":
    App().mainloop()