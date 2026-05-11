const prisma = require('../config/database');

const getAll = async (req, res) => {
  const customers = await prisma.customer.findMany({
    where: { tenantId: req.tenantId },
    orderBy: { name: 'asc' }
  });
  res.json(customers);
};

const create = async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

  const customer = await prisma.customer.create({
    data: { tenantId: req.tenantId, name, email, phone }
  });
  res.status(201).json(customer);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  const customer = await prisma.customer.findFirst({ where: { id, tenantId: req.tenantId } });
  if (!customer) return res.status(404).json({ error: 'Cliente no encontrado' });

  const updated = await prisma.customer.update({ where: { id }, data: { name, email, phone } });
  res.json(updated);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const customer = await prisma.customer.findFirst({ where: { id, tenantId: req.tenantId } });
  if (!customer) return res.status(404).json({ error: 'Cliente no encontrado' });

  await prisma.customer.delete({ where: { id } });
  res.json({ message: 'Cliente eliminado' });
};

module.exports = { getAll, create, update, remove };
