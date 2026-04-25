const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const {
    saveTranslation,
    getTranslationHistory,
    getUsageStats,
    createUser,
    findUserByUsername,
    getAllUsers,          // Importado
    getAllTranslations    // Importado
} = require('./database/database');

const app = express();
const PORT = 3000;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!GROQ_API_KEY) console.error('❌ ALERTA: Faltan credenciales API en .env');

// === MIDDLEWARES ===

// 1. Autenticación Opcional (Para traducir)
const authenticateOptional = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) { req.user = null; return next(); }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        req.user = err ? null : user;
        next();
    });
};

// 2. Requiere ADMIN (Para el panel) - ¡Seguridad Máxima! 🛡️
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });

        // Verificamos el rol
        if (user.role !== 'admin') {
            return res.status(403).json({ error: '⛔ Requiere privilegios de Administrador' });
        }

        req.user = user;
        next();
    });
};

// === RUTAS AUTH ===

app.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const newUser = await createUser(username, hash);
        res.json({ success: true, message: 'Usuario creado', user: newUser });
    } catch (error) { res.status(400).json({ success: false, error: error.message }); }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await findUserByUsername(username);
        if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) return res.status(400).json({ error: 'Contraseña incorrecta' });

        // Incluimos el ROL en el token y en la respuesta
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token, username: user.username, role: user.role });
    } catch (error) { res.status(500).json({ error: 'Error en el servidor' }); }
});

// === RUTAS ADMIN ===
app.get('/admin/data', requireAdmin, async (req, res) => {
    try {
        const users = await getAllUsers();
        const translations = await getAllTranslations();
        res.json({ success: true, users, translations });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo datos de admin' });
    }
});

// === RUTAS TRADUCCIÓN ===

function processAIResponse(response) {
    const separator = '|||||';
    let code = response;
    let report = "Ver detalles en el código.";

    if (response.includes(separator)) {
        const parts = response.split(separator);
        code = parts[0].trim();
        report = parts[1].trim();
    } else if (response.includes('```')) {
        const matches = response.match(/```([\s\S]*?)```/);
        if (matches && matches[1]) {
            code = matches[1].trim();
            report = response.replace(matches[0], '').trim();
        }
    }
    code = code.replace(/^(java|python|javascript|cpp|csharp|php|ruby)\n/i, '');
    code = code.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim();
    return { code, report };
}

app.post('/translate', authenticateOptional, async (req, res) => {
    try {
        const { sourceCode, sourceLang, targetLang, includeComments = true, model = 'llama-3.1-8b-instant' } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!sourceCode) return res.status(400).json({ error: 'Falta código' });
        console.log(`🔧 Traduciendo (${userId || 'Anónimo'}): ${sourceLang} -> ${targetLang}`);

        const systemPrompt = `Actúa como un compilador experto. Traduce de ${sourceLang} a ${targetLang}.
${includeComments ? "Incluye comentarios breves." : "Sin comentarios."}
FORMATO DE SALIDA ESTRICTO:
1. Bloque de código traducido.
2. Separador EXACTO: |||||
3. Breve resumen de cambios.`;

        const response = await axios.post(GROQ_API_URL, {
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: sourceCode }
            ],
            model: model,
            temperature: 0.1,
        }, { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` } });

        const processed = processAIResponse(response.data.choices[0].message.content);

        saveTranslation({ sourceLang, targetLang, sourceCode, translatedCode: processed.code, userId: userId });
        res.json({ success: true, translatedCode: processed.code, report: processed.report });

    } catch (error) {
        console.error('❌ Error API:', error.message);
        res.status(500).json({ success: false, error: 'Error al conectar con la IA' });
    }
});

app.get('/history', authenticateOptional, async (req, res) => {
    const userId = req.user ? req.user.id : null;
    const history = await getTranslationHistory(userId);
    res.json({ success: true, history });
});

app.get('/stats', async (req, res) => res.json({ success: true, stats: await getUsageStats() }));

app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR ADMIN LISTO: http://localhost:${PORT}`);
});