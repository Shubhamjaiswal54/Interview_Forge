const mongoose = require("mongoose")
const { PDFParse } = require("pdf-parse")
const { generateInterviewReport, generateResumeHtml } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function extractPdfText(buffer) {
    const parser = new PDFParse({ data: buffer })
    try {
        const result = await parser.getText()
        return result.text
    } finally {
        await parser.destroy()
    }
}

function findUserReport(req) {
    const { interviewId } = req.params
    if (!mongoose.isValidObjectId(interviewId)) {
        return null
    }
    return interviewReportModel.findOne({ _id: interviewId, user: req.user.id })
}

async function generateInterviewReportController(req, res) {
    const { jobDescription, selfDescription } = req.body

    if (!jobDescription) {
        return res.status(400).json({ message: "Job description is required." })
    }

    if (!req.file && !selfDescription) {
        return res.status(400).json({ message: "Please upload a resume or write a self description." })
    }

    const resume = req.file ? await extractPdfText(req.file.buffer) : ""

    const reportByAi = await generateInterviewReport({ resume, selfDescription, jobDescription })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume,
        selfDescription,
        jobDescription,
        ...reportByAi
    })

    res.status(201).json({ interviewReport })
}

async function getInterviewReportByIdController(req, res) {
    const interviewReport = await findUserReport(req)

    if (!interviewReport) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    res.status(200).json({ interviewReport })
}

async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("title matchScore createdAt")

    res.status(200).json({ interviewReports })
}

async function generateResumeController(req, res) {
    const interviewReport = await findUserReport(req)

    if (!interviewReport) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    const { resume, jobDescription, selfDescription } = interviewReport
    const html = await generateResumeHtml({ resume, jobDescription, selfDescription })

    res.status(200).json({ html })
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumeController
}
