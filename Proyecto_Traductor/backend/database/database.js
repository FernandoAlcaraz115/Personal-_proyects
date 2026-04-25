const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect((err) => {
    if (err) console.error('❌ Error conectando a PostgreSQL:', err.stack);
    else console.log('🐘 Conexión exitosa a PostgreSQL');
});

// --- USUARIOS ---
async function createUser(username, passwordHash) {
    const query = `
        INSERT INTO users (username, password_hash, role)
        VALUES ($1, $2, 'user')
        RETURNING id, username, role, created_at
    `;
    try {
        const res = await pool.query(query, [username, passwordHash]);
        return res.rows[0];
    } catch (err) {
        if (err.code === '23505') throw new Error('El usuario ya existe');
        throw err;
    }
}

async function findUserByUsername(username) {
    const query = `SELECT * FROM users WHERE username = $1`;
    const res = await pool.query(query, [username]);
    return res.rows[0];
}

// --- ADMINISTRACIÓN ---
async function getAllUsers() {
    const query = `SELECT id, username, role, created_at FROM users ORDER BY id ASC`;
    const res = await pool.query(query);
    return res.rows;
}

async function getAllTranslations() {
    const query = `
        SELECT t.id, t.source_lang, t.target_lang, t.created_at, u.username 
        FROM translations t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
    `;
    const res = await pool.query(query);
    return res.rows;
}

// --- TRADUCCIONES ---
async function saveTranslation(data) {
    const { sourceLang, targetLang, sourceCode, translatedCode, userId = null } = data;
    const query = `
        INSERT INTO translations (source_lang, target_lang, source_code, translated_code, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    try {
        const res = await pool.query(query, [sourceLang, targetLang, sourceCode, translatedCode, userId]);
        return res.rows[0];
    } catch (err) { console.error(err); }
}

async function getTranslationHistory(userId, limit = 10) {
    let query, params;
    if (userId) {
        query = `SELECT * FROM translations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`;
        params = [userId, limit];
    } else {
        query = `SELECT * FROM translations WHERE user_id IS NULL ORDER BY created_at DESC LIMIT $1`;
        params = [limit];
    }
    try {
        const res = await pool.query(query, params);
        return res.rows;
    } catch (err) { return []; }
}

async function getUsageStats() {
    const query = `
        SELECT source_lang || '_to_' || target_lang as language_pair, COUNT(*) as usage_count
        FROM translations GROUP BY source_lang, target_lang ORDER BY usage_count DESC
    `;
    try { const res = await pool.query(query); return res.rows; } catch (err) { return []; }
}

async function resetDatabase() {
    await pool.query('TRUNCATE translations CASCADE');
}

module.exports = {
    createUser,
    findUserByUsername,
    getAllUsers,        // Exportado
    getAllTranslations, // Exportado
    saveTranslation,
    getTranslationHistory,
    getUsageStats,
    resetDatabase
};