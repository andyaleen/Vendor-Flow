import { Request, Response } from 'express';
import { hashPassword, comparePassword, generateToken, type AuthRequest } from './auth';
import { storage } from './storage';
import { loginSchema, registerSchema, vendorAuthSchema, type LoginFormData, type RegisterFormData, type VendorAuthFormData } from '@shared/schema';

export async function registerUser(req: Request, res: Response) {
  try {
    const validatedData = registerSchema.parse(req.body) as RegisterFormData;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await storage.createUser({
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      companyName: validatedData.companyName,
      role: 'company_admin'
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      type: 'user'
    });

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body) as LoginFormData;
    
    // Find user by email
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      type: 'user'
    });

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(400).json({ message: error.message || 'Login failed' });
  }
}

export async function loginVendor(req: Request, res: Response) {
  try {
    const validatedData = vendorAuthSchema.parse(req.body) as VendorAuthFormData;
    
    // Find vendor by username
    const vendor = await storage.getVendorByUsername(validatedData.username);
    if (!vendor || !vendor.password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await comparePassword(validatedData.password, vendor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = generateToken({
      id: vendor.id,
      email: vendor.primaryContactEmail,
      role: 'vendor',
      type: 'vendor'
    });

    // Return vendor data without password
    const { password, ...vendorWithoutPassword } = vendor;
    
    res.json({
      message: 'Vendor login successful',
      vendor: vendorWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Vendor login error:', error);
    res.status(400).json({ message: error.message || 'Vendor login failed' });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (req.user) {
      const { password, ...userWithoutPassword } = req.user;
      res.json({ user: userWithoutPassword });
    } else if (req.vendor) {
      const { password, ...vendorWithoutPassword } = req.vendor;
      res.json({ vendor: vendorWithoutPassword });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user information' });
  }
}

export async function logoutUser(req: Request, res: Response) {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
}