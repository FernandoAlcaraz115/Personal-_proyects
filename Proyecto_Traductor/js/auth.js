const API_URL = 'http://localhost:3000';

// LOGIN
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role); // <--- GUARDAMOS EL ROL
                alert('¡Bienvenido! ' + data.username);
                window.location.href = 'Traductor.html';
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
}

// REGISTRO
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                alert('¡Usuario creado exitosamente! Por favor inicia sesión.');
                window.location.href = 'login.html';
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
}