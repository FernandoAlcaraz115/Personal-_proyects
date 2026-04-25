# 🌐 CodeTranslate AI

Plataforma web inteligente para la traducción y explicación de código fuente entre múltiples lenguajes de programación, potenciada por **Groq AI** y modelos **Llama 3**.

![Estado](https://img.shields.io/badge/Estado-Terminado-success)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)

## ✨ Características Principales

* **🤖 Traducción con IA:** Conversión precisa de código entre lenguajes (Python, Java, C++, JS, etc.).
* **🧠 Selección de Modelos:** El usuario puede elegir entre Llama 3.1, Llama 3.3 y Mixtral.
* **📝 Explicaciones Inteligentes:** Opción para generar el código con o sin comentarios explicativos.
* **🔐 Autenticación Segura:** Sistema de Registro y Login con encriptación (Bcrypt) y Tokens (JWT).
* **💾 Historial Persistente:** Guardado automático de traducciones en base de datos PostgreSQL.
* **🛡️ Panel de Administrador:** Dashboard exclusivo para gestionar usuarios y visualizar la actividad global.
* **⚡ Interfaz Reactiva:** Diseño moderno, oscuro y responsivo con carga dinámica de datos.

## 🛠️ Tecnologías Utilizadas

**Backend:**
* Node.js & Express
* PostgreSQL (Base de datos relacional)
* JWT (JSON Web Tokens) & Bcryptjs
* Axios (Conexión con API de IA)

**Frontend:**
* HTML5, CSS3, JavaScript (Vanilla)
* Fetch API

**Inteligencia Artificial:**
* Groq Cloud API (Llama 3.1 8B, Llama 3.3 70B)

## ⚙️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/codetranslate-ai.git](https://github.com/tu-usuario/codetranslate-ai.git)
    cd codetranslate-ai
    ```

2.  **Instalar dependencias del servidor:**
    ```bash
    cd backend
    npm install
    ```

3.  **Configurar Base de Datos (PostgreSQL):**
    * Crear base de datos: `codetranslate_db`
    * Ejecutar el script SQL para crear tablas (`users`, `translations`).

4.  **Variables de Entorno:**
    Crea un archivo `.env` en la carpeta `backend` con lo siguiente:
    ```env
    GROQ_API_KEY=tu_api_key_de_groq
    JWT_SECRET=tu_secreto_seguro
    DB_USER=postgres
    DB_PASSWORD=tu_contraseña
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=codetranslate_db
    ```

5.  **Iniciar el servidor:**
    ```bash
    npm run dev
    ```

6.  **Usar la aplicación:**
    Abre `Traductor.html` en tu navegador o usa Live Server.

## 🛡️ Acceso Administrativo

El sistema cuenta con roles de usuario (`user` y `admin`).
Para acceder al panel de control, inicia sesión con una cuenta que tenga el rol `admin` en la base de datos.

---
Desarrollado por **Fernando Alcaraz** - Proyecto Final de Programación Web 2025.