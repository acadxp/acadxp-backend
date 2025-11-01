import express from "express";
import dotenv from "dotenv";
import WaitListRoutes from "./routes/v1/waitlist.routes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;
app.use(express.json());

app.use("api/v1/waitlist", WaitListRoutes);

app.listen(PORT, () => {
  console.log(`Server is runnug on port ${PORT}`);
});
