import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types/auth.types";

/**
 * Generates a short-lived access token (valid for 7 days) used to authenticate user requests.
 *
 * @param {TokenPayload} payload - The data to include inside the JWT payload
 * @returns {string} A signed JWT access token.
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

/**
 * Generates a long-lived refresh token (valid for 30 days) used to obtain new access tokens.
 *
 * @param {TokenPayload} payload - The data to include inside the JWT payload
 * @returns {string} A signed JWT refresh token.
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "30d",
  });
};

/**
 * Verifies a given JWT token using the provided secret key and returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 *
 * @param {string} token - The JWT token to verify.
 * @param {string} secret - The secret key used to verify the token.
 * @returns {TokenPayload} The decoded token payload.
 */
export const verifyToken = (token: string, secret: string): TokenPayload => {
  return jwt.verify(token, secret) as TokenPayload;
};
