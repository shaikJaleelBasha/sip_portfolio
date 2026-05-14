import jwt from "jsonwebtoken";

const secretKey = "SPITRACKER_AND_PORTFOLIOVALUATION_AS_SECRET_KEY";

interface TokenPayload {
  user_id: number;
  investor_id: number;
  email: string;
}

const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, secretKey, {
    expiresIn: "1d",
  });
};

const verifyJWT = (token: string): TokenPayload => {
  return jwt.verify(token, secretKey) as TokenPayload;
};

export { generateToken, verifyJWT };
