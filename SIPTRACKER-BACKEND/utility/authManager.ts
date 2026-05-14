import jwt, { JwtPayload } from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "SPITRACKER_AND_PORTFOLIOVALUATION_AS_SECRET_KEY";

export const generateToken = (payload: Record<string, unknown>): string => {
  return jwt.sign(payload, secretKey, {
    expiresIn: "1d"
  });
};

export const verifyJWT = (token: string): JwtPayload => {
  return jwt.verify(token, secretKey) as JwtPayload;
};
