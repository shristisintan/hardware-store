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