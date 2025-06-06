import { createClient } from '@supabase/supabase-js';
import { 
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

import type { IStorage } from "./storage";

export class SupabaseStorage implements IStorage {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Check your .env file.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // User operations
  async getUserById(id: number): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return undefined;
    }
  }
  async updateUserProfile(id: string, profileData: any): Promise<User> {
    const numericId = parseInt(id);
    
    // Handle case where id is not a valid number
    if (isNaN(numericId)) {
      throw new Error('Invalid user ID format - expected numeric ID');
    }
    
    const { data, error } = await this.supabase
      .from('users')
      .update({ business_info: profileData })
      .eq('id', numericId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  async getUserProfile(id: string): Promise<any> {
    const numericId = parseInt(id);
    
    // Handle case where id is not a valid number (like "test-user-id")
    if (isNaN(numericId)) {
      // For test/development purposes, return a mock profile
      return {
        user: null,
        businessInfo: null,
        id,
        error: 'Invalid user ID format - expected numeric ID'
      };
    }
    
    const user = await this.getUserById(numericId);
    return {
      user,
      businessInfo: (user as any)?.business_info || null,
      id
    };
  }

  // Partner operations
  async createPartner(partner: InsertPartner): Promise<Partner> {
    const { data, error } = await this.supabase
      .from('partners')
      .insert(partner)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const { data, error } = await this.supabase
      .from('partners')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async getPartnerByUsername(username: string): Promise<Partner | undefined> {
    const { data, error } = await this.supabase
      .from('partners')
      .select()
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('partners')
        .update(partner)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return undefined;
    }
  }

  // Onboarding request operations
  async createOnboardingRequest(request: InsertOnboardingRequest): Promise<OnboardingRequest> {
    const { data, error } = await this.supabase
      .from('onboarding_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Onboarding request operations
  async getAllOnboardingRequests(): Promise<OnboardingRequest[]> {
    const { data, error } = await this.supabase
      .from('onboarding_requests')
      .select();

    if (error) throw error;
    return data || [];
  }

  async getOnboardingRequest(id: number): Promise<OnboardingRequest | undefined> {
    const { data, error } = await this.supabase
      .from('onboarding_requests')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async getOnboardingRequestByToken(token: string): Promise<OnboardingRequest | undefined> {
    const { data, error } = await this.supabase
      .from('onboarding_requests')
      .select()
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async updateOnboardingRequest(id: number, request: Partial<OnboardingRequest>): Promise<OnboardingRequest | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('onboarding_requests')
        .update(request)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return undefined;
    }
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const { data, error } = await this.supabase
      .from('documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDocumentsByPartner(partnerId: number): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select()
      .eq('partner_id', partnerId);

    if (error) throw error;
    return data || [];
  }

  async getDocumentsByRequest(requestId: number): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select()
      .eq('request_id', requestId);

    if (error) throw error;
    return data || [];
  }

  async deleteDocument(id: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('documents')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      return false;
    }
  }

  async createDocumentConsent(consent: { userId: number; onboardingRequestId: number; documentType: string; consentedAt: Date; }): Promise<void> {
    // For now, just log the consent. In a full implementation, this would create a document_consent table
    console.log(`Document consent recorded: User ${consent.userId} agreed to share ${consent.documentType} for onboarding request ${consent.onboardingRequestId} at ${consent.consentedAt}`);
  }

  // Document sharing chain operations
  async createSharingChain(chain: InsertDocumentSharingChain): Promise<DocumentSharingChain> {
    const { data, error } = await this.supabase
      .from('document_sharing_chains')
      .insert(chain)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSharingChainByToken(token: string): Promise<DocumentSharingChain | undefined> {
    const { data, error } = await this.supabase
      .from('document_sharing_chains')
      .select()
      .eq('share_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async getDocumentChainHistory(documentId: number): Promise<DocumentSharingChain[]> {
    const { data, error } = await this.supabase
      .from('document_sharing_chains')
      .select()
      .eq('document_id', documentId);

    if (error) throw error;
    return data || [];
  }

  async revokeSharingChain(chainId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('document_sharing_chains')
        .update({ status: 'revoked' })
        .eq('id', chainId);

      return !error;
    } catch (error) {
      return false;
    }
  }

  // User sharing permissions
  async getUserSharingPermissions(userId: number): Promise<UserSharingPermission[]> {
    const { data, error } = await this.supabase
      .from('user_sharing_permissions')
      .select()
      .or(`granter_user_id.eq.${userId},grantee_user_id.eq.${userId}`);

    if (error) throw error;
    return data || [];
  }

  async updateSharingPermission(id: number, updates: Partial<InsertUserSharingPermission>): Promise<UserSharingPermission | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('user_sharing_permissions')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return undefined;
    }
  }

  async createSharingPermission(permission: InsertUserSharingPermission): Promise<UserSharingPermission> {
    const { data, error } = await this.supabase
      .from('user_sharing_permissions')
      .insert(permission)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Document provenance
  async createDocumentProvenance(provenance: InsertDocumentProvenance): Promise<DocumentProvenance> {
    const { data, error } = await this.supabase
      .from('document_provenance')
      .insert(provenance)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDocumentProvenance(documentId: number): Promise<DocumentProvenance | undefined> {
    const { data, error } = await this.supabase
      .from('document_provenance')
      .select()
      .eq('document_id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data;
  }

  async updateDocumentProvenance(id: number, updates: Partial<InsertDocumentProvenance>): Promise<DocumentProvenance | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('document_provenance')
        .update({ ...updates, last_shared_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return undefined;
    }
  }

  // Sharing notifications
  async createSharingNotification(notification: InsertSharingNotification): Promise<SharingNotification> {
    const { data, error } = await this.supabase
      .from('sharing_notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSharingNotifications(userId: number): Promise<SharingNotification[]> {
    const { data, error } = await this.supabase
      .from('sharing_notifications')
      .select()
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async markNotificationAsRead(id: number): Promise<SharingNotification | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('sharing_notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return undefined;
    }
  }
}
