import express from "express";
import { AddEmailToWaitList } from "../../controllers/v1/waitlist.controller";

const WaitListRoutes = express.Router();

WaitListRoutes.post("/add", AddEmailToWaitList);

export default WaitListRoutes;
