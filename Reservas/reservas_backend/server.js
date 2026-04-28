require('dotenv').config();

// Evita que errores no capturados tiren el proceso
process.on('uncaughtException',    err => console.error('❌ uncaughtException:', err.message));
process.on('unhandledRejection',   err => console.error('❌ unhandledRejection:', err?.message ?? err));

const express      = require('express');
const cors         = require('cors');
const { insertReserva, getAllReservas, getReservaByFolio, deleteReserva } = require('./database');
const { sendConfirmacion } = require('./mailer');
const { requireAuth }      = require('./middleware/authMiddleware');
const authRouter   = require('./routes/auth');
const adminRouter  = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Auth routes ──────────────────────────────────────────
app.use('/api/auth', authRouter);

// ── Admin routes ─────────────────────────────────────────
app.use('/api/admin', adminRouter);

// ── POST /api/reservas ── guarda reserva y manda correo ──
app.post('/api/reservas', requireAuth, async (req, res) => {
  const { tour, fecha_viaje, personas, total, nombre, email, telefono, notas } = req.body;

  if (!tour || !nombre || !email || !personas)
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });

  const n = Number(personas);
  if (!Number.isInteger(n) || n < 1 || n > 10)
    return res.status(400).json({ error: 'Número de personas inválido (1–10).' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Correo electrónico inválido.' });

  const folio = 'RV-' + Date.now().toString(36).toUpperCase().slice(-6);

  try {
    insertReserva({
      folio, tour, fecha_viaje: fecha_viaje || '',
      personas: n, total: Number(total),
      nombre, email,
      telefono: telefono || '',
      notas:    notas    || '',
    });

    await sendConfirmacion({ nombre, email, tour, personas: n, total: Number(total), folio });

    res.status(201).json({ ok: true, folio });
  } catch (err) {
    console.error('Error al guardar reserva:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ── GET /api/reservas ─────────────────────────────────────
app.get('/api/reservas', requireAuth, (_req, res) => {
  res.json(getAllReservas());
});

// ── DELETE /api/reservas/:folio ───────────────────────────
app.delete('/api/reservas/:folio', requireAuth, (req, res) => {
  const { folio } = req.params;
  if (!getReservaByFolio(folio))
    return res.status(404).json({ error: 'Reserva no encontrada.' });
  deleteReserva(folio);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✈️  Fernando Travels backend · http://localhost:${PORT}`);
});
