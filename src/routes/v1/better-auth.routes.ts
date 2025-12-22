import type { Request, Response } from "express";
import express from "express";
import auth from "../../lib/auth";
import prisma from "../../lib/db";
import asyncHandler from "../../lib/utils/asyncHandler";

const BetterAuthRoutes = express.Router();

// Better-Auth API Routes
BetterAuthRoutes.use(
  asyncHandler(async (req: Request, res: Response) => {
    // ? NOTE :  Better Auth expects a Web API Request object (from the Fetch API), not Express's Request object.

    const headers = req.headers as Record<string, string>;

    // Add Origin header if missing (for development/Postman testing)
    if (!headers.origin) {
      headers.origin = `${req.protocol}://${req.get("host")}`;
    }

    const request = new Request(
      `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body:
          req.method !== "GET" && req.method !== "HEAD"
            ? JSON.stringify(req.body)
            : undefined,
      }
    );

    const response = await auth.handler(request);

    // Check if this is a sign-in or sign-up response
    if (
      (req.originalUrl.includes("sign-in") ||
        req.originalUrl.includes("sign-up")) &&
      response.status === 200
    ) {
      const responseBody = (await response.json()) as any;

      // If user exists in response, fetch their role
      if (responseBody.user && responseBody.user.id) {
        const userWithRole = await prisma.user.findUnique({
          where: { id: responseBody.user.id },
          select: { role: true },
        });

        if (userWithRole) {
          responseBody.user.role = userWithRole.role;
        }
      }

      // Copy response headers to Express response
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      res.status(response.status).json(responseBody);
      return;
    }

    // Copy response headers to Express response
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status).send(await response.text());
  })
);

export default BetterAuthRoutes;
