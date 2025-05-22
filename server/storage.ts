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

export interface IStorage {
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
  private vendors: Map<number, Vendor>;
  private onboardingRequests: Map<number, OnboardingRequest>;
  private documents: Map<number, Document>;
  private vendorIdCounter: number;
  private requestIdCounter: number;
  private documentIdCounter: number;

  constructor() {
    this.vendors = new Map();
    this.onboardingRequests = new Map();
    this.documents = new Map();
    this.vendorIdCounter = 1;
    this.requestIdCounter = 1;
    this.documentIdCounter = 1;
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
