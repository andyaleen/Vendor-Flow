import { db } from "./db";
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
import { eq, and } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations (JWT Auth)
  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }
  async updateUserProfile(id: string, profileData: any): Promise<User> {
    const numericId = parseInt(id);
    
    // Try to find existing user
    let existingUser = await this.getUserById(numericId);
    
    if (!existingUser) {
      // Create a new user if one doesn't exist
      const newUser: InsertUser = {
        email: profileData.companyEmail || 'test@example.com',
        password: '',
        firstName: null,
        lastName: null,
        companyName: profileData.legalBusinessName || null,
        role: 'company_admin',
        isEmailVerified: false,
        profileImageUrl: null,
      };
      existingUser = await this.createUser(newUser);
    }
    
    // Update user with any relevant profile data
    const updates: Partial<InsertUser> = {
      companyName: profileData.legalBusinessName || existingUser.companyName,
      updatedAt: new Date(),
    };
    
    const updatedUser = await this.updateUser(existingUser.id, updates);
    return updatedUser || existingUser;
  }

  // Partner operations
  async getPartner(id: number): Promise<Partner | undefined> {
    const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
    return result[0];
  }

  async getPartnerByUsername(username: string): Promise<Partner | undefined> {
    const result = await db.select().from(partners).where(eq(partners.username, username)).limit(1);
    return result[0];
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const result = await db.insert(partners).values(partner).returning();
    return result[0];
  }

  async updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
    const result = await db.update(partners).set(partner).where(eq(partners.id, id)).returning();
    return result[0];
  }
  // Onboarding request operations
  async getAllOnboardingRequests(): Promise<OnboardingRequest[]> {
    const result = await db.select().from(onboardingRequests);
    return result;
  }

  async getOnboardingRequest(id: number): Promise<OnboardingRequest | undefined> {
    const result = await db.select().from(onboardingRequests).where(eq(onboardingRequests.id, id)).limit(1);
    return result[0];
  }

  async getOnboardingRequestByToken(token: string): Promise<OnboardingRequest | undefined> {
    const result = await db.select().from(onboardingRequests).where(eq(onboardingRequests.token, token)).limit(1);
    return result[0];
  }

  async createOnboardingRequest(request: InsertOnboardingRequest): Promise<OnboardingRequest> {
    const result = await db.insert(onboardingRequests).values(request).returning();
    return result[0];
  }

  async updateOnboardingRequest(id: number, request: Partial<OnboardingRequest>): Promise<OnboardingRequest | undefined> {
    const result = await db.update(onboardingRequests).set(request).where(eq(onboardingRequests.id, id)).returning();
    return result[0];
  }

  // Document operations
  async getDocumentsByPartner(partnerId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.partnerId, partnerId));
  }

  async getDocumentsByRequest(requestId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.requestId, requestId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const result = await db.insert(documents).values(document).returning();
    return result[0];
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }

  // Consent operations
  async createDocumentConsent(consent: { userId: number; onboardingRequestId: number; documentType: string; consentedAt: Date; }): Promise<void> {
    // This would typically go into a separate consent table
    // For now, we'll just log it
    console.log('Document consent recorded:', consent);
  }

  // Chain sharing operations
  async createSharingChain(chain: InsertDocumentSharingChain): Promise<DocumentSharingChain> {
    const result = await db.insert(documentSharingChains).values(chain).returning();
    return result[0];
  }

  async getSharingChainByToken(token: string): Promise<DocumentSharingChain | undefined> {
    const result = await db.select().from(documentSharingChains).where(eq(documentSharingChains.shareToken, token)).limit(1);
    return result[0];
  }

  async getUserSharingPermissions(userId: number): Promise<UserSharingPermission[]> {
    return await db.select().from(userSharingPermissions).where(eq(userSharingPermissions.granterUserId, userId));
  }

  async updateSharingPermission(id: number, updates: Partial<InsertUserSharingPermission>): Promise<UserSharingPermission | undefined> {
    const result = await db.update(userSharingPermissions).set(updates).where(eq(userSharingPermissions.id, id)).returning();
    return result[0];
  }

  async createSharingPermission(permission: InsertUserSharingPermission): Promise<UserSharingPermission> {
    const result = await db.insert(userSharingPermissions).values(permission).returning();
    return result[0];
  }

  async getDocumentProvenance(documentId: number): Promise<DocumentProvenance | undefined> {
    const result = await db.select().from(documentProvenance).where(eq(documentProvenance.documentId, documentId)).limit(1);
    return result[0];
  }

  async updateDocumentProvenance(id: number, updates: Partial<InsertDocumentProvenance>): Promise<DocumentProvenance | undefined> {
    const result = await db.update(documentProvenance).set(updates).where(eq(documentProvenance.id, id)).returning();
    return result[0];
  }

  async createDocumentProvenance(provenance: InsertDocumentProvenance): Promise<DocumentProvenance> {
    const result = await db.insert(documentProvenance).values(provenance).returning();
    return result[0];
  }

  async getSharingNotifications(userId: number): Promise<SharingNotification[]> {
    return await db.select().from(sharingNotifications).where(eq(sharingNotifications.toUserId, userId));
  }

  async createSharingNotification(notification: InsertSharingNotification): Promise<SharingNotification> {
    const result = await db.insert(sharingNotifications).values(notification).returning();
    return result[0];
  }

  async markNotificationAsRead(id: number): Promise<SharingNotification | undefined> {
    const result = await db.update(sharingNotifications).set({ isRead: true }).where(eq(sharingNotifications.id, id)).returning();
    return result[0];
  }

  async revokeSharingChain(chainId: number): Promise<boolean> {
    const result = await db.update(documentSharingChains).set({ status: "revoked" }).where(eq(documentSharingChains.id, chainId)).returning();
    return result.length > 0;
  }

  async getDocumentChainHistory(documentId: number): Promise<DocumentSharingChain[]> {
    return await db.select().from(documentSharingChains).where(eq(documentSharingChains.documentId, documentId));
  }

  // Legacy getUserProfile method for compatibility
  async getUserProfile(userId: string): Promise<any> {
    // Mock implementation for now
    return {
      businessInfo: {
        legalBusinessName: 'Test Company',
        taxId: '12-3456789',
        businessAddress: '123 Main St',
        phoneNumber: '555-0123',
        companyEmail: 'test@company.com'
      }
    };
  }
}
