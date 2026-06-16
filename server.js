const express = require('express');
const cors = require('cors');
const db = require('./db/db'); // 👈 add this

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE (MySQL check)
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT 1 + 1 AS result');
        res.json({
            message: 'Database connected successfully',
            result: rows[0].result
        });
    } catch (err) {
        res.status(500).json({
            message: 'Database connection failed',
            error: err.message
        });
    }
});

app.get('/', (req, res) => {
    res.send('Hardware Store API is running');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});