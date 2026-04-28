import turtle
import math
import random
import time

# Configuración de la pantalla
screen = turtle.Screen()
screen.bgcolor("black")
screen.setup(800, 800)
screen.title("Árbol de Navidad Animado")
screen.tracer(0)  # Desactivar animación automática para control manual

# Crear turtle para el árbol
tree = turtle.Turtle()
tree.speed(0)
tree.hideturtle()

# Colores
COLORS = ["red", "blue", "yellow", "purple", "cyan", "orange", "white", "pink"]

def draw_tree_layer(height, width, y_position, layer_num):
    """Dibuja una capa del árbol"""
    tree.penup()
    tree.goto(0, y_position)
    tree.pendown()
    
    # Color verde que se hace más brillante hacia arriba
    green_intensity = min(1.0, 0.3 + (layer_num * 0.7 / 10))
    tree.fillcolor(0, green_intensity, 0)
    
    tree.begin_fill()
    tree.goto(-width/2, y_position - height)
    tree.goto(width/2, y_position - height)
    tree.goto(0, y_position)
    tree.end_fill()

def draw_lights(y_position, width, layer_num):
    """Dibuja luces en una capa"""
    num_lights = int(width / 30)
    for i in range(num_lights):
        x = -width/2 + (i + 0.5) * (width / num_lights)
        
        # Efecto de parpadeo aleatorio
        if random.random() > 0.3:
            tree.penup()
            tree.goto(x, y_position - 15)
            tree.pendown()
            
            color = random.choice(COLORS)
            tree.dot(8, color)

def draw_trunk():
    """Dibuja el tronco del árbol"""
    tree.penup()
    tree.goto(-20, -150)
    tree.pendown()
    tree.fillcolor("brown")
    tree.begin_fill()
    for _ in range(2):
        tree.forward(40)
        tree.right(90)
        tree.forward(60)
        tree.right(90)
    tree.end_fill()

def animate_tree():
    """Animación de construcción del árbol"""
    tree.clear()
    
    # Dibujar capas desde abajo hacia arriba
    for layer in range(10):
        height = 30
        width = (layer + 1) * 25
        y_position = -120 + layer * 25
        
        draw_tree_layer(height, width, y_position, layer)
        draw_lights(y_position, width, layer)
        
        screen.update()
        time.sleep(0.3)  # Pausa entre capas
    
    draw_trunk()
    screen.update()
    return True

def rotate_tree():
    """Hace girar el árbol continuamente"""
    angle = 0
    while True:
        tree.clear()
        
        # Guardar y restaurar el estado para rotación
        current_heading = tree.heading()
        tree.setheading(angle)
        
        # Volver a dibujar el árbol completo
        for layer in range(10):
            height = 30
            width = (layer + 1) * 25
            y_position = -120 + layer * 25
            
            draw_tree_layer(height, width, y_position, layer)
            draw_lights(y_position, width, layer)
        
        draw_trunk()
        
        screen.update()
        angle = (angle + 2) % 360
        time.sleep(0.05)

# Ejecutar animación
try:
    # Fase 1: Construcción del árbol
    if animate_tree():
        # Fase 2: Rotación continua
        rotate_tree()
except:
    print("Animación terminada")
    screen.bye()