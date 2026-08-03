const jwt = require("jsonwebtoken");

// =====================================================
// LOGIN
// =====================================================
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // =============================================
        // TEMPORARY LOCAL DEVELOPMENT LOGIN
        // =============================================
        if (
            username === "admin" &&
            password === "admin123"
        ) {
            const token = jwt.sign(
                {
                    id: 1,
                    role: "admin",
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d",
                }
            );

            return res.json({
                success: true,
                message: "Login successful",
                data: {
                    token,
                    user: {
                        id: 1,
                        name: "Admin",
                        username: "admin",
                        role: "admin",
                    },
                },
            });
        }

        // =============================================
        // INVALID CREDENTIALS
        // =============================================
        return res.status(401).json({
            success: false,
            message: "Invalid credentials",
        });

    } catch (err) {

        console.error("Login error:", err);

        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: err.message,
        });
    }
};


// =====================================================
// GET CURRENT USER
// =====================================================
exports.me = async (req, res) => {
    try {

        // req.user comes from JWT middleware
        return res.json({
            success: true,
            message: "User fetched successfully",
            data: req.user,
        });

    } catch (err) {

        console.error("Get user error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
            error: err.message,
        });
    }
};