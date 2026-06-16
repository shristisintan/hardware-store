const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
const productRoutes = require('./routes/product.routes');
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Hardware Store API running');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const invoiceRoutes = require('./routes/invoice.routes');
app.use('/api/invoices', invoiceRoutes);

const invoiceItemRoutes = require('./routes/invoiceItem.routes');
app.use('/api/invoice-items', invoiceItemRoutes);

const discountRoutes = require('./routes/discount.routes');
app.use('/api/discounts', discountRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

