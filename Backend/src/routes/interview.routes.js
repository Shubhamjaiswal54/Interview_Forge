const express = require("express")
const { authUser } = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()

interviewRouter.use(authUser)

interviewRouter.get("/", interviewController.getAllInterviewReportsController)
interviewRouter.post("/", upload.single("resume"), interviewController.generateInterviewReportController)
interviewRouter.get("/report/:interviewId", interviewController.getInterviewReportByIdController)
interviewRouter.post("/resume/:interviewId", interviewController.generateResumeController)

module.exports = interviewRouter
