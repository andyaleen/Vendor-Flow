import { 
  vendors, 
  onboardingRequests, 
  documents,
  type Vendor, 
  type InsertVendor,
  type OnboardingRequest,
  type InsertOnboardingRequest,
  type Document,
  type InsertDocument
} from "@shared/schema";

import { 
  users,
  type User,
  type InsertUser
} from "@shared/schema";

import { randomBytes } from "crypto";

export interface IStorage {
  // User operations (JWT Auth)
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Vendor operations
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByUsername(username: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  
  // Onboarding request operations
  getOnboardingRequest(id: number): Promise<OnboardingRequest | undefined>;
  getOnboardingRequestByToken(token: string): Promise<OnboardingRequest | undefined>;
  createOnboardingRequest(request: InsertOnboardingRequest): Promise<OnboardingRequest>;
  updateOnboardingRequest(id: number, request: Partial<OnboardingRequest>): Promise<OnboardingRequest | undefined>;
  
  // Document operations
  getDocumentsByVendor(vendorId: number): Promise<Document[]>;
  getDocumentsByRequest(requestId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Consent operations
  createDocumentConsent(consent: { userId: number; onboardingRequestId: number; documentType: string; consentedAt: Date; }): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vendors: Map<number, Vendor>;
  private onboardingRequests: Map<number, OnboardingRequest>;
  private documents: Map<number, Document>;
  private userIdCounter: number;
  private vendorIdCounter: number;
  private requestIdCounter: number;
  private documentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.vendors = new Map();
    this.onboardingRequests = new Map();
    this.documents = new Map();
    this.userIdCounter = 1;
    this.vendorIdCounter = 1;
    this.requestIdCounter = 1;
    this.documentIdCounter = 1;
    
    // Add seed onboarding request for testing
    const seedRequest: OnboardingRequest = {
      id: 1,
      token: "def456",
      onboardingTypeName: "Basic Vendor Setup",
      requesterCompany: "Test Company",
      requesterEmail: "test@company.com",
      requestedFields: ["company_info", "contact_info", "w9", "insurance", "banking"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      currentStep: 1,
      status: "pending",
      vendorId: null,
    };
    this.onboardingRequests.set(1, seedRequest);

    // Add the 1099 onboarding type that the dashboard expects
    const seed1099Request: OnboardingRequest = {
      id: 2,
      token: 'test-1099-token-' + Date.now(),
      onboardingTypeName: '1099',
      requesterCompany: 'Test Company',
      requesterEmail: 'user@company.com',
      requestedFields: ['company_info', 'contact_info', 'w9_tax', 'insurance', 'banking'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      currentStep: 1,
      status: 'pending',
      vendorId: null
    };
    this.onboardingRequests.set(2, seed1099Request);
    this.requestIdCounter = 3;
  }

  // User operations for Replit Auth
  // JWT Authentication user methods
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      companyName: userData.companyName || null,
      role: userData.role || "company_admin",
      isEmailVerified: userData.isEmailVerified || false,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Legacy method for backward compatibility
  async upsertUser(userData: any): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...userData,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  async updateUserProfile(id: string, profileData: any): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    // Update user with profile data - in a real app, you'd store this business info
    // For now, we'll just return the existing user
    const updatedUser: User = {
      ...existingUser,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getVendorByUsername(username: string): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(
      (vendor) => vendor.username === username
    );
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.vendorIdCounter++;
    const vendor: Vendor = { 
      ...insertVendor, 
      id,
      dbaName: insertVendor.dbaName || null,
      username: insertVendor.username || null,
      password: insertVendor.password || null,
      arContactName: insertVendor.arContactName || null,
      arContactEmail: insertVendor.arContactEmail || null,
      isActive: true
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor = { ...vendor, ...updates };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async getOnboardingRequest(id: number): Promise<OnboardingRequest | undefined> {
    console.log('Storage: Looking for request ID:', id);
    console.log('Storage: Available request IDs:', Array.from(this.onboardingRequests.keys()));
    const result = this.onboardingRequests.get(id);
    console.log('Storage: Found request:', result ? result.onboardingTypeName : 'NOT FOUND');
    return result;
  }

  async getOnboardingRequestByToken(token: string): Promise<OnboardingRequest | undefined> {
    console.log(`Looking for token: ${token}`);
    console.log(`Available requests:`, Array.from(this.onboardingRequests.values()));
    return Array.from(this.onboardingRequests.values()).find(
      (request) => request.token === token
    );
  }

  async createOnboardingRequest(request: InsertOnboardingRequest): Promise<OnboardingRequest> {
    const id = this.requestIdCounter++;
    const newRequest: OnboardingRequest = {
      id,
      token: request.token,
      onboardingTypeName: request.onboardingTypeName,  // ✅ THIS is the only version that should exist
      requesterCompany: request.requesterCompany,
      requesterEmail: request.requesterEmail,
      requestedFields: request.requestedFields,
      expiresAt: request.expiresAt,
      currentStep: 1,
      status: "pending",
      vendorId: null,
    };
    this.onboardingRequests.set(id, newRequest);
    return newRequest;
  }


  async updateOnboardingRequest(id: number, updates: Partial<OnboardingRequest>): Promise<OnboardingRequest | undefined> {
    const request = this.onboardingRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    this.onboardingRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getDocumentsByVendor(vendorId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.vendorId === vendorId
    );
  }

  async getDocumentsByRequest(requestId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.requestId === requestId
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const document: Document = {
      ...insertDocument,
      id,
      requestId: insertDocument.requestId || null,
      uploadedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async createDocumentConsent(consent: { userId: number; onboardingRequestId: number; documentType: string; consentedAt: Date; }): Promise<void> {
    // For in-memory storage, we log the consent (in a real database, this would insert into document_consent table)
    console.log(`Document consent recorded: User ${consent.userId} agreed to share ${consent.documentType} for onboarding request ${consent.onboardingRequestId} at ${consent.consentedAt}`);
  }
}

export const storage = new MemStorage();
