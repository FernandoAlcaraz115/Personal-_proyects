const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const register = async (req, res) => {
  const { companyName, email, password } = req.body;
  if (!companyName || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  try {
    const exists = await prisma.tenant.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'El email ya está registrado' });

    const passwordHash = await bcrypt.hash(password, 12);
    const tenant = await prisma.tenant.create({
      data: { companyName, email, passwordHash },
      select: { id: true, companyName: true, email: true }
    });

    const token = jwt.sign({ tenantId: tenant.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, tenant });
  } catch {
    res.status(500).json({ error: 'Error al registrar empresa' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  try {
    const tenant = await prisma.tenant.findUnique({ where: { email } });
    if (!tenant) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, tenant.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ tenantId: tenant.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, tenant: { id: tenant.id, companyName: tenant.companyName, email: tenant.email } });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

const me = async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId },
      select: { id: true, companyName: true, email: true, plan: true, createdAt: true }
    });
    res.json(tenant);
  } catch {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};

module.exports = { register, login, me };
