import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import WaitListRoutes from "./routes/v1/waitlist.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [process.env.FRONTEND_URL!, "http://localhost:3000"];

const corsOption = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // If you need to send cookies
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};
app.use(express.json());
app.use(cors(corsOption));

app.use("/api/v1/waitlist", WaitListRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
