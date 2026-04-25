// Configuración
const API_URL = 'http://localhost:3000';

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 CodeTranslate AI - Inicializando...');

    // 1. Verificar sesión y rol (Admin/User)
    checkLoginStatus();

    // 2. Configurar funcionalidades base
    preventFormDefaults();
    setupTranslateButton();
    setupOtherButtons();
    initializeLanguageIcons();

    // 3. Configurar historial
    setupHistoryFeature();

    // 4. Configurar Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    console.log('✅ Inicialización completada');
});

// ===== GESTIÓN DE USUARIO Y ROL =====
function checkLoginStatus() {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Leemos el rol guardado

    const userDisplay = document.getElementById('user-display');
    const historyBtn = document.getElementById('history-btn');

    if (token && username) {
        // Usuario Logueado
        console.log(`👤 Usuario: ${username} | Rol: ${role}`);

        // Crear enlace de Admin (Solo si es admin)
        const adminLink = role === 'admin'
            ? ` | <a href="admin.html" style="color: #f59e0b; font-weight:bold; text-decoration:none;">🛡️ Admin</a>`
            : '';

        if (userDisplay) {
            userDisplay.innerHTML = `Hola, <b>${username}</b>${adminLink} | <a href="#" id="logout-link" style="color: var(--secondary)">Salir</a>`;

            // Asignar evento al nuevo link de salir
            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) logoutLink.addEventListener('click', handleLogout);
        }

        // Mostrar botón de historial
        if (historyBtn) historyBtn.style.display = 'inline-block';

    } else {
        // Usuario Anónimo
        console.log('👤 Usuario anónimo');
        if (userDisplay) {
            userDisplay.innerHTML = `<a href="login.html" style="color: var(--primary)">Iniciar Sesión</a>`;
        }
        // Ocultar botón de historial
        if (historyBtn) historyBtn.style.display = 'none';
    }
}

function handleLogout(e) {
    if (e) e.preventDefault();
    if (confirm('¿Cerrar sesión?')) {
        // Borrar todo del navegador
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = 'Traductor.html'; // Recargar página limpia
    }
}

// ===== FUNCIONALIDAD DE HISTORIAL =====
function setupHistoryFeature() {
    const historyBtn = document.getElementById('history-btn');
    const modal = document.getElementById('history-modal');
    const closeModal = document.getElementById('close-history');

    // Abrir modal
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.add('active');
                loadHistoryData(); // Cargar datos al abrir
            }
        });
    }

    // Cerrar modal con botón X
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }

    // Cerrar al hacer clic fuera del modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

async function loadHistoryData() {
    const listContainer = document.getElementById('history-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p style="text-align:center; color:#94a3b8">Cargando historial...</p>';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            listContainer.innerHTML = '<p style="text-align:center; color:#ef4444">Sesión expirada.</p>';
            return;
        }

        const res = await fetch(`${API_URL}/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success && data.history.length > 0) {
            listContainer.innerHTML = ''; // Limpiar mensaje de carga

            data.history.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';

                const date = new Date(item.created_at).toLocaleDateString();
                const preview = item.source_code.substring(0, 60) + '...';

                div.innerHTML = `
                    <div class="history-meta">
                        <span>📅 ${date}</span>
                        <div>
                            <span class="history-lang-badge">${item.source_lang}</span> 
                            ➜ 
                            <span class="history-lang-badge" style="background:var(--secondary)">${item.target_lang}</span>
                        </div>
                    </div>
                    <div class="history-preview">${preview}</div>
                    <div style="margin-top:5px; font-size:0.8rem; color:#64748b; text-align:right;">
                        ⬇️ Clic para cargar en editor
                    </div>
                `;

                // Al hacer clic, cargar en el editor
                div.addEventListener('click', () => {
                    loadTranslationIntoEditor(item);
                });

                listContainer.appendChild(div);
            });
        } else {
            listContainer.innerHTML = '<p style="text-align:center; color:#94a3b8">No tienes traducciones guardadas aún.</p>';
        }

    } catch (error) {
        console.error(error);
        listContainer.innerHTML = '<p style="text-align:center; color:#ef4444">Error al cargar historial.</p>';
    }
}

function loadTranslationIntoEditor(item) {
    // Restaurar valores en los inputs
    document.getElementById('source-code').value = item.source_code;
    document.getElementById('target-code').value = item.translated_code;
    document.getElementById('source-language').value = item.source_lang;
    document.getElementById('target-language').value = item.target_lang;

    // Cerrar modal
    document.getElementById('history-modal').classList.remove('active');

    // Actualizar iconos de banderas
    initializeLanguageIcons();

    showNotification('✅ Traducción cargada correctamente');
}

// ===== MANEJADOR DE TRADUCCIÓN =====
async function handleTranslation() {
    console.log('🔄 INICIANDO TRADUCCIÓN...');

    const sourceCode = document.getElementById('source-code').value;
    const sourceLang = document.getElementById('source-language').value;
    const targetLang = document.getElementById('target-language').value;

    // Opciones avanzadas
    const includeComments = document.getElementById('comments-toggle').checked;
    const selectedModel = document.getElementById('ai-model').value;

    // Validaciones
    if (!sourceCode.trim()) {
        showNotification('❌ Por favor, ingresa código para traducir', 'error');
        return;
    }
    if (sourceLang === targetLang) {
        showNotification('❌ Los lenguajes deben ser diferentes', 'error');
        return;
    }

    // UI Loading
    const translateBtn = document.getElementById('translate-btn');
    const originalText = translateBtn.innerHTML;
    translateBtn.innerHTML = '⏳ Traduciendo...';
    translateBtn.disabled = true;

    try {
        // Preparar token de autorización
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('📡 Enviando petición a API...');

        const response = await fetch(`${API_URL}/translate`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                sourceCode,
                sourceLang,
                targetLang,
                includeComments,
                model: selectedModel
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token expirado o inválido
                handleLogout();
                throw new Error('Sesión expirada. Inicia sesión de nuevo.');
            }
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        if (data.success) {
            // Mostrar resultado
            document.getElementById('target-code').value = data.translatedCode;

            // Mostrar reporte si existe
            if (data.report && data.report.trim()) {
                showTranslationReport(data.report);
            } else {
                document.getElementById('changes-panel').classList.remove('show');
            }

            showNotification('✅ Traducción exitosa', 'success');
        }

    } catch (error) {
        console.error('💥 Error:', error);
        showNotification('❌ ' + error.message, 'error');
        document.getElementById('target-code').value = `// Error: ${error.message}`;
    } finally {
        // Restaurar botón
        translateBtn.innerHTML = originalText;
        translateBtn.disabled = false;
    }
}

// ===== UTILIDADES DE UI =====

function preventFormDefaults() {
    const allForms = document.querySelectorAll('form');
    allForms.forEach(form => {
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            return false; // Bloquear recarga
        });
    });
}

function setupTranslateButton() {
    const translateBtn = document.getElementById('translate-btn');
    if (translateBtn) {
        // Clonar para eliminar eventos viejos
        const newBtn = translateBtn.cloneNode(true);
        translateBtn.parentNode.replaceChild(newBtn, translateBtn);
        newBtn.id = 'translate-btn';
        newBtn.addEventListener('click', handleTranslation);
    }
}

function initializeLanguageIcons() {
    const sourceLanguage = document.getElementById('source-language');
    const targetLanguage = document.getElementById('target-language');
    const sourceIcon = document.getElementById('source-icon');
    const targetIcon = document.getElementById('target-icon');

    const languageIcons = {
        'python': '🐍', 'java': '☕', 'javascript': '📜',
        'cpp': '⚡', 'csharp': '🔷', 'php': '🐘', 'ruby': '💎'
    };

    function updateIcons() {
        if (sourceLanguage && sourceIcon) sourceIcon.textContent = languageIcons[sourceLanguage.value] || '❓';
        if (targetLanguage && targetIcon) targetIcon.textContent = languageIcons[targetLanguage.value] || '❓';
    }

    if (sourceLanguage) sourceLanguage.addEventListener('change', updateIcons);
    if (targetLanguage) targetLanguage.addEventListener('change', updateIcons);
    updateIcons();
}

function setupOtherButtons() {
    // Copiar
    const copyBtn = document.getElementById('copy-target');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const code = document.getElementById('target-code');
            if (!code.value.trim()) return showNotification('Nada que copiar', 'error');
            navigator.clipboard.writeText(code.value)
                .then(() => showNotification('Copiado al portapapeles'))
                .catch(() => showNotification('Error al copiar', 'error'));
        });
    }

    // Limpiar Fuente
    const clearSrc = document.getElementById('clear-source');
    if (clearSrc) clearSrc.addEventListener('click', () => {
        document.getElementById('source-code').value = '';
        showNotification('Limpio', 'success');
    });

    // Limpiar Destino
    const clearTg = document.getElementById('clear-target');
    if (clearTg) clearTg.addEventListener('click', () => {
        document.getElementById('target-code').value = '';
        showNotification('Limpio', 'success');
    });

    // Pegar
    const pasteBtn = document.getElementById('paste-source');
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                document.getElementById('source-code').value = text;
                showNotification('Pegado', 'success');
            } catch (e) {
                showNotification('No se pudo pegar', 'error');
            }
        });
    }

    // Cerrar panel de cambios
    const closeBtn = document.getElementById('close-changes');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('changes-panel').classList.remove('show');
        });
    }
}

function showTranslationReport(report) {
    const panel = document.getElementById('changes-panel');
    const content = document.getElementById('changes-content');

    if (panel && content) {
        panel.classList.add('show');
        content.innerHTML = `<pre>${report}</pre>`;
        setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        border-radius: 8px; color: white; font-weight: bold; z-index: 10000;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

console.log('✅ scripts.js (Versión DEFINITIVA) cargado');