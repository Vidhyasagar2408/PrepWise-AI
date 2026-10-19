const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),

  title: z.string(),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert technical recruiter and interview preparation assistant.

Analyze the candidate's resume, self-description, and job description.

Generate a structured interview report.

Requirements:
1. matchScore: A number between 0 and 100.
2. technicalQuestions: An array of objects. Each object must contain:
   - question: The interview question.
   - intention: Why the interviewer asks this question.
   - answer: A detailed suggested answer.
3. behavioralQuestions: An array of objects. Each object must contain:
   - question: The behavioral interview question.
   - intention: What the interviewer wants to evaluate.
   - answer: A suggested answer approach.
4. skillGaps: An array of objects containing:
   - skill: The missing or weak skill.
   - severity: Exactly "low", "medium", or "high".
5. preparationPlan: An array of objects containing:
   - day: A number representing the preparation day.
   - focus: The main topic for that day.
   - tasks: An array of strings describing preparation activities.
6. title: The job title.

IMPORTANT:
- Return JSON matching the provided response schema.
- Do not return arrays of strings where arrays of objects are required.
- Do not combine question, intention, and answer into one string.
- Generate at least 5 technical questions.
- Generate at least 3 behavioral questions.
- Generate at least 3 skill gaps when relevant.
- Generate a preparation plan covering 5 days.
- Base the analysis on the supplied information. Do not invent experience or qualifications.

Resume:
${resume}

Self-description:
${selfDescription}

Job description:
${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          matchScore: {
            type: "NUMBER",
          },
          title: {
            type: "STRING",
          },
          technicalQuestions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { type: "STRING" },
                intention: { type: "STRING" },
                answer: { type: "STRING" },
              },
              required: ["question", "intention", "answer"],
            },
          },
          behavioralQuestions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { type: "STRING" },
                intention: { type: "STRING" },
                answer: { type: "STRING" },
              },
              required: ["question", "intention", "answer"],
            },
          },
          skillGaps: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                skill: { type: "STRING" },
                severity: {
                  type: "STRING",
                  enum: ["low", "medium", "high"],
                },
              },
              required: ["skill", "severity"],
            },
          },
          preparationPlan: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                day: { type: "INTEGER" },
                focus: { type: "STRING" },
                tasks: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
              },
              required: ["day", "focus", "tasks"],
            },
          },
        },
        required: [
          "matchScore",
          "title",
          "technicalQuestions",
          "behavioralQuestions",
          "skillGaps",
          "preparationPlan",
        ],
      },
    },
  });

  const interviewReport = interviewReportSchema.parse(
    JSON.parse(response.text),
  );
  return interviewReport;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
