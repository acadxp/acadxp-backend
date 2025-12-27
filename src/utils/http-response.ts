import type { Response } from "express";

export const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data || null,
  });
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
