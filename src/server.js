console.log("RUNNING ONEDRIVE PROJECT");
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
const productRoutes = require('./routes/product.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const invoiceItemRoutes = require('./routes/invoiceItem.routes');
const discountRoutes = require('./routes/discount.routes');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const customerRoutes = require('./routes/customer.routes');


app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/invoice-items', invoiceItemRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);

const profitRoutes = require('./routes/profit.routes');
const receiptRoutes = require('./routes/receipt.routes');

app.use('/api/receipts', receiptRoutes);

app.use('/api/profit', profitRoutes);

// TEST ROUTE
app.get('/', (req, res) => {
    res.send('Hardware Store API running');
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});