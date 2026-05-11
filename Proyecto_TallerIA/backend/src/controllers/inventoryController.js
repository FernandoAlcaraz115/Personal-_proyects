const prisma = require('../config/database');

const getAll = async (req, res) => {
  const inventory = await prisma.inventoryItem.findMany({
    where: { product: { tenantId: req.tenantId } },
    include: { product: true },
    orderBy: { product: { name: 'asc' } }
  });
  res.json(inventory);
};

const updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity, minStock } = req.body;

  const item = await prisma.inventoryItem.findFirst({
    where: { id, product: { tenantId: req.tenantId } }
  });
  if (!item) return res.status(404).json({ error: 'Item no encontrado' });

  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: {
      quantity: quantity !== undefined ? parseInt(quantity) : undefined,
      minStock: minStock !== undefined ? parseInt(minStock) : undefined
    },
    include: { product: true }
  });
  res.json(updated);
};

module.exports = { getAll, updateStock };
