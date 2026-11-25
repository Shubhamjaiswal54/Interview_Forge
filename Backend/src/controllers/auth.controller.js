const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
}

function sendUserWithToken(res, status, message, user) {
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, { ...cookieOptions, maxAge: ONE_DAY_MS })
    res.status(status).json({
        message,
        user: { id: user._id, username: user.username, email: user.email }
    })
}

async function registerUserController(req, res) {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please provide username, email and password" })
    }

    const existingUser = await userModel.findOne({ $or: [ { username }, { email } ] })

    if (existingUser) {
        return res.status(400).json({ message: "Account already exists with this email address or username" })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await userModel.create({ username, email, password: hash })

    sendUserWithToken(res, 201, "User registered successfully", user)
}

async function loginUserController(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" })
    }

    const user = await userModel.findOne({ email })

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid email or password" })
    }

    sendUserWithToken(res, 200, "User logged in successfully", user)
}

function logoutUserController(req, res) {
    res.clearCookie("token", cookieOptions)
    res.status(200).json({ message: "User logged out successfully" })
}

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        return res.status(401).json({ message: "User not found" })
    }

    res.status(200).json({
        user: { id: user._id, username: user.username, email: user.email }
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
