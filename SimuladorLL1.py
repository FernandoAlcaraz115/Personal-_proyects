import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox

# ======================================================
# Gramática
# ======================================================
# S → aA | bS
# A → aA | ε

producciones = {
    "S": ["aA", "bS"],
    "A": ["aA", "ε"]
}

FIRST = {
    "S": {"a", "b"},
    "A": {"a", "ε"}
}

FOLLOW = {
    "S": {"$"},
    "A": {"b", "$"}
}

tabla_ll1 = {
    ("S", "a"): "S → aA",
    ("S", "b"): "S → bS",
    ("A", "a"): "A → aA",
    ("A", "b"): "A → ε",
    ("A", "$"): "A → ε"
}

# Derivar terminales y no-terminales desde los datos reales
terminales    = sorted({t for (_, t) in tabla_ll1 if t != "$"}) + ["$"]
no_terminales = list(producciones.keys())

# ======================================================
# Paleta de colores
# ======================================================
BG       = "#0f172a"
BG_CARD  = "#1e293b"
BG_INPUT = "#334155"
FG       = "#f1f5f9"
FG_DIM   = "#94a3b8"
BLUE     = "#3b82f6"
GREEN    = "#10b981"
PURPLE   = "#8b5cf6"
RED      = "#ef4444"
AMBER    = "#f59e0b"

# ======================================================
# Utilidades de log
# ======================================================

def log(text, color=None):
    salida.configure(state="normal")
    if color:
        tag = f"tag_{color.replace('#', '')}"
        salida.tag_configure(tag, foreground=color)
        salida.insert(tk.END, text, tag)
    else:
        salida.insert(tk.END, text)
    salida.see(tk.END)
    salida.configure(state="disabled")

def clear_log():
    salida.configure(state="normal")
    salida.delete("1.0", tk.END)
    salida.configure(state="disabled")

# ======================================================
# Funciones — lógica real desde los datos
# ======================================================

def mostrar_first():
    clear_log()
    log("── CONJUNTOS FIRST ──\n\n", AMBER)
    for nt, conjunto in FIRST.items():
        log(f"  FIRST(", FG_DIM)
        log(nt, BLUE)
        log(") = { ", FG_DIM)
        log(", ".join(sorted(conjunto)), GREEN)
        log(" }\n")

def mostrar_follow():
    clear_log()
    log("── CONJUNTOS FOLLOW ──\n\n", AMBER)
    for nt, conjunto in FOLLOW.items():
        log(f"  FOLLOW(", FG_DIM)
        log(nt, BLUE)
        log(") = { ", FG_DIM)
        log(", ".join(sorted(conjunto)), GREEN)
        log(" }\n")

def construir_tabla():
    # Limpiar filas anteriores
    for item in tree_tabla.get_children():
        tree_tabla.delete(item)

    # Llenar desde tabla_ll1
    for nt in no_terminales:
        fila = [nt]
        tiene_error = False
        for t in terminales:
            celda = tabla_ll1.get((nt, t), "error")
            if celda == "error":
                tiene_error = True
            fila.append(celda)
        tag = "error_row" if tiene_error else "ok_row"
        tree_tabla.insert("", tk.END, values=fila, tags=(tag,))

    clear_log()
    log("── TABLA LL(1) CONSTRUIDA ──\n\n", AMBER)
    log(f"  {len(tabla_ll1)} entrada(s) cargadas desde tabla_ll1.\n\n", GREEN)
    log("  • FIRST llena producciones normales.\n", FG_DIM)
    log("  • FOLLOW llena producciones con ε.\n",   FG_DIM)

def verificar_ll1():
    clear_log()
    log("── VERIFICACIÓN LL(1) ──\n\n", AMBER)
    conflictos = []

    # Verificar celdas duplicadas
    visto = {}
    for (nt, t), prod in tabla_ll1.items():
        if (nt, t) in visto:
            conflictos.append(
                f"  Conflicto en tabla[{nt}, {t}]: "
                f"{visto[(nt,t)]}  vs  {prod}"
            )
        else:
            visto[(nt, t)] = prod

    # Verificar FIRST ∩ FOLLOW para no-terminales con ε
    for nt, prods in producciones.items():
        if "ε" in prods:
            primeros = FIRST[nt] - {"ε"}
            interseccion = primeros & FOLLOW[nt]
            if interseccion:
                conflictos.append(
                    f"  Conflicto en {nt}: "
                    f"FIRST ∩ FOLLOW = {interseccion}"
                )

    if conflictos:
        log("❌ La gramática NO es LL(1):\n\n", RED)
        for c in conflictos:
            log(c + "\n", RED)
    else:
        log("  ✔ Sin conflictos en la tabla.\n",                      GREEN)
        log("  ✔ Cada celda contiene una sola producción.\n",          GREEN)
        log("  ✔ FIRST ∩ FOLLOW = ∅ en producciones con ε.\n\n",      GREEN)
        log("  ✅ La gramática ES LL(1).\n", GREEN)

def simular_parser():
    cadena = entrada_cadena.get().strip()
    if not cadena:
        messagebox.showwarning("Advertencia", "Ingresa una cadena")
        return

    cadena += "$"
    pila   = ["$", "S"]
    indice = 0

    clear_log()
    log("── SIMULACIÓN DEL PARSER ──\n\n", AMBER)

    while pila:
        tope          = pila[-1]
        simbolo_actual = cadena[indice] if indice < len(cadena) else "$"

        log("  Pila:    ", FG_DIM)
        log(f"{''.join(pila)}\n", BLUE)
        log("  Entrada: ", FG_DIM)
        log(f"{cadena[indice:]}\n", FG)

        if tope == simbolo_actual:
            log(f"  ✔ Coincide terminal: {simbolo_actual}\n\n", GREEN)
            pila.pop()
            indice += 1

        elif tope in producciones:
            produccion = tabla_ll1.get((tope, simbolo_actual))
            if produccion is None:
                log(
                    f"\n  ❌ ERROR SINTÁCTICO — "
                    f"no hay entrada en tabla[{tope}, {simbolo_actual}]\n",
                    RED
                )
                return
            rhs = produccion.split("→")[1].strip()
            log("  Usando: ", FG_DIM)
            log(f"{produccion}\n\n", PURPLE)
            pila.pop()
            if rhs != "ε":
                for sym in reversed(rhs):
                    pila.append(sym)

        else:
            log(f"\n  ❌ ERROR — símbolo inesperado en pila: {tope}\n", RED)
            return

        if pila == ["$"] and cadena[indice] == "$":
            log("  Pila:    ", FG_DIM)
            log("$\n", BLUE)
            log("  Entrada: ", FG_DIM)
            log("$\n\n", FG)
            log("  ✅ CADENA ACEPTADA\n", GREEN)
            return

    log("\n  ❌ CADENA RECHAZADA\n", RED)

# ======================================================
# GUI
# ======================================================

root = tk.Tk()
root.title("Simulador LL(1)")
root.geometry("1100x760")
root.configure(bg=BG)
root.resizable(False, False)

# ── Estilos ttk ───────────────────────────────────────

style = ttk.Style()
style.theme_use("default")

style.configure("Treeview",
    background=BG_CARD,
    foreground=FG,
    fieldbackground=BG_CARD,
    rowheight=32,
    font=("Consolas", 11),
    borderwidth=0,
    relief="flat"
)
style.configure("Treeview.Heading",
    background=BG_INPUT,
    foreground=AMBER,
    font=("Arial", 11, "bold"),
    relief="flat",
    padding=8
)
style.map("Treeview",
    background=[("selected", BLUE)],
    foreground=[("selected", "white")]
)
style.layout("Treeview", [
    ("Treeview.treearea", {"sticky": "nswe"})
])

# ── Helper: botón moderno ─────────────────────────────

def make_btn(parent, text, cmd, color, side="left"):
    btn = tk.Button(
        parent, text=text, command=cmd,
        bg=color, fg="white",
        font=("Arial", 11, "bold"),
        relief="flat", bd=0,
        padx=20, pady=9,
        cursor="hand2",
        activebackground=color,
        activeforeground="white"
    )
    btn.pack(side=side, padx=6)

    def on_enter(e):  btn.configure(bg=_darken(color))
    def on_leave(e):  btn.configure(bg=color)
    btn.bind("<Enter>", on_enter)
    btn.bind("<Leave>", on_leave)
    return btn

def _darken(hex_color):
    r, g, b = int(hex_color[1:3],16), int(hex_color[3:5],16), int(hex_color[5:7],16)
    factor = 0.80
    return f"#{int(r*factor):02x}{int(g*factor):02x}{int(b*factor):02x}"

# ── Título ────────────────────────────────────────────

frame_title = tk.Frame(root, bg=BG)
frame_title.pack(fill="x", padx=30, pady=(22, 4))

tk.Label(
    frame_title,
    text="Simulador de Parser Predictivo",
    font=("Arial", 22, "bold"),
    bg=BG, fg=FG
).pack(side="left")

tk.Label(
    frame_title,
    text="  LL(1)",
    font=("Arial", 22, "bold"),
    bg=BG, fg=BLUE
).pack(side="left")

# ── Gramática (badge) ─────────────────────────────────

frame_grammar = tk.Frame(root, bg=BG_CARD)
frame_grammar.pack(fill="x", padx=30, pady=(4, 12))

gramatica_txt = "   Gramática:   " + "     |     ".join(
    f"{nt} → {' | '.join(prods)}"
    for nt, prods in producciones.items()
)

tk.Label(
    frame_grammar,
    text=gramatica_txt,
    font=("Consolas", 11),
    bg=BG_CARD, fg=FG_DIM,
    pady=10, anchor="w"
).pack(fill="x", padx=10)

# ── Botones principales ───────────────────────────────

frame_btns = tk.Frame(root, bg=BG)
frame_btns.pack(fill="x", padx=30, pady=(0, 12))

make_btn(frame_btns, "Mostrar FIRST",   mostrar_first,   BLUE)
make_btn(frame_btns, "Mostrar FOLLOW",  mostrar_follow,  BLUE)
make_btn(frame_btns, "Construir Tabla", construir_tabla, GREEN)
make_btn(frame_btns, "Verificar LL(1)", verificar_ll1,   PURPLE)

# ── Tabla LL(1) ───────────────────────────────────────

frame_tabla = tk.Frame(root, bg=BG_CARD)
frame_tabla.pack(fill="x", padx=30, pady=(0, 12))

columnas_tree = ["No Terminal"] + terminales

tree_tabla = ttk.Treeview(
    frame_tabla,
    columns=columnas_tree,
    show="headings",
    height=len(no_terminales) + 1
)

for col in columnas_tree:
    ancho = 160 if col == "No Terminal" else 210
    tree_tabla.heading(col, text=col)
    tree_tabla.column(col, width=ancho, anchor="center")

tree_tabla.tag_configure("ok_row",    background=BG_CARD,  foreground=FG)
tree_tabla.tag_configure("error_row", background="#2d1a1a", foreground="#fca5a5")

tree_tabla.pack(fill="x", padx=12, pady=10)

# ── Separador ─────────────────────────────────────────

tk.Frame(root, bg=BG_INPUT, height=1).pack(fill="x", padx=30, pady=4)

# ── Input del parser ──────────────────────────────────

frame_parser = tk.Frame(root, bg=BG)
frame_parser.pack(fill="x", padx=30, pady=10)

tk.Label(
    frame_parser,
    text="Cadena de entrada:",
    font=("Arial", 12, "bold"),
    bg=BG, fg=FG_DIM
).pack(side="left", padx=(0, 10))

entrada_cadena = tk.Entry(
    frame_parser,
    width=26,
    font=("Consolas", 13),
    bg=BG_INPUT, fg=FG,
    insertbackground=FG,
    relief="flat", bd=0
)
entrada_cadena.pack(side="left", ipady=7, padx=(0, 10))
entrada_cadena.bind("<Return>", lambda e: simular_parser())

make_btn(frame_parser, "▶  Simular Parser", simular_parser, RED)

# ── Área de salida ────────────────────────────────────

salida = scrolledtext.ScrolledText(
    root,
    width=120, height=13,
    font=("Consolas", 11),
    bg=BG_CARD, fg=FG,
    insertbackground=FG,
    relief="flat", bd=0,
    state="disabled",
    padx=16, pady=12
)
salida.pack(fill="both", padx=30, pady=(0, 20))

# ── Arranque ──────────────────────────────────────────

root.mainloop()
