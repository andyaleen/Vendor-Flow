// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Debug environment variables
console.log('=== API Environment Check ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

// Ensure environment variables are set for both naming conventions
if (process.env.VITE_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}
if (process.env.VITE_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}

import express, { type Request, Response, NextFunction } from "express";

// Import routes with error handling
let registerRoutes: any;
try {
  registerRoutes = require("../server/routes").registerRoutes;
} catch (error) {
  console.error("Failed to load routes:", error);
  // Fallback function if routes can't be loaded
  registerRoutes = (app: any) => {
    app.get('/api/fallback', (req: Request, res: Response) => {
      res.json({ 
        error: "Routes not available", 
        message: "API is running but routes could not be loaded",
        timestamp: new Date().toISOString()
      });
    });
    return Promise.resolve();
  };
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add API root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'VendorVault API is running!',
    status: 'success',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      onboarding: '/api/onboarding-requests',
      user: '/api/user/profile'
    },
    timestamp: new Date().toISOString()
  });
});

let isSetup = false;

export default async function handler(req: any, res: any) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  if (!isSetup) {
    console.log('Setting up routes...');
    try {
      await registerRoutes(app);
      console.log('Routes registered successfully');
    } catch (error) {
      console.error('Failed to register routes:', error);
    }
    
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("API Error:", err);
      res.status(status).json({ 
        error: true,
        message,
        timestamp: new Date().toISOString()
      });
    });

    isSetup = true;
    console.log('API setup completed');
  }

  // Convert Vercel request to Express request
  req.url = req.url || '/';
  req.query = req.query || {};
  
  return app(req, res);
}
