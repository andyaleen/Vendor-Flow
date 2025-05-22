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
  type UpsertUser
} from "@shared/schema";

export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profileData: any): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vendors: Map<number, Vendor>;
  private onboardingRequests: Map<number, OnboardingRequest>;
  private documents: Map<number, Document>;
  private vendorIdCounter: number;
  private requestIdCounter: number;
  private documentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.vendors = new Map();
    this.onboardingRequests = new Map();
    this.documents = new Map();
    this.vendorIdCounter = 1;
    this.requestIdCounter = 1;
    this.documentIdCounter = 1;
    
    // Add seed onboarding request for testing
    const seedRequest: OnboardingRequest = {
      id: 1,
      token: "def456",
      requesterCompany: "Test Company",
      requesterEmail: "test@company.com",
      requestedFields: ["company_info", "contact_info"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      currentStep: 1,
      status: "pending",
      vendorId: null,
    };
    this.onboardingRequests.set(1, seedRequest);
    this.requestIdCounter = 2;
  }

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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
    return this.onboardingRequests.get(id);
  }

  async getOnboardingRequestByToken(token: string): Promise<OnboardingRequest | undefined> {
    console.log(`Looking for token: ${token}`);
    console.log(`Available requests:`, Array.from(this.onboardingRequests.values()));
    return Array.from(this.onboardingRequests.values()).find(
      (request) => request.token === token
    );
  }

  async createOnboardingRequest(insertRequest: InsertOnboardingRequest): Promise<OnboardingRequest> {
    const id = this.requestIdCounter++;
    const request: OnboardingRequest = {
      ...insertRequest,
      id,
      vendorId: null,
      status: "pending",
      currentStep: 1,
    };
    this.onboardingRequests.set(id, request);
    return request;
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
}

export const storage = new MemStorage();
