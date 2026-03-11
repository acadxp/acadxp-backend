import express from "express";
import { generateCourseBlueprint } from "../../controllers/v1/ai-course-blueprint.controller";

const aiCourseBlueprintRouter = express.Router();

aiCourseBlueprintRouter.post("/generate", generateCourseBlueprint);

export default aiCourseBlueprintRouter;
