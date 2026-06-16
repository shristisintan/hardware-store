const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    let { username, password } = req.body;

    // 1. Check missing body
    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    // 2. Type check (basic safety)
    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
            message: 'Invalid input format'
        });
    }

    // 3. Trim inputs
    username = username.trim();
    password = password.trim();

    // 4. Empty after trim
    if (username === '' || password === '') {
        return res.status(400).json({
            message: 'Fields cannot be empty'
        });
    }

    try {
        // 5. Get user
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        // 6. Prevent user enumeration (important security practice)
        if (users.length === 0) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // 7. Check if account active
        if (!user.is_active) {
            return res.status(403).json({
                message: 'Account is deactivated'
            });
        }

        // 8. Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // 9. Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 10. Response
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};