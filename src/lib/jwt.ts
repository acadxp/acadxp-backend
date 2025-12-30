import jwt from "jsonwebtoken";

interface TokenPayload {
  role: string;
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  return token;
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET!;
  const refreshToken = jwt.sign(payload, secret, { expiresIn: "30d" });
  return refreshToken;
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  const decoded = jwt.verify(token, secret) as TokenPayload;
  return decoded;
};
