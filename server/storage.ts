import { 
  partners, 
  onboardingRequests, 
  documents,
  documentSharingChains,
  userSharingPermissions,
  documentProvenance,
  sharingNotifications,
  users,
  type Partner, 
  type InsertPartner,
  type OnboardingRequest,
  type InsertOnboardingRequest,
  type Document,
  type InsertDocument,
  type DocumentSharingChain,
  type InsertDocumentSharingChain,
  type UserSharingPermission,
  type InsertUserSharingPermission,
  type DocumentProvenance,
  type InsertDocumentProvenance,
  type SharingNotification,
  type InsertSharingNotification,
  type User,
  type InsertUser
} from "@shared/schema";

import { randomBytes } from "crypto";
import { DatabaseStorage } from "./databaseStorage";
import { SupabaseStorage } from "./supabaseStorage";

export interface IStorage {
  // User operations (JWT Auth)
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserProfile(id: string, profileData: any): Promise<User>;
  getUserProfile(userId: string): Promise<any>;
  
  // Partner operations (previously vendor)
  getPartner(id: number): Promise<Partner | undefined>;
  getPartnerByUsername(username: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner | undefined>;
    // Onboarding request operations
  getAllOnboardingRequests(): Promise<OnboardingRequest[]>;
  getOnboardingRequest(id: number): Promise<OnboardingRequest | undefined>;
  getOnboardingRequestByToken(token: string): Promise<OnboardingRequest | undefined>;
  createOnboardingRequest(request: InsertOnboardingRequest): Promise<OnboardingRequest>;
  updateOnboardingRequest(id: number, request: Partial<OnboardingRequest>): Promise<OnboardingRequest | undefined>;
  
  // Document operations
  getDocumentsByPartner(partnerId: number): Promise<Document[]>;
  getDocumentsByRequest(requestId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Consent operations
  createDocumentConsent(consent: { userId: number; onboardingRequestId: number; documentType: string; consentedAt: Date; }): Promise<void>;
  
  // Chain sharing operations
  createSharingChain(chain: InsertDocumentSharingChain): Promise<DocumentSharingChain>;
  getSharingChainByToken(token: string): Promise<DocumentSharingChain | undefined>;  
  getUserSharingPermissions(userId: number): Promise<UserSharingPermission[]>;
  updateSharingPermission(id: number, updates: Partial<InsertUserSharingPermission>): Promise<UserSharingPermission | undefined>;
  createSharingPermission(permission: InsertUserSharingPermission): Promise<UserSharingPermission>;
  getDocumentProvenance(documentId: number): Promise<DocumentProvenance | undefined>;
  updateDocumentProvenance(id: number, updates: Partial<InsertDocumentProvenance>): Promise<DocumentProvenance | undefined>;
  createDocumentProvenance(provenance: InsertDocumentProvenance): Promise<DocumentProvenance>;
  getSharingNotifications(userId: number): Promise<SharingNotification[]>;
  createSharingNotification(notification: InsertSharingNotification): Promise<SharingNotification>;
  markNotificationAsRead(id: number): Promise<SharingNotification | undefined>;
  revokeSharingChain(chainId: number): Promise<boolean>;
  getDocumentChainHistory(documentId: number): Promise<DocumentSharingChain[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private partners: Map<number, Partner>;
  private onboardingRequests: Map<number, OnboardingRequest>;
  private documents: Map<number, Document>;
  private documentSharingChains: Map<number, DocumentSharingChain>;
  private userSharingPermissions: Map<number, UserSharingPermission>;
  private documentProvenance: Map<number, DocumentProvenance>;
  private sharingNotifications: Map<number, SharingNotification>;
  private businessProfiles: Map<string, any>;
  
  private userIdCounter: number;
  private partnerIdCounter: number;
  private requestIdCounter: number;
  private documentIdCounter: number;
  private chainIdCounter: number;
  private permissionIdCounter: number;
  private provenanceIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.partners = new Map();
    this.onboardingRequests = new Map();
    this.documents = new Map();
    this.documentSharingChains = new Map();
    this.userSharingPermissions = new Map();
    this.documentProvenance = new Map();
    this.sharingNotifications = new Map();
    this.businessProfiles = new Map();
    
    this.userIdCounter = 1;
    this.partnerIdCounter = 1;
    this.requestIdCounter = 1;
    this.documentIdCounter = 1;
    this.chainIdCounter = 1;
    this.permissionIdCounter = 1;
    this.provenanceIdCounter = 1;
    this.notificationIdCounter = 1;
    
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
      partnerId: null,
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
      partnerId: null
    };
    this.onboardingRequests.set(2, seed1099Request);
    this.requestIdCounter = 3;
  }

  // User operations for Supabase authentication
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
      companyName: userData.companyName || null,      role: userData.role || "company_admin",
      isEmailVerified: userData.isEmailVerified || false,
      profileImageUrl: userData.profileImageUrl || null,
      isComplete: userData.isComplete || false,
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

  async updateUserProfile(id: string, profileData: any): Promise<User> {
    console.log("updateUserProfile called with:", { id, profileData });
    
    const numericId = parseInt(id);
    
    // Create or update user with the provided ID
    let existingUser = this.users.get(numericId);
    if (!existingUser) {
      console.log("User not found, creating new user with id:", id);      // Create a new user if one doesn't exist
      existingUser = {
        id: numericId,
        email: "",
        password: "",
        firstName: null,
        lastName: null,
        companyName: null,        role: "company_admin",
        isEmailVerified: false,
        profileImageUrl: null,
        isComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    // Store business information separately
    this.businessProfiles.set(id, profileData);
      // Update user record
    const updatedUser: User = {
      ...existingUser,
      id: numericId, // Ensure id is explicitly set
      updatedAt: new Date(),
    };
    
    this.users.set(numericId, updatedUser);
    console.log("Profile updated successfully:", updatedUser);
    return updatedUser;
  }

  async getUserProfile(id: string): Promise<any> {
    const numericId = parseInt(id);
    const user = this.users.get(numericId);
    const businessInfo = this.businessProfiles.get(id);
    
    return {
      user,
      businessInfo,
      id
    };
  }

  // Partner operations (previously vendor)
  async getPartner(id: number): Promise<Partner | undefined> {
    return this.partners.get(id);
  }

  async getPartnerByUsername(username: string): Promise<Partner | undefined> {
    return Array.from(this.partners.values()).find(
      (partner) => partner.username === username
    );
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const id = this.partnerIdCounter++;
    const partner: Partner = { 
      ...insertPartner, 
      id,
      dbaName: insertPartner.dbaName || null,
      username: insertPartner.username || null,
      password: insertPartner.password || null,
      arContactName: insertPartner.arContactName || null,
      arContactEmail: insertPartner.arContactEmail || null,
      isActive: true
    };
    this.partners.set(id, partner);
    return partner;
  }

  async updatePartner(id: number, updates: Partial<InsertPartner>): Promise<Partner | undefined> {
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    
    const updatedPartner = { ...partner, ...updates };
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }

  async getAllOnboardingRequests(): Promise<OnboardingRequest[]> {
    return Array.from(this.onboardingRequests.values());
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
      onboardingTypeName: request.onboardingTypeName,
      requesterCompany: request.requesterCompany || null,
      requesterEmail: request.requesterEmail,
      requestedFields: request.requestedFields,
      expiresAt: request.expiresAt,
      currentStep: 1,
      status: "pending",
      partnerId: null,
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

  async getDocumentsByPartner(partnerId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.partnerId === partnerId
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
  // Chain sharing operations
  async createSharingChain(chain: InsertDocumentSharingChain): Promise<DocumentSharingChain> {
    const id = this.chainIdCounter++;
    const newChain: DocumentSharingChain = {
      id,
      documentId: chain.documentId,
      fromUserId: chain.fromUserId,
      toUserId: chain.toUserId,
      parentChainId: chain.parentChainId || null,
      shareToken: chain.shareToken,
      shareReason: chain.shareReason || null,
      permissions: chain.permissions || null,
      status: chain.status || "active",
      sharedAt: new Date(),
      expiresAt: chain.expiresAt || null,
    };
    this.documentSharingChains.set(id, newChain);
    return newChain;
  }

  async getSharingChainByToken(token: string): Promise<DocumentSharingChain | undefined> {
    return Array.from(this.documentSharingChains.values()).find(
      (chain) => chain.shareToken === token
    );
  }

  async getUserSharingPermissions(userId: number): Promise<UserSharingPermission[]> {
    return Array.from(this.userSharingPermissions.values()).filter(
      (permission) => permission.granterUserId === userId || permission.granteeUserId === userId
    );
  }

  async updateSharingPermission(id: number, updates: Partial<InsertUserSharingPermission>): Promise<UserSharingPermission | undefined> {
    const permission = this.userSharingPermissions.get(id);
    if (!permission) return undefined;
    
    const updatedPermission = { 
      ...permission, 
      ...updates, 
      status: updates.status || permission.status,
      updatedAt: new Date() 
    };
    this.userSharingPermissions.set(id, updatedPermission);
    return updatedPermission;
  }
  async createSharingPermission(permission: InsertUserSharingPermission): Promise<UserSharingPermission> {
    const id = this.permissionIdCounter++;
    const newPermission: UserSharingPermission = {
      id,
      granterUserId: permission.granterUserId,
      granteeUserId: permission.granteeUserId,
      documentTypes: permission.documentTypes,
      canRelay: permission.canRelay ?? null,
      canViewHistory: permission.canViewHistory ?? null,
      maxChainDepth: permission.maxChainDepth ?? null,
      status: permission.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userSharingPermissions.set(id, newPermission);
    return newPermission;
  }

  async getDocumentProvenance(documentId: number): Promise<DocumentProvenance | undefined> {
    return Array.from(this.documentProvenance.values()).find(
      (provenance) => provenance.documentId === documentId
    );
  }

  async updateDocumentProvenance(id: number, updates: Partial<InsertDocumentProvenance>): Promise<DocumentProvenance | undefined> {
    const provenance = this.documentProvenance.get(id);
    if (!provenance) return undefined;
    
    const updatedProvenance = { 
      ...provenance, 
      ...updates, 
      lastSharedAt: new Date() 
    };
    this.documentProvenance.set(id, updatedProvenance);
    return updatedProvenance;
  }

  async createDocumentProvenance(provenance: InsertDocumentProvenance): Promise<DocumentProvenance> {
    const id = this.provenanceIdCounter++;
    const newProvenance: DocumentProvenance = {
      ...provenance,
      id,
      chainDepth: provenance.chainDepth || 0,
      totalShares: provenance.totalShares || 0,
      isOriginal: provenance.isOriginal || true,
      lastSharedAt: new Date(),
    };
    this.documentProvenance.set(id, newProvenance);
    return newProvenance;
  }

  async getSharingNotifications(userId: number): Promise<SharingNotification[]> {
    return Array.from(this.sharingNotifications.values()).filter(
      (notification) => notification.toUserId === userId
    );
  }

  async createSharingNotification(notification: InsertSharingNotification): Promise<SharingNotification> {
    const id = this.notificationIdCounter++;
    const newNotification: SharingNotification = {
      ...notification,
      id,
      documentId: notification.documentId || null,
      chainId: notification.chainId || null,
      metadata: notification.metadata || null,
      isRead: notification.isRead || false,
      createdAt: new Date(),
    };
    this.sharingNotifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<SharingNotification | undefined> {
    const notification = this.sharingNotifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { 
      ...notification, 
      isRead: true 
    };
    this.sharingNotifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async revokeSharingChain(chainId: number): Promise<boolean> {
    const chain = this.documentSharingChains.get(chainId);
    if (!chain) return false;
    
    const updatedChain = { 
      ...chain, 
      status: "revoked" as const 
    };
    this.documentSharingChains.set(chainId, updatedChain);
    return true;
  }

  async getDocumentChainHistory(documentId: number): Promise<DocumentSharingChain[]> {
    return Array.from(this.documentSharingChains.values()).filter(
      (chain) => chain.documentId === documentId
    );
  }
}

// Export the appropriate storage implementation
// Use database storage if DATABASE_URL is configured, Supabase storage if Supabase is configured, otherwise use in-memory storage
console.log('Storage selection debug:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? new SupabaseStorage()
    : new MemStorage();

console.log('Selected storage type:', storage.constructor.name);
