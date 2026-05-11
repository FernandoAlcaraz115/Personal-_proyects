require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const customerRoutes = require('./routes/customers');
const salesRoutes = require('./routes/sales');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Nexos ERP API' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Nexos ERP API corriendo en puerto ${PORT}`));
