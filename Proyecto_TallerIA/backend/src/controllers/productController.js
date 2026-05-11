const prisma = require('../config/database');

const getAll = async (req, res) => {
  const products = await prisma.product.findMany({
    where: { tenantId: req.tenantId },
    include: { inventoryItem: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(products);
};

const create = async (req, res) => {
  const { name, description, price, sku } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nombre y precio son requeridos' });

  const product = await prisma.product.create({
    data: { tenantId: req.tenantId, name, description, price: parseFloat(price), sku }
  });

  await prisma.inventoryItem.create({
    data: { productId: product.id, quantity: 0, minStock: 5 }
  });

  const full = await prisma.product.findUnique({ where: { id: product.id }, include: { inventoryItem: true } });
  res.status(201).json(full);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, sku } = req.body;

  const product = await prisma.product.findFirst({ where: { id, tenantId: req.tenantId } });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  const updated = await prisma.product.update({
    where: { id },
    data: { name, description, price: price ? parseFloat(price) : undefined, sku },
    include: { inventoryItem: true }
  });
  res.json(updated);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findFirst({ where: { id, tenantId: req.tenantId } });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  await prisma.saleItem.deleteMany({ where: { productId: id } });
  await prisma.inventoryItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  res.json({ message: 'Producto eliminado' });
};

module.exports = { getAll, create, update, remove };
