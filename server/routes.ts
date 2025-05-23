import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, authenticateVendor, optionalAuth } from "./auth";
import { registerUser, loginUser, loginVendor, getCurrentUser, logoutUser } from "./authRoutes";
import { setupGoogleAuth, isAuthenticated } from "./googleAuth";
import { uploadSingle, handleUploadError, getFileInfo, validateDocumentType, deleteUploadedFile } from "./fileUpload";
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
  await setupGoogleAuth(app);

  // JWT Authentication routes
  app.post('/api/auth/register', registerUser);
  app.post('/api/auth/login', loginUser);
  app.post('/api/auth/vendor-login', loginVendor);
  app.post('/api/auth/logout', logoutUser);

  // Auth routes - support both Google OAuth and JWT
  app.get('/api/auth/user', optionalAuth, (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Handle Google OAuth user (direct user object)
      if (req.user && !req.user.claims) {
        return res.json(req.user);
      }
      
      // Handle Replit OAuth user (has claims)
      if (req.user && req.user.claims) {
        return res.json({
          id: req.user.claims.sub,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url
        });
      }

      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile update route
  app.put('/api/user/profile', async (req: any, res) => {
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
  
  // Create onboarding request with secure expiring link
  app.post("/api/onboarding-requests", async (req, res) => {
    try {
      const validatedData = createRequestSchema.parse(req.body);
      
      // Generate cryptographically secure token (64 characters)
      const token = randomBytes(32).toString('hex');
      
      // Set expiration (default 30 days, configurable)
      const expirationDays = req.body.expirationDays || 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);
      
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

  // Get onboarding request by token with expiration check
  app.get("/api/onboarding-requests/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const request = await storage.getOnboardingRequestByToken(token);
      
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      
      // Check if the link has expired
      if (new Date() > request.expiresAt) {
        return res.status(410).json({ 
          error: "Onboarding link has expired",
          expiredAt: request.expiresAt 
        });
      }
      
      // Check if already completed
      if (request.status === 'completed') {
        return res.status(409).json({ 
          error: "Onboarding has already been completed",
          completedAt: request.updatedAt 
        });
      }
      
      // Return the valid request data
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

  // Upload document with enhanced security and validation
  app.post("/api/onboarding-requests/:token/documents", uploadSingle, async (req, res) => {
    try {
      const { token } = req.params;
      const { documentType } = req.body;
      
      // Validate document type
      if (!validateDocumentType(documentType)) {
        return res.status(400).json({ 
          error: "Invalid document type. Allowed types: w9, insurance, banking, license, certificate, other" 
        });
      }
      
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

      if (request.status === 'completed') {
        return res.status(400).json({ error: "Onboarding already completed" });
      }

      if (new Date() > request.expiresAt) {
        return res.status(400).json({ error: "Onboarding request has expired" });
      }
      
      // Get secure file information
      const fileInfo = getFileInfo(req.file);
      
      const document = await storage.createDocument({
        vendorId: request.vendorId,
        requestId: request.id,
        documentType,
        fileName: fileInfo.fileName,
        fileSize: fileInfo.size,
        mimeType: fileInfo.mimeType,
      });
      
      res.json({ 
        success: true, 
        document: {
          ...document,
          originalName: fileInfo.originalName
        }
      });
    } catch (error: any) {
      // Clean up uploaded file if there was an error
      if (req.file) {
        try {
          await deleteUploadedFile(req.file.filename);
        } catch (deleteError) {
          console.error('Error deleting uploaded file:', deleteError);
        }
      }
      res.status(400).json({ error: error.message });
    }
  });

  // Add upload error handling middleware
  app.use("/api/onboarding-requests/:token/documents", handleUploadError);

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
