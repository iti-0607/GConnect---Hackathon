import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  // Verify user still exists
  const user = await storage.getUser(decoded.userId);
  if (!user) {
    return res.status(403).json({ message: "User not found" });
  }

  req.user = decoded;
  next();
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const user = await storage.getUser(decoded.userId);
      if (user) {
        req.user = decoded;
      }
    }
  }

  next();
}
