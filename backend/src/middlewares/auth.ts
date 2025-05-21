import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../entities/User";

interface JwtPayload {
  userId: number;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key") as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const requireManager = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.MANAGER) {
    return res.status(403).json({ message: "Manager access required" });
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}; 