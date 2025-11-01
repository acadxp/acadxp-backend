import type { Request, Response } from "express";

export const AddEmailToWaitList = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    // Save email to DB or in-memory array for now
    res.status(201).json({ message: "Added to waitlist!" });
  } catch (e: any) {
    console.log(e.message);
  }
};
