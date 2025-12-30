import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParse from "cookie-parser";
import ProfileRoutes from "./routes/v1/profile.routes";
import AcademicInfosRoutes from "./routes/v1/academicInfos.routes";
import AuthRoutes from "./routes/v1/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

const corsOption = {
  origin: process.env.FRONTEND_URL!,
  // origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};
app.use(cors(corsOption));
app.options(/.*/, cors(corsOption));
// app.options("*", cors(corsOption)); // Handle preflight for all routes

app.use(express.json());
app.use(cookieParse());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", ProfileRoutes);
app.use("/api/v1/academic-infos", AcademicInfosRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
