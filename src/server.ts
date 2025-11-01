import express from "express";
import dotenv from "dotenv";
import WaitListRoutes from "./routes/v1/waitlist.routes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;
app.use(express.json());

app.use("/api/v1/waitlist", WaitListRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
