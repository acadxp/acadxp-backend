import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import BetterAuthRoutes from "./routes/v1/better-auth.routes";
import ProfileRoutes from "./routes/v1/profile.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

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

// Better-Auth routes (handles all auth endpoints)
app.use("/api/v1/auth", BetterAuthRoutes);

app.use("/api/v1/users", ProfileRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
