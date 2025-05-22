import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { users, vendors, type User, type Vendor } from '@shared/schema';
import { storage } from './storage';

// JWT Secret - In production, this should be a secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthRequest extends Request {
  user?: User;
  vendor?: Vendor;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  type: 'user' | 'vendor';
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT Authentication middleware for company users
export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'user') {
      return res.status(403).json({ message: 'Invalid token type' });
    }

    const user = await storage.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// JWT Authentication middleware for vendors
export async function authenticateVendor(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'vendor') {
      return res.status(403).json({ message: 'Invalid token type' });
    }

    const vendor = await storage.getVendor(decoded.id);
    if (!vendor) {
      return res.status(401).json({ message: 'Vendor not found' });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      
      if (decoded.type === 'user') {
        const user = await storage.getUserById(decoded.id);
        if (user) req.user = user;
      } else if (decoded.type === 'vendor') {
        const vendor = await storage.getVendor(decoded.id);
        if (vendor) req.vendor = vendor;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}