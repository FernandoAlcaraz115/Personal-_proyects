const prisma = require('../config/database');

const getAll = async (req, res) => {
  const sales = await prisma.sale.findMany({
    where: { tenantId: req.tenantId },
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(sales);
};

const create = async (req, res) => {
  const { customerId, items } = req.body;
  if (!items || items.length === 0)
    return res.status(400).json({ error: 'La venta debe tener al menos un producto' });

  const productIds = items.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, tenantId: req.tenantId }
  });

  if (products.length !== productIds.length)
    return res.status(400).json({ error: 'Uno o más productos no son válidos' });

  const total = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + parseFloat(product.price) * item.quantity;
  }, 0);

  const sale = await prisma.sale.create({
    data: {
      tenantId: req.tenantId,
      customerId: customerId || null,
      total,
      status: 'completed',
      items: {
        create: items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return { productId: item.productId, quantity: item.quantity, unitPrice: product.price };
        })
      }
    },
    include: { customer: true, items: { include: { product: true } } }
  });

  for (const item of items) {
    await prisma.inventoryItem.updateMany({
      where: { productId: item.productId },
      data: { quantity: { decrement: item.quantity } }
    });
  }

  res.status(201).json(sale);
};

module.exports = { getAll, create };
