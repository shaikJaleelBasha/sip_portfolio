import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utility/authManager";
import { errorResponse } from "../utility/responseHandler";

interface AuthRequest extends Request {
  user?: any;
}

const authenticateUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      errorResponse(res, 401, "Token missing");
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      errorResponse(res, 401, "Invalid token format");
      return;
    }

    const decoded = verifyJWT(token);
    req.user = decoded;

    next();
  } catch (error: any) {
    errorResponse(res, 401, "Invalid or expired token");
  }
};

export default authenticateUser;
