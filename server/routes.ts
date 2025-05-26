import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
  // Authentication now handled entirely by Supabase client-side

  // Get user profile with completion status
  app.get('/api/user/profile', async (req: any, res) => {
    try {
      const dummyUserId = "test-user-id";
      const userProfile = await storage.getUserProfile(dummyUserId);
      
      // Check if profile is complete
      const isComplete = !!(
        userProfile?.businessInfo?.legalBusinessName &&
        userProfile?.businessInfo?.taxId &&
        userProfile?.businessInfo?.businessAddress &&
        userProfile?.businessInfo?.phoneNumber &&
        userProfile?.businessInfo?.companyEmail
      );
      
      res.json({
        ...userProfile,
        isComplete
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Profile update route
  app.put('/api/user/profile', async (req: any, res) => {
    try {
      console.log("=== PROFILE UPDATE DEBUG ===");
      console.log("req.user:", req.user);
      console.log("req.session:", req.session);
      console.log("req.isAuthenticated():", req.isAuthenticated ? req.isAuthenticated() : 'no method');
      console.log("Headers:", req.headers);
      console.log("Body:", req.body);
      
      // For now, let's create a dummy user to test the storage
      const dummyUserId = "test-user-id";
      const profileData = req.body;
      
      console.log("Using dummy user ID for testing:", dummyUserId);
      console.log("Profile data:", profileData);
      
      // Update user profile with business information
      const updatedUser = await storage.updateUserProfile(dummyUserId, profileData);
      res.json({ success: true, user: updatedUser, debug: "Using dummy user for testing" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ 
        message: "Failed to update profile", 
        error: error.message,
        stack: error.stack 
      });
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
        onboardingTypeName: validatedData.onboardingTypeName,
        requesterCompany: (req.user as any)?.companyName || (req.user as any)?.firstName + " " + (req.user as any)?.lastName || "Your Company",
        requesterEmail: (req.user as any)?.email || "user@company.com",
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

  // Get onboarding type by ID (for editing)
  app.get("/api/onboarding-types/:id", async (req, res) => {
    try {
      console.log('=== API ROUTE HIT: /api/onboarding-types/:id ===');
      const { id } = req.params;
      console.log('Fetching onboarding type for ID:', id);
      
      const request = await storage.getOnboardingRequest(parseInt(id));
      
      if (!request) {
        console.log('No onboarding type found for ID:', id);
        return res.status(404).json({ error: "Onboarding type not found" });
      }
      
      // Format the response to match what the edit page expects
      const onboardingType = {
        id: request.id,
        title: request.onboardingTypeName,
        onboardingTypeName: request.onboardingTypeName,
        description: `${request.requestedFields.length} fields, ${request.status}`,
        fields: request.requestedFields,
        requesterCompany: request.requesterCompany,
        requesterEmail: request.requesterEmail,
        status: request.status,
        expiresAt: request.expiresAt,
        link: `${req.protocol}://${req.get('host')}/onboarding/${request.token}`
      };
      
      console.log('Sending onboarding type response:', { 
        title: onboardingType.title,
        id: onboardingType.id 
      });
      
      res.json(onboardingType);
    } catch (error: any) {
      console.log('Error fetching onboarding type:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get onboarding request by ID (for editing) - MUST come before token route
  app.get("/api/onboarding-requests/id/:id", async (req, res) => {
    try {
      console.log('=== API ROUTE HIT: /api/onboarding-requests/id/:id ===');
      const { id } = req.params;
      console.log('Fetching onboarding request for ID:', id);
      
      // Set proper headers
      res.setHeader('Content-Type', 'application/json');
      
      const request = await storage.getOnboardingRequest(parseInt(id));
      
      if (!request) {
        console.log('No request found for ID:', id);
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      
      let vendor = null;
      if (request.vendorId) {
        vendor = await storage.getVendor(request.vendorId);
      }
      
      const responseData = { 
        request: {
          ...request,
          title: request.onboardingTypeName // Add title field for easier access
        }, 
        vendor 
      };
      
      console.log('Sending response for ID:', id, { 
        title: request.onboardingTypeName,
        id: request.id 
      });
      
      return res.status(200).json(responseData);
    } catch (error: any) {
      console.log('Error fetching request:', error);
      res.status(500).json({ error: error.message });
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

  // Get user's existing documents profile
  app.get("/api/user/documents", async (req, res) => {
    try {
      // For demo: simulate user has some documents
      const documentProfile = {
        w9: true,  // User has W-9 on file
        insurance: true,  // User has insurance on file
        banking: false,   // User needs to upload banking
      };

      res.json({ documents: documentProfile });
    } catch (error) {
      console.error("Error fetching user documents:", error);
      res.status(500).json({ error: "Failed to fetch user documents" });
    }
  });

  // Store user consent to share documents
  app.post("/api/document-consent", async (req, res) => {
    try {
      const { user_id, onboarding_request_id, document_type, consented_at } = req.body;

      // Insert consent record into database
      await storage.createDocumentConsent({
        userId: user_id,
        onboardingRequestId: onboarding_request_id,
        documentType: document_type,
        consentedAt: new Date(consented_at),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error recording consent:", error);
      res.status(500).json({ error: "Failed to record consent" });
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

  // Get all onboarding requests for dashboard  
  app.get("/api/onboarding-requests", async (req: any, res) => {
    try {
      // Get all onboarding requests from storage and format them for the dashboard
      const allRequests = Array.from((storage as any).onboardingRequests.values());
      const requests = allRequests.map((request: any) => ({
        id: request.id,
        title: request.onboardingTypeName || request.requesterCompany,
        onboardingTypeName: request.onboardingTypeName || request.requesterCompany,
        description: `${request.requestedFields.length} fields, ${request.status}`,
        fields: request.requestedFields,
        createdAt: request.createdAt,
        link: `${req.protocol}://${req.get('host')}/onboarding/${request.token}`,
        status: request.status
      }));
      
      res.json(requests);
    } catch (error: any) {
      console.error("Error fetching onboarding requests:", error);
      res.status(500).json({ error: "Failed to fetch onboarding requests" });
    }
  });

  // One-click vendor information sharing
  app.post("/api/vendors/share", async (req: any, res) => {
    try {
      const { onboardingToken, shareDocuments = true } = req.body;
      const vendorId = req.vendor.id;

      // Validate onboarding request exists and is active
      const onboardingRequest = await storage.getOnboardingRequestByToken(onboardingToken);
      if (!onboardingRequest) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }

      // Check if request is expired
      if (new Date() > onboardingRequest.expiresAt) {
        return res.status(410).json({ error: "Onboarding request has expired" });
      }

      // Check if already completed
      if (onboardingRequest.status === 'completed') {
        return res.status(409).json({ error: "Onboarding already completed" });
      }

      // Get vendor information
      const vendor = await storage.getVendor(vendorId);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      // Get vendor documents if sharing is enabled
      let documents = [];
      if (shareDocuments) {
        documents = await storage.getDocumentsByVendor(vendorId);
      }

      // Link vendor to the onboarding request and mark as completed
      await storage.updateOnboardingRequest(onboardingRequest.id, {
        vendorId: vendorId,
        status: 'completed',
        currentStep: 4
      });

      res.json({
        success: true,
        message: `Information successfully shared with ${onboardingRequest.requesterCompany}`,
        sharedData: {
          companyInfo: {
            companyName: vendor.companyName,
            dbaName: vendor.dbaName,
            taxId: vendor.taxId,
            businessType: vendor.businessType,
            address: vendor.address,
            primaryContact: vendor.primaryContact,
            arContact: vendor.arContact
          },
          documentsShared: shareDocuments ? documents.map(doc => ({
            id: doc.id,
            documentType: doc.documentType,
            fileName: doc.fileName,
            uploadedAt: doc.uploadedAt,
            status: doc.status
          })) : [],
          recipient: onboardingRequest.requesterCompany,
          sharedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error("Error sharing vendor information:", error);
      res.status(500).json({ error: "Failed to share vendor information" });
    }
  });

  // Get vendor's sharing history
  app.get("/api/vendors/sharing-history", async (req: any, res) => {
    try {
      const vendorId = req.vendor.id;
      
      // For now, return empty array - can be enhanced with dedicated storage
      const sharingHistory = [];

      res.json({
        success: true,
        sharingHistory
      });
    } catch (error: any) {
      console.error("Error fetching sharing history:", error);
      res.status(500).json({ error: "Failed to fetch sharing history" });
    }
  });

  // Validate onboarding request for sharing
  app.get("/api/vendors/validate-share/:token", async (req: any, res) => {
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

      // Check if already completed
      if (request.status === 'completed') {
        return res.status(409).json({ error: "Onboarding already completed" });
      }

      // Get vendor information to show what will be shared
      const vendor = await storage.getVendor(req.vendor.id);
      const documents = await storage.getDocumentsByVendor(req.vendor.id);

      res.json({
        success: true,
        request: {
          id: request.id,
          requesterCompany: request.requesterCompany,
          requesterEmail: request.requesterEmail,
          requestedFields: request.requestedFields,
          expiresAt: request.expiresAt
        },
        vendorInfo: {
          companyName: vendor?.companyName,
          documentsAvailable: documents.length,
          documentTypes: documents.map(doc => doc.documentType)
        }
      });
    } catch (error: any) {
      console.error("Error validating share request:", error);
      res.status(500).json({ error: "Failed to validate sharing request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
