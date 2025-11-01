import type { Request, Response } from "express";
import * as z from "zod";
import prisma from "../../utils/db";
import { generateUUID } from "@neylorxt/generate-unique-key";

export const AddEmailToWaitList = async (req: Request, res: Response) => {
  const { email } = req.body;

  const schema = z.object({
    email: z.email(),
  });

  try {
    schema.parse({ email });

    const addEmail = await prisma.waitlistUser.create({
      data: {
        id: generateUUID(),
        email,
      },
    });

    if (!addEmail) {
      throw new Error("Failed to add email to waitlist");
    }
    res.status(201).json({ message: "Added to waitlist!", success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e: any) => e.message);

      return res.status(400).json({ success: false, messages });
    }
    res.status(500).json({
      message: "Error when adding email to waitlist",
      success: false,
      error: error.message,
    });
    console.log(error);
  }
};
