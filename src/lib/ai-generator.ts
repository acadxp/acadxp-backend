import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";
import type { MessageInputEntry } from "@mistralai/mistralai/models/components";

dotenv.config();

const apiKey = process.env.MISTRAL_AI_STUDIO_API_KEY;

const client = new Mistral({ apiKey: apiKey });

const schemaDefinition = {
  type: "object",
  properties: {
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          xpValue: { type: "number" },
          iconPrompt: { type: "string" },
          criteria: {
            type: "object",
            properties: {
              logic: {
                type: "string",
                enum: ["AND", "OR"],
              },
              rules: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: [
                        "COUNT",
                        "SCORE",
                        "COMPLETION",
                        "SUBMISSION",
                        "GRADE",
                      ],
                    },
                    target: { type: "string" },
                    operator: {
                      type: "string",
                      enum: ["GTE", "GT", "EQ"],
                    },
                    value: { type: "number" },
                  },
                  required: ["type", "target", "operator", "value"],
                },
              },
            },
            required: ["logic", "rules"],
          },
        },
        required: ["title", "description", "xpValue", "iconPrompt", "criteria"],
      },
    },

    challenges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
          },
          xpReward: { type: "number" },
          criteria: {
            type: "object",
            properties: {
              logic: {
                type: "string",
                enum: ["AND", "OR"],
              },
              rules: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: [
                        "COUNT",
                        "SCORE",
                        "COMPLETION",
                        "SUBMISSION",
                        "GRADE",
                      ],
                    },
                    target: { type: "string" },
                    operator: {
                      type: "string",
                      enum: ["GTE", "GT", "EQ"],
                    },
                    value: { type: "number" },
                  },
                  required: ["type", "target", "operator", "value"],
                },
              },
            },
            required: ["logic", "rules"],
          },
        },
        required: [
          "title",
          "description",
          "difficulty",
          "xpReward",
          "criteria",
        ],
      },
    },

    badges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          xpValue: { type: "number" },
          iconPrompt: { type: "string" },
          criteria: {
            type: "object",
            properties: {
              logic: {
                type: "string",
                enum: ["AND", "OR"],
              },
              rules: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: [
                        "COUNT",
                        "SCORE",
                        "COMPLETION",
                        "SUBMISSION",
                        "GRADE",
                      ],
                    },
                    target: { type: "string" },
                    operator: {
                      type: "string",
                      enum: ["GTE", "GT", "EQ"],
                    },
                    value: { type: "number" },
                  },
                  required: ["type", "target", "operator", "value"],
                },
              },
            },
            required: ["logic", "rules"],
          },
        },
        required: ["title", "description", "xpValue", "iconPrompt", "criteria"],
      },
    },
  },
  required: ["skills", "challenges", "badges"],
};

// System prompt to guide the AI's response
const systemPrompt = `You are AcadXP AI, an academic game designer\n Your role is to transform any academic course into a structured, gamified experience.\n You must generate skills, challenges, and badges that are:\n academically meaningful\n discipline-agnostic\nachievable by a real student\nbalanced in difficulty and XP rewards\n.\nDo not include explanations, markdown, or extra text. 
Only return the JSON response that strictly adheres to the provided schema.`;

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
  return `Generate a gamified blueprint for the following academic course.\n\nCourse ID: ${courseId}\nCourse title: ${courseTitle}\nCourse description: ${courseDescription}\nAcademic level: ${academicLevel}\n\nRules:\n- Generate between 3 and 5 skills\n- Generate between 5 and 8 challenges\n- Generate between 2 and 3 badges\n- XP must be realistic and balanced\n- Challenges must reference real academic activities\n- Avoid vague or generic content\n- Ensure a mix of easy, medium, and hard challenges\n- Use the provided course information to create relevant and engaging content`;
};

export const aiGeneratedBluePrint = async (courseInfo: CourseInfo) => {
  const userPrompt = buildCoursePrompt(courseInfo);

  const messages: MessageInputEntry[] = [
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const chatResponse = await client.beta.conversations.start({
    inputs: messages,
    model: "mistral-large-latest",
    instructions: systemPrompt,
    completionArgs: {
      temperature: 0.1,
      maxTokens: 4096,
      topP: 1,
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "response_schema",
          schemaDefinition: schemaDefinition,
        },
      },
    },
  });

  return chatResponse;
};
