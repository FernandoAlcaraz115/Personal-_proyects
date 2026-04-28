const express      = require('express');
const { getAllReservas, getAllUsers } = require('../database');
const { requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/admin/reservas
router.get('/reservas', requireAdmin, (_req, res) => {
  res.json(getAllReservas());
});

// GET /api/admin/usuarios
router.get('/usuarios', requireAdmin, (_req, res) => {
  res.json(getAllUsers());
});

module.exports = router;
