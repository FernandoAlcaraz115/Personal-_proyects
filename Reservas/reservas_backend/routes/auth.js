const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { insertUser, getUserByEmail } = require('../database');
const router  = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password)
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Correo electrónico inválido.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres.' });
    if (getUserByEmail(email))
      return res.status(409).json({ error: 'Este correo ya tiene una cuenta.' });

    const hash  = await bcrypt.hash(password, 10);
    const role  = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
    const user  = insertUser({ nombre, email, password: hash, role });

    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ ok: true, token, nombre: user.nombre, role: user.role });
  } catch (err) {
    console.error('Error en /register:', err.message);
    res.status(500).json({ error: 'Error interno al registrar.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });

    const user = getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ ok: true, token, nombre: user.nombre, role: user.role });
  } catch (err) {
    console.error('Error en /login:', err.message);
    res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
});

module.exports = router;
