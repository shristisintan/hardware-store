const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find user
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Invalid username or password'
            });
        }

        const user = users[0];

        // 2. Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid username or password'
            });
        }

        // 3. Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};