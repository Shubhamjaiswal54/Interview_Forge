const multer = require("multer")

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            const err = new Error("Resume must be a PDF file")
            err.status = 400
            return cb(err)
        }
        cb(null, true)
    }
})

module.exports = upload
