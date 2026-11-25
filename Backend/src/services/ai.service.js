const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
const MODEL = "gemini-3-flash-preview"

const questionSchema = z.object({
    question: z.string().describe("A question that can be asked in the interview"),
    intention: z.string().describe("The intention of interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
})

const interviewReportSchema = z.object({
    title: z.string().describe("The title of the job for which the interview report is generated"),
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(questionSchema).describe("Technical questions that can be asked in the interview"),
    behavioralQuestions: z.array(questionSchema).describe("Behavioral questions that can be asked in the interview"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("How much this skill gap can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day")
    })).describe("A day-wise preparation plan for the candidate"),
})

const resumeSchema = z.object({
    html: z.string().describe("The full HTML document of the resume")
})

async function generateJson(prompt, schema) {
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(schema, { target: "openApi3", $refStrategy: "none" }),
        }
    })

    return schema.parse(JSON.parse(response.text))
}

function candidateDetails({ resume, selfDescription, jobDescription }) {
    return `Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}`
}

async function generateInterviewReport(details) {
    const prompt = `Generate an interview report for a candidate with the following details:
${candidateDetails(details)}`

    const report = await generateJson(prompt, interviewReportSchema)
    report.matchScore = Math.min(100, Math.max(0, Math.round(report.matchScore)))
    return report
}

async function generateResumeHtml(details) {
    const prompt = `Generate a resume for a candidate with the following details:
${candidateDetails(details)}

Return a JSON object with a single field "html" containing a complete HTML document for the resume.
- Tailor it to the job description and highlight the candidate's strengths and relevant experience.
- It should read like a real human-written resume, not AI-generated text.
- Keep the design simple and professional; a little color or font styling is fine. Use inline CSS only, no scripts or external resources.
- It must be ATS friendly.
- It will be printed to an A4 PDF from a browser, so it should fit on 1-2 pages. Focus on quality over quantity.`

    const { html } = await generateJson(prompt, resumeSchema)
    return html
}

module.exports = { generateInterviewReport, generateResumeHtml }
