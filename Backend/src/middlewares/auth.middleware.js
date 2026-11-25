const jwt = require("jsonwebtoken")

function authUser(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({ message: "Not logged in." })
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." })
    }
}

module.exports = { authUser }
