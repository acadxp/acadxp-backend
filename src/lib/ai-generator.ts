import { Mistral } from "@mistralai/mistralai";
import { aiBluePrintSchema } from "../validation/course-blue-print.schema";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.MISTRAL_AI_STUDIO_API_KEY;

const client = new Mistral({ apiKey: apiKey });

// System prompt to guide the AI's response
const systemPrompt = `You are AcadXP AI, an academic game designer\n Your role is to transform any academic course into a structured, gamified experience.\n You must generate skills, challenges, and badges that are:\n academically meaningful\n discipline-agnostic\nachievable by a real student\nbalanced in difficulty and XP rewards\n You must ALWAYS respond with VALID JSON.\nDo not include explanations, markdown, or extra text.`;

type CourseInfo = {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  academicLevel: string;
};

// Build the user prompt based on the course information
const buildCoursePrompt = (courseInfo: CourseInfo) => {
  const { courseId, courseTitle, courseDescription, academicLevel } =
    courseInfo;
  return `
   Generate a gamified blueprint for the following academic course.

Course ID: ${courseId}
Course title: ${courseTitle}
Course description: ${courseDescription}
Academic level: ${academicLevel}

Rules:
- Generate between 5 and 8 skills
- Generate between 3 and 5 challenges
- Generate between 2 and 3 badges
- XP must be realistic and balanced
- Challenges must reference real academic activities
- Avoid vague or generic content
- Ensure a mix of easy, medium, and hard challenges
- Use the provided course information to create relevant and engaging content`;
};

// CourseAgent Creator

// let CourseAgent = await client.beta.agents.create({
//   model: "mistral-large-2512",
//   name: "CourseGenerator Agent",
//   description:
//     "An agent that generates gamified blueprints for academic courses",
//   instructions: systemPrompt,
// });

export const aiGeneratedBluePrint = async (courseInfo: CourseInfo) => {
  const userPrompt = buildCoursePrompt(courseInfo);

  const chatResponse = await client.chat.parse({
    model: "mistral-large-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    responseFormat: aiBluePrintSchema,
    maxTokens: 4000,
    temperature: 0.3,
  });

  return chatResponse;
};
