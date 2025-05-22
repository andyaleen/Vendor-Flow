import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertOnboardingRequestSchema, 
  companyInfoSchema,
  createRequestSchema,
  insertDocumentSchema 
} from "@shared/schema";
import { randomBytes } from "crypto";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile update route
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      // Update user profile with business information
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User setup endpoint for onboarding
  app.post("/api/user/setup", async (req, res) => {
    try {
      const { companyName, firstName, lastName, email, selectedUploads } = req.body;
      
      // For now, just return success
      // In a real app, you'd create the user account here
      res.json({ 
        success: true, 
        message: "User setup completed",
        user: { companyName, firstName, lastName, email, selectedUploads }
      });
    } catch (error) {
      console.error("Error setting up user:", error);
      res.status(500).json({ message: "Failed to set up user" });
    }
  });
  
  // Create onboarding request
  app.post("/api/onboarding-requests", async (req, res) => {
    try {
      const validatedData = createRequestSchema.parse(req.body);
      
      // Generate secure token
      const token = randomBytes(32).toString('hex');
      
      // Set expiration to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const request = await storage.createOnboardingRequest({
        token,
        requesterCompany: validatedData.requesterCompany,
        requesterEmail: validatedData.requesterEmail,
        requestedFields: validatedData.requestedFields,
        expiresAt,
      });
      
      res.json({ 
        success: true, 
        requestId: request.id,
        token: request.token,
        link: `${req.protocol}://${req.get('host')}/onboarding/${request.token}`
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get onboarding request by token
  app.get("/api/onboarding-requests/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const request = await storage.getOnboardingRequestByToken(token);
      
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      
      // Check if expired
      if (new Date() > request.expiresAt) {
        return res.status(410).json({ error: "Onboarding request has expired" });
      }
      
      let vendor = null;
      if (request.vendorId) {
        vendor = await storage.getVendor(request.vendorId);
      }
      
      res.json({ request, vendor });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit company information
  app.post("/api/onboarding-requests/:token/company-info", async (req, res) => {
    try {
      const { token } = req.params;
      const request = await storage.getOnboardingRequestByToken(token);
      
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      
      if (new Date() > request.expiresAt) {
        return res.status(410).json({ error: "Onboarding request has expired" });
      }
      
      const validatedData = companyInfoSchema.parse(req.body);
      
      let vendor;
      if (request.vendorId) {
        // Update existing vendor
        vendor = await storage.updateVendor(request.vendorId, {
          companyName: validatedData.companyName,
          dbaName: validatedData.dbaName || null,
          taxId: validatedData.taxId,
          businessType: validatedData.businessType,
          street: validatedData.street,
          city: validatedData.city,
          state: validatedData.state,
          postalCode: validatedData.postalCode,
          country: validatedData.country,
          primaryContactName: validatedData.primaryContactName,
          primaryContactTitle: validatedData.primaryContactTitle,
          primaryContactEmail: validatedData.primaryContactEmail,
          primaryContactPhone: validatedData.primaryContactPhone,
          arContactName: validatedData.sameAsPRIMARY ? validatedData.primaryContactName : validatedData.arContactName,
          arContactEmail: validatedData.sameAsPRIMARY ? validatedData.primaryContactEmail : validatedData.arContactEmail,
        });
      } else {
        // Create new vendor
        vendor = await storage.createVendor({
          companyName: validatedData.companyName,
          dbaName: validatedData.dbaName || null,
          taxId: validatedData.taxId,
          businessType: validatedData.businessType,
          street: validatedData.street,
          city: validatedData.city,
          state: validatedData.state,
          postalCode: validatedData.postalCode,
          country: validatedData.country,
          primaryContactName: validatedData.primaryContactName,
          primaryContactTitle: validatedData.primaryContactTitle,
          primaryContactEmail: validatedData.primaryContactEmail,
          primaryContactPhone: validatedData.primaryContactPhone,
          arContactName: validatedData.sameAsPRIMARY ? validatedData.primaryContactName : validatedData.arContactName,
          arContactEmail: validatedData.sameAsPRIMARY ? validatedData.primaryContactEmail : validatedData.arContactEmail,
          username: null,
          password: null,
        });
        
        // Link vendor to request
        await storage.updateOnboardingRequest(request.id, { 
          vendorId: vendor.id,
          currentStep: 2 
        });
      }
      
      res.json({ success: true, vendor });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Upload document
  app.post("/api/onboarding-requests/:token/documents", upload.single('document'), async (req, res) => {
    try {
      const { token } = req.params;
      const { documentType } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const request = await storage.getOnboardingRequestByToken(token);
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      
      if (!request.vendorId) {
        return res.status(400).json({ error: "Complete company information first" });
      }
      
      const document = await storage.createDocument({
        vendorId: request.vendorId,
        requestId: request.id,
        documentType,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });
      
      res.json({ success: true, document });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get documents for request
  app.get("/api/onboarding-requests/:token/documents", async (req, res) => {
    try {
      const { token } = req.params;
      const request = await storage.getOnboardingRequestByToken(token);
      
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      
      const documents = await storage.getDocumentsByRequest(request.id);
      res.json({ documents });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDocument(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete onboarding
  app.post("/api/onboarding-requests/:token/complete", async (req, res) => {
    try {
      const { token } = req.params;
      const request = await storage.getOnboardingRequestByToken(token);
      
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      
      await storage.updateOnboardingRequest(request.id, { 
        status: "completed",
        currentStep: 4 
      });
      
      res.json({ success: true, message: "Onboarding completed successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update onboarding step
  app.patch("/api/onboarding-requests/:token/step", async (req, res) => {
    try {
      const { token } = req.params;
      const { step } = req.body;
      
      const request = await storage.getOnboardingRequestByToken(token);
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      
      await storage.updateOnboardingRequest(request.id, { currentStep: step });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
