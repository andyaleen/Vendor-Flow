var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/index.ts
import dotenv from "dotenv";
import express from "express";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chainAccessRequestSchema: () => chainAccessRequestSchema,
  companyInfoSchema: () => companyInfoSchema,
  createRequestSchema: () => createRequestSchema,
  documentProvenance: () => documentProvenance,
  documentSharingChains: () => documentSharingChains,
  documents: () => documents,
  insertDocumentProvenanceSchema: () => insertDocumentProvenanceSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertDocumentSharingChainSchema: () => insertDocumentSharingChainSchema,
  insertOnboardingRequestSchema: () => insertOnboardingRequestSchema,
  insertPartnerSchema: () => insertPartnerSchema,
  insertSharingNotificationSchema: () => insertSharingNotificationSchema,
  insertUserSharingPermissionSchema: () => insertUserSharingPermissionSchema,
  loginSchema: () => loginSchema,
  onboardingConsent: () => onboardingConsent,
  onboardingRequests: () => onboardingRequests,
  partners: () => partners,
  registerSchema: () => registerSchema,
  sessions: () => sessions,
  shareDocumentSchema: () => shareDocumentSchema,
  sharingNotifications: () => sharingNotifications,
  updateSharingPermissionSchema: () => updateSharingPermissionSchema,
  userOnboardingSchema: () => userOnboardingSchema,
  userSharingPermissions: () => userSharingPermissions,
  users: () => users,
  vendorAuthSchema: () => vendorAuthSchema
});
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  varchar,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  dbaName: text("dba_name"),
  taxId: text("tax_id").notNull(),
  businessType: text("business_type").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  primaryContactName: text("primary_contact_name").notNull(),
  primaryContactTitle: text("primary_contact_title").notNull(),
  primaryContactEmail: text("primary_contact_email").notNull(),
  primaryContactPhone: text("primary_contact_phone").notNull(),
  arContactName: text("ar_contact_name"),
  arContactEmail: text("ar_contact_email"),
  username: text("username").unique(),
  password: text("password"),
  isActive: boolean("is_active").default(true)
});
var onboardingRequests = pgTable("onboarding_requests", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  onboardingTypeName: text("onboarding_type_name").notNull(),
  requesterCompany: text("requester_company"),
  requesterEmail: text("requester_email").notNull(),
  requestedFields: text("requested_fields").array().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  partnerId: integer("partner_id").references(() => partners.id),
  status: text("status").notNull().default("pending"),
  // pending, completed, expired
  currentStep: integer("current_step").default(1)
});
var documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  requestId: integer("request_id").references(() => onboardingRequests.id),
  documentType: text("document_type").notNull(),
  // w9, insurance, banking
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});
var onboardingConsent = pgTable("onboarding_consent", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => partners.id).notNull(),
  requestId: integer("request_id").references(() => onboardingRequests.id).notNull(),
  documentType: text("document_type").notNull(),
  sharedAt: timestamp("shared_at").defaultNow()
});
var documentSharingChains = pgTable("document_sharing_chains", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  parentChainId: integer("parent_chain_id"),
  // Self-referencing, will add foreign key constraint separately
  shareToken: text("share_token").unique().notNull(),
  shareReason: text("share_reason"),
  permissions: jsonb("permissions").notNull().default('{"canRelay": true, "canView": true, "canDownload": true}'),
  expiresAt: timestamp("expires_at"),
  sharedAt: timestamp("shared_at").defaultNow(),
  status: text("status").notNull().default("active")
  // active, revoked, expired
});
var userSharingPermissions = pgTable("user_sharing_permissions", {
  id: serial("id").primaryKey(),
  granterUserId: integer("granter_user_id").references(() => users.id).notNull(),
  granteeUserId: integer("grantee_user_id").references(() => users.id).notNull(),
  documentTypes: text("document_types").array().notNull(),
  // ['w9', 'insurance', 'banking', 'all']
  canRelay: boolean("can_relay").default(true),
  canViewHistory: boolean("can_view_history").default(false),
  maxChainDepth: integer("max_chain_depth").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  status: text("status").notNull().default("active")
  // active, revoked
});
var documentProvenance = pgTable("document_provenance", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  originalOwnerId: integer("original_owner_id").references(() => users.id).notNull(),
  currentHolderId: integer("current_holder_id").references(() => users.id).notNull(),
  chainDepth: integer("chain_depth").notNull().default(0),
  accessPath: jsonb("access_path").notNull(),
  // Array of user IDs showing the sharing path
  lastSharedAt: timestamp("last_shared_at").defaultNow(),
  totalShares: integer("total_shares").default(0),
  isOriginal: boolean("is_original").default(true)
});
var sharingNotifications = pgTable("sharing_notifications", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  documentId: integer("document_id").references(() => documents.id),
  chainId: integer("chain_id").references(() => documentSharingChains.id),
  notificationType: text("notification_type").notNull(),
  // 'share_request', 'share_accepted', 'share_rejected', 'chain_complete'
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  isActive: true
});
var insertOnboardingRequestSchema = createInsertSchema(onboardingRequests).omit({
  id: true,
  partnerId: true,
  status: true,
  currentStep: true
});
var insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true
});
var insertDocumentSharingChainSchema = createInsertSchema(documentSharingChains).omit({
  id: true,
  sharedAt: true
});
var insertUserSharingPermissionSchema = createInsertSchema(userSharingPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDocumentProvenanceSchema = createInsertSchema(documentProvenance).omit({
  id: true,
  lastSharedAt: true
});
var insertSharingNotificationSchema = createInsertSchema(sharingNotifications).omit({
  id: true,
  createdAt: true
});
var companyInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  dbaName: z.string().optional(),
  taxId: z.string().min(1, "Tax ID is required"),
  businessType: z.string().min(1, "Business type is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  primaryContactName: z.string().min(1, "Contact name is required"),
  primaryContactTitle: z.string().min(1, "Contact title is required"),
  primaryContactEmail: z.string().email("Valid email is required"),
  primaryContactPhone: z.string().min(1, "Phone number is required"),
  arContactName: z.string().optional(),
  arContactEmail: z.string().email().optional().or(z.literal("")),
  sameAsPrimary: z.boolean().optional()
});
var createRequestSchema = z.object({
  onboardingTypeName: z.string().min(1, "Onboarding type name is required"),
  requestedFields: z.array(z.string()).min(1, "At least one field is required")
});
var loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().min(1, "Company name is required")
});
var userOnboardingSchema = z.object({
  email: z.string().email("Valid email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required")
});
var vendorAuthSchema = z.object({
  username: z.string().min(1, "Username is required").optional(),
  email: z.string().email("Please enter a valid email").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional()
}).refine((data) => data.username || data.email, {
  message: "Either username or email is required",
  path: ["username"]
});
var shareDocumentSchema = z.object({
  documentId: z.number().int().positive("Document ID is required"),
  toUserId: z.number().int().positive("Recipient user ID is required"),
  shareReason: z.string().optional(),
  permissions: z.object({
    canRelay: z.boolean().default(true),
    canView: z.boolean().default(true),
    canDownload: z.boolean().default(true)
  }).default({}),
  expiresAt: z.string().datetime().optional()
});
var updateSharingPermissionSchema = z.object({
  granteeUserId: z.number().int().positive("Grantee user ID is required"),
  documentTypes: z.array(z.string()).min(1, "At least one document type is required"),
  canRelay: z.boolean().default(true),
  canViewHistory: z.boolean().default(false),
  maxChainDepth: z.number().int().min(1).max(10).default(3)
});
var chainAccessRequestSchema = z.object({
  shareToken: z.string().min(1, "Share token is required"),
  requestReason: z.string().optional()
});
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  companyName: varchar("company_name"),
  role: varchar("role").default("company_admin").notNull(),
  // 'company_admin', 'vendor'
  isEmailVerified: boolean("is_email_verified").default(false),
  profileImageUrl: varchar("profile_image_url"),
  isComplete: boolean("is_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// server/db.ts
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var databaseUrl = process.env.DATABASE_URL;
console.log("\u{1F527} Database Configuration:");
console.log("Supabase URL:", supabaseUrl ? "\u2705 SET" : "\u274C NOT SET");
console.log("Service Role Key:", supabaseServiceKey ? "\u2705 SET" : "\u274C NOT SET");
console.log("Database URL:", databaseUrl ? "\u2705 SET" : "\u274C NOT SET");
var db = null;
if (databaseUrl) {
  try {
    const queryClient = postgres(databaseUrl);
    db = drizzle(queryClient, { schema: schema_exports });
    console.log("\u2705 PostgreSQL connection established");
  } catch (error) {
    console.error("\u274C Failed to create PostgreSQL connection:", error);
  }
} else {
  console.warn("\u26A0\uFE0F DATABASE_URL not set. Database operations will be limited.");
}
var supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("\u2705 Supabase client initialized");
  } catch (error) {
    console.error("\u274C Failed to create Supabase client:", error);
  }
} else {
  console.warn("\u26A0\uFE0F Supabase configuration incomplete. Authentication features may not work.");
}

// server/databaseStorage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  checkDatabase() {
    if (!db) {
      throw new Error("Database connection not available. Please check your DATABASE_URL environment variable.");
    }
  }
  // User operations (JWT Auth)
  async getUserById(id) {
    this.checkDatabase();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    this.checkDatabase();
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async createUser(user) {
    this.checkDatabase();
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  async updateUser(id, updates) {
    this.checkDatabase();
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }
  async updateUserProfile(id, profileData) {
    const numericId = parseInt(id);
    let existingUser = await this.getUserById(numericId);
    if (!existingUser) {
      const newUser = {
        email: profileData.companyEmail || "test@example.com",
        password: "",
        firstName: null,
        lastName: null,
        companyName: profileData.legalBusinessName || null,
        role: "company_admin",
        isEmailVerified: false,
        profileImageUrl: null
      };
      existingUser = await this.createUser(newUser);
    }
    const updates = {
      companyName: profileData.legalBusinessName || existingUser.companyName,
      updatedAt: /* @__PURE__ */ new Date()
    };
    const updatedUser = await this.updateUser(existingUser.id, updates);
    return updatedUser || existingUser;
  }
  // Partner operations
  async getPartner(id) {
    this.checkDatabase();
    const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
    return result[0];
  }
  async getPartnerByUsername(username) {
    this.checkDatabase();
    const result = await db.select().from(partners).where(eq(partners.username, username)).limit(1);
    return result[0];
  }
  async createPartner(partner) {
    this.checkDatabase();
    const result = await db.insert(partners).values(partner).returning();
    return result[0];
  }
  async updatePartner(id, partner) {
    this.checkDatabase();
    const result = await db.update(partners).set(partner).where(eq(partners.id, id)).returning();
    return result[0];
  }
  // Onboarding request operations
  async getAllOnboardingRequests() {
    const result = await db.select().from(onboardingRequests);
    return result;
  }
  async getOnboardingRequest(id) {
    const result = await db.select().from(onboardingRequests).where(eq(onboardingRequests.id, id)).limit(1);
    return result[0];
  }
  async getOnboardingRequestByToken(token) {
    const result = await db.select().from(onboardingRequests).where(eq(onboardingRequests.token, token)).limit(1);
    return result[0];
  }
  async createOnboardingRequest(request) {
    const result = await db.insert(onboardingRequests).values(request).returning();
    return result[0];
  }
  async updateOnboardingRequest(id, request) {
    const result = await db.update(onboardingRequests).set(request).where(eq(onboardingRequests.id, id)).returning();
    return result[0];
  }
  // Document operations
  async getDocumentsByPartner(partnerId) {
    return await db.select().from(documents).where(eq(documents.partnerId, partnerId));
  }
  async getDocumentsByRequest(requestId) {
    return await db.select().from(documents).where(eq(documents.requestId, requestId));
  }
  async createDocument(document) {
    const result = await db.insert(documents).values(document).returning();
    return result[0];
  }
  async deleteDocument(id) {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }
  // Consent operations
  async createDocumentConsent(consent) {
    console.log("Document consent recorded:", consent);
  }
  // Chain sharing operations
  async createSharingChain(chain) {
    const result = await db.insert(documentSharingChains).values(chain).returning();
    return result[0];
  }
  async getSharingChainByToken(token) {
    const result = await db.select().from(documentSharingChains).where(eq(documentSharingChains.shareToken, token)).limit(1);
    return result[0];
  }
  async getUserSharingPermissions(userId) {
    return await db.select().from(userSharingPermissions).where(eq(userSharingPermissions.granterUserId, userId));
  }
  async updateSharingPermission(id, updates) {
    const result = await db.update(userSharingPermissions).set(updates).where(eq(userSharingPermissions.id, id)).returning();
    return result[0];
  }
  async createSharingPermission(permission) {
    const result = await db.insert(userSharingPermissions).values(permission).returning();
    return result[0];
  }
  async getDocumentProvenance(documentId) {
    const result = await db.select().from(documentProvenance).where(eq(documentProvenance.documentId, documentId)).limit(1);
    return result[0];
  }
  async updateDocumentProvenance(id, updates) {
    const result = await db.update(documentProvenance).set(updates).where(eq(documentProvenance.id, id)).returning();
    return result[0];
  }
  async createDocumentProvenance(provenance) {
    const result = await db.insert(documentProvenance).values(provenance).returning();
    return result[0];
  }
  async getSharingNotifications(userId) {
    return await db.select().from(sharingNotifications).where(eq(sharingNotifications.toUserId, userId));
  }
  async createSharingNotification(notification) {
    const result = await db.insert(sharingNotifications).values(notification).returning();
    return result[0];
  }
  async markNotificationAsRead(id) {
    const result = await db.update(sharingNotifications).set({ isRead: true }).where(eq(sharingNotifications.id, id)).returning();
    return result[0];
  }
  async revokeSharingChain(chainId) {
    const result = await db.update(documentSharingChains).set({ status: "revoked" }).where(eq(documentSharingChains.id, chainId)).returning();
    return result.length > 0;
  }
  async getDocumentChainHistory(documentId) {
    return await db.select().from(documentSharingChains).where(eq(documentSharingChains.documentId, documentId));
  }
  // Legacy getUserProfile method for compatibility
  async getUserProfile(userId) {
    return {
      businessInfo: {
        legalBusinessName: "Test Company",
        taxId: "12-3456789",
        businessAddress: "123 Main St",
        phoneNumber: "555-0123",
        companyEmail: "test@company.com"
      }
    };
  }
};

// server/supabaseStorage.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
var SupabaseStorage = class {
  supabase;
  constructor() {
    const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl2 || !supabaseKey) {
      throw new Error("Missing Supabase configuration. Check your .env file.");
    }
    this.supabase = createClient2(supabaseUrl2, supabaseKey);
  }
  // User operations
  async getUserById(id) {
    const { data, error } = await this.supabase.from("users").select().eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return void 0;
      throw error;
    }
    return data;
  }
  async getUserByEmail(email) {
    const { data, error } = await this.supabase.from("users").select().eq("email", email).single();
    if (error) {
      if (error.code === "PGRST116") return void 0;
      throw error;
    }
    return data;
  }
  async createUser(user) {
    const { data, error } = await this.supabase.from("users").insert(user).select().single();
    if (error) throw error;
    return data;
  }
  async updateUser(id, updates) {
    try {
      const { data, error } = await this.supabase.from("users").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      return void 0;
    }
  }
  async updateUserProfile(id, profileData) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error("Invalid user ID format - expected numeric ID");
    }
    const { data, error } = await this.supabase.from("users").update({ business_info: profileData }).eq("id", numericId).select().single();
    if (error) throw error;
    return data;
  }
  async getUserProfile(id) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return {
        user: null,
        businessInfo: null,
        id,
        error: "Invalid user ID format - expected numeric ID"
      };
    }
    const user = await this.getUserById(numericId);
    return {
      user,
      businessInfo: user?.business_info || null,
      id
    };
  }
  // Partner operations
  async createPartner(partner) {
    const { data, error } = await this.supabase.from("partners").insert(partner).select().single();
    if (error) throw error;
    return data;
  }
  async getPartner(id) {
    const { data, error } = await this.supabase.from("partners").select().eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return void 0;
      throw error;
    }
    return data;
  }
  async getPartnerByUsername(username) {
    const { data, error } = await this.supabase.from("partners").select().eq("username", username).single();
    if (error) {
      if (error.code === "PGRST116") return void 0;
      throw error;
    }
    return data;
  }
  async updatePartner(id, partner) {
    try {
      const { data, error } = await this.supabase.from("partners").update(partner).eq("id", id).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      return void 0;
    }
  }
  // Onboarding request operations
  async createOnboardingRequest(request) {
    const { data, error } = await this.supabase.from("onboarding_requests").insert(request).select().single();
    if (error) throw error;
    return data;
  }
  // Onboarding request operations
  async getAllOnboardingRequests() {
    const { data, error } = await this.supabase.from("onboarding_requests").select();
    if (error) throw error;
    return data || [];
  }
  async getOnboardingRequest(id) {
    const { data, error } = await this.supabase.from("onboarding_requests").select().eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return void 0;
      throw error;
    }
    return data;
  }
  async getOnboardingRequestByToken(token) {
    const { data, error } = await this.supabase.from("onboarding_requests").select().eq("token", token).single();
    if (error) {
      if (error.code === "PGRST116") return void 0;
      throw error;
    }
    return data;
  }
  async updateOnboardingRequest(id, request) {
    try {
      const { data, error } = await this.supabase.from("onboarding_requests").update(request).eq("id", id).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      return void 0;
    }
  }
  // Document operations
  async createDocument(document) {
    const { data, error } = await this.supabase.from("documents").insert(document).select().single();
    if (error) throw error;
    return data;
  }
  async getDocumentsByPartner(partnerId) {
    const { data, error } = await this.supabase.from("documents").select().eq("partner_id", partnerId);
    if (error) throw error;
    return data || [];
  }
  async getDocumentsByRequest(requestId) {
    const { data, error } = await this.supabase.from("documents").select().eq("request_id", requestId);
    if (error) throw error;
    return data || [];
  }
  async deleteDocument(id) {
    try {
      const { error } = await this.supabase.from("documents").delete().eq("id", id);
      return !error;
    } catch (error) {
      return false;
    }
  }
  async createDocumentConsent(consent) {
    console.log(`Document consent recorded: User ${consent.userId} agreed to share ${consent.documentType} for onboarding request ${consent.onboardingRequestId} at ${consent.consentedAt}`);
  }
  // Document sharing chain operations
  async createSharingChain(chain) {
    const { data, error } = await this.supabase.from("document_sharing_chains").insert(chain).select().single();
    if (error) throw error;
    return data;
  }
  async getSharingChainByToken(token) {
    const { data, error } = await this.supabase.from("document_sharing_chains").select().eq("share_token", token).single();
    if (error) {
      if (error.code === "PGRST116") return void 0;
      throw error;
    }
    return data;
  }
  async getDocumentChainHistory(documentId) {
    const { data, error } = await this.supabase.from("document_sharing_chains").select().eq("document_id", documentId);
    if (error) throw error;
    return data || [];
  }
  async revokeSharingChain(chainId) {
    try {
      const { error } = await this.supabase.from("document_sharing_chains").update({ status: "revoked" }).eq("id", chainId);
      return !error;
    } catch (error) {
      return false;
    }
  }
  // User sharing permissions
  async getUserSharingPermissions(userId) {
    const { data, error } = await this.supabase.from("user_sharing_permissions").select().or(`granter_user_id.eq.${userId},grantee_user_id.eq.${userId}`);
    if (error) throw error;
    return data || [];
  }
  async updateSharingPermission(id, updates) {
    try {
      const { data, error } = await this.supabase.from("user_sharing_permissions").update({ ...updates, updated_at: /* @__PURE__ */ new Date() }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      return void 0;
    }
  }
  async createSharingPermission(permission) {
    const { data, error } = await this.supabase.from("user_sharing_permissions").insert(permission).select().single();
    if (error) throw error;
    return data;
  }
  // Document provenance
  async createDocumentProvenance(provenance) {
    const { data, error } = await this.supabase.from("document_provenance").insert(provenance).select().single();
    if (error) throw error;
    return data;
  }
  async getDocumentProvenance(documentId) {
    const { data, error } = await this.supabase.from("document_provenance").select().eq("document_id", documentId).single();
    if (error) {
      if (error.code === "PGRST116") return void 0;
      throw error;
    }
    return data;
  }
  async updateDocumentProvenance(id, updates) {
    try {
      const { data, error } = await this.supabase.from("document_provenance").update({ ...updates, last_shared_at: /* @__PURE__ */ new Date() }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      return void 0;
    }
  }
  // Sharing notifications
  async createSharingNotification(notification) {
    const { data, error } = await this.supabase.from("sharing_notifications").insert(notification).select().single();
    if (error) throw error;
    return data;
  }
  async getSharingNotifications(userId) {
    const { data, error } = await this.supabase.from("sharing_notifications").select().eq("to_user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async markNotificationAsRead(id) {
    try {
      const { data, error } = await this.supabase.from("sharing_notifications").update({ is_read: true }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      return void 0;
    }
  }
};

// server/storage.ts
var MemStorage = class {
  users;
  partners;
  onboardingRequests;
  documents;
  documentSharingChains;
  userSharingPermissions;
  documentProvenance;
  sharingNotifications;
  businessProfiles;
  userIdCounter;
  partnerIdCounter;
  requestIdCounter;
  documentIdCounter;
  chainIdCounter;
  permissionIdCounter;
  provenanceIdCounter;
  notificationIdCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.partners = /* @__PURE__ */ new Map();
    this.onboardingRequests = /* @__PURE__ */ new Map();
    this.documents = /* @__PURE__ */ new Map();
    this.documentSharingChains = /* @__PURE__ */ new Map();
    this.userSharingPermissions = /* @__PURE__ */ new Map();
    this.documentProvenance = /* @__PURE__ */ new Map();
    this.sharingNotifications = /* @__PURE__ */ new Map();
    this.businessProfiles = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.partnerIdCounter = 1;
    this.requestIdCounter = 1;
    this.documentIdCounter = 1;
    this.chainIdCounter = 1;
    this.permissionIdCounter = 1;
    this.provenanceIdCounter = 1;
    this.notificationIdCounter = 1;
    const seedRequest = {
      id: 1,
      token: "def456",
      onboardingTypeName: "Basic Vendor Setup",
      requesterCompany: "Test Company",
      requesterEmail: "test@company.com",
      requestedFields: ["company_info", "contact_info", "w9", "insurance", "banking"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
      // 30 days from now
      currentStep: 1,
      status: "pending",
      partnerId: null
    };
    this.onboardingRequests.set(1, seedRequest);
    const seed1099Request = {
      id: 2,
      token: "test-1099-token-" + Date.now(),
      onboardingTypeName: "1099",
      requesterCompany: "Test Company",
      requesterEmail: "user@company.com",
      requestedFields: ["company_info", "contact_info", "w9_tax", "insurance", "banking"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
      // 30 days from now
      currentStep: 1,
      status: "pending",
      partnerId: null
    };
    this.onboardingRequests.set(2, seed1099Request);
    this.requestIdCounter = 3;
  }
  // User operations for Supabase authentication
  async getUserById(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }
  async createUser(userData) {
    const user = {
      id: this.userIdCounter++,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      companyName: userData.companyName || null,
      role: userData.role || "company_admin",
      isEmailVerified: userData.isEmailVerified || false,
      profileImageUrl: userData.profileImageUrl || null,
      isComplete: userData.isComplete || false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.set(user.id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) {
      return void 0;
    }
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async updateUserProfile(id, profileData) {
    console.log("updateUserProfile called with:", { id, profileData });
    const numericId = parseInt(id);
    let existingUser = this.users.get(numericId);
    if (!existingUser) {
      console.log("User not found, creating new user with id:", id);
      existingUser = {
        id: numericId,
        email: "",
        password: "",
        firstName: null,
        lastName: null,
        companyName: null,
        role: "company_admin",
        isEmailVerified: false,
        profileImageUrl: null,
        isComplete: false,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
    }
    this.businessProfiles.set(id, profileData);
    const updatedUser = {
      ...existingUser,
      id: numericId,
      // Ensure id is explicitly set
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.set(numericId, updatedUser);
    console.log("Profile updated successfully:", updatedUser);
    return updatedUser;
  }
  async getUserProfile(id) {
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
  async getPartner(id) {
    return this.partners.get(id);
  }
  async getPartnerByUsername(username) {
    return Array.from(this.partners.values()).find(
      (partner) => partner.username === username
    );
  }
  async createPartner(insertPartner) {
    const id = this.partnerIdCounter++;
    const partner = {
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
  async updatePartner(id, updates) {
    const partner = this.partners.get(id);
    if (!partner) return void 0;
    const updatedPartner = { ...partner, ...updates };
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }
  async getAllOnboardingRequests() {
    return Array.from(this.onboardingRequests.values());
  }
  async getOnboardingRequest(id) {
    console.log("Storage: Looking for request ID:", id);
    console.log("Storage: Available request IDs:", Array.from(this.onboardingRequests.keys()));
    const result = this.onboardingRequests.get(id);
    console.log("Storage: Found request:", result ? result.onboardingTypeName : "NOT FOUND");
    return result;
  }
  async getOnboardingRequestByToken(token) {
    console.log(`Looking for token: ${token}`);
    console.log(`Available requests:`, Array.from(this.onboardingRequests.values()));
    return Array.from(this.onboardingRequests.values()).find(
      (request) => request.token === token
    );
  }
  async createOnboardingRequest(request) {
    const id = this.requestIdCounter++;
    const newRequest = {
      id,
      token: request.token,
      onboardingTypeName: request.onboardingTypeName,
      requesterCompany: request.requesterCompany || null,
      requesterEmail: request.requesterEmail,
      requestedFields: request.requestedFields,
      expiresAt: request.expiresAt,
      currentStep: 1,
      status: "pending",
      partnerId: null
    };
    this.onboardingRequests.set(id, newRequest);
    return newRequest;
  }
  async updateOnboardingRequest(id, updates) {
    const request = this.onboardingRequests.get(id);
    if (!request) return void 0;
    const updatedRequest = { ...request, ...updates };
    this.onboardingRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  async getDocumentsByPartner(partnerId) {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.partnerId === partnerId
    );
  }
  async getDocumentsByRequest(requestId) {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.requestId === requestId
    );
  }
  async createDocument(insertDocument) {
    const id = this.documentIdCounter++;
    const document = {
      ...insertDocument,
      id,
      requestId: insertDocument.requestId || null,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    this.documents.set(id, document);
    return document;
  }
  async deleteDocument(id) {
    return this.documents.delete(id);
  }
  async createDocumentConsent(consent) {
    console.log(`Document consent recorded: User ${consent.userId} agreed to share ${consent.documentType} for onboarding request ${consent.onboardingRequestId} at ${consent.consentedAt}`);
  }
  // Chain sharing operations
  async createSharingChain(chain) {
    const id = this.chainIdCounter++;
    const newChain = {
      id,
      documentId: chain.documentId,
      fromUserId: chain.fromUserId,
      toUserId: chain.toUserId,
      parentChainId: chain.parentChainId || null,
      shareToken: chain.shareToken,
      shareReason: chain.shareReason || null,
      permissions: chain.permissions || null,
      status: chain.status || "active",
      sharedAt: /* @__PURE__ */ new Date(),
      expiresAt: chain.expiresAt || null
    };
    this.documentSharingChains.set(id, newChain);
    return newChain;
  }
  async getSharingChainByToken(token) {
    return Array.from(this.documentSharingChains.values()).find(
      (chain) => chain.shareToken === token
    );
  }
  async getUserSharingPermissions(userId) {
    return Array.from(this.userSharingPermissions.values()).filter(
      (permission) => permission.granterUserId === userId || permission.granteeUserId === userId
    );
  }
  async updateSharingPermission(id, updates) {
    const permission = this.userSharingPermissions.get(id);
    if (!permission) return void 0;
    const updatedPermission = {
      ...permission,
      ...updates,
      status: updates.status || permission.status,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.userSharingPermissions.set(id, updatedPermission);
    return updatedPermission;
  }
  async createSharingPermission(permission) {
    const id = this.permissionIdCounter++;
    const newPermission = {
      id,
      granterUserId: permission.granterUserId,
      granteeUserId: permission.granteeUserId,
      documentTypes: permission.documentTypes,
      canRelay: permission.canRelay ?? null,
      canViewHistory: permission.canViewHistory ?? null,
      maxChainDepth: permission.maxChainDepth ?? null,
      status: permission.status || "active",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.userSharingPermissions.set(id, newPermission);
    return newPermission;
  }
  async getDocumentProvenance(documentId) {
    return Array.from(this.documentProvenance.values()).find(
      (provenance) => provenance.documentId === documentId
    );
  }
  async updateDocumentProvenance(id, updates) {
    const provenance = this.documentProvenance.get(id);
    if (!provenance) return void 0;
    const updatedProvenance = {
      ...provenance,
      ...updates,
      lastSharedAt: /* @__PURE__ */ new Date()
    };
    this.documentProvenance.set(id, updatedProvenance);
    return updatedProvenance;
  }
  async createDocumentProvenance(provenance) {
    const id = this.provenanceIdCounter++;
    const newProvenance = {
      ...provenance,
      id,
      chainDepth: provenance.chainDepth || 0,
      totalShares: provenance.totalShares || 0,
      isOriginal: provenance.isOriginal || true,
      lastSharedAt: /* @__PURE__ */ new Date()
    };
    this.documentProvenance.set(id, newProvenance);
    return newProvenance;
  }
  async getSharingNotifications(userId) {
    return Array.from(this.sharingNotifications.values()).filter(
      (notification) => notification.toUserId === userId
    );
  }
  async createSharingNotification(notification) {
    const id = this.notificationIdCounter++;
    const newNotification = {
      ...notification,
      id,
      documentId: notification.documentId || null,
      chainId: notification.chainId || null,
      metadata: notification.metadata || null,
      isRead: notification.isRead || false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.sharingNotifications.set(id, newNotification);
    return newNotification;
  }
  async markNotificationAsRead(id) {
    const notification = this.sharingNotifications.get(id);
    if (!notification) return void 0;
    const updatedNotification = {
      ...notification,
      isRead: true
    };
    this.sharingNotifications.set(id, updatedNotification);
    return updatedNotification;
  }
  async revokeSharingChain(chainId) {
    const chain = this.documentSharingChains.get(chainId);
    if (!chain) return false;
    const updatedChain = {
      ...chain,
      status: "revoked"
    };
    this.documentSharingChains.set(chainId, updatedChain);
    return true;
  }
  async getDocumentChainHistory(documentId) {
    return Array.from(this.documentSharingChains.values()).filter(
      (chain) => chain.documentId === documentId
    );
  }
};
console.log("Storage selection debug:");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
var storage = process.env.DATABASE_URL ? new DatabaseStorage() : process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? new SupabaseStorage() : new MemStorage();
console.log("Selected storage type:", storage.constructor.name);

// server/fileUpload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});
var fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png"
  ];
  const allowedExtensions = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed."));
  }
};
var upload = multer({
  storage: storage2,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    // 10MB limit
    files: 1
    // Single file upload
  }
});
var handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large. Maximum size is 10MB."
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Too many files. Only one file allowed per upload."
      });
    }
    return res.status(400).json({
      message: `Upload error: ${error.message}`
    });
  }
  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      message: error.message
    });
  }
  next(error);
};
var uploadSingle = upload.single("document");
var uploadMultiple = upload.array("documents", 5);
var getFileInfo = (file) => {
  return {
    fileName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path
  };
};
var deleteUploadedFile = (filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadsDir, filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
var validateDocumentType = (documentType) => {
  const allowedTypes = ["w9", "insurance", "banking", "license", "certificate", "other"];
  return allowedTypes.includes(documentType);
};

// server/routes.ts
import { randomBytes } from "crypto";
import multer2 from "multer";
var upload2 = multer2({
  storage: multer2.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed."));
    }
  }
});
async function registerRoutes(app2) {
  app2.get("/api/user/profile", async (req, res) => {
    try {
      const dummyUserId = "test-user-id";
      const userProfile = await storage.getUserProfile(dummyUserId);
      const isComplete = !!(userProfile?.businessInfo?.legalBusinessName && userProfile?.businessInfo?.taxId && userProfile?.businessInfo?.businessAddress && userProfile?.businessInfo?.phoneNumber && userProfile?.businessInfo?.companyEmail);
      res.json({
        ...userProfile,
        isComplete
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  app2.put("/api/user/profile", async (req, res) => {
    try {
      console.log("=== PROFILE UPDATE DEBUG ===");
      console.log("req.user:", req.user);
      console.log("req.session:", req.session);
      console.log("req.isAuthenticated():", req.isAuthenticated ? req.isAuthenticated() : "no method");
      console.log("Headers:", req.headers);
      console.log("Body:", req.body);
      const dummyUserId = "test-user-id";
      const profileData = req.body;
      console.log("Using dummy user ID for testing:", dummyUserId);
      console.log("Profile data:", profileData);
      const updatedUser = await storage.updateUserProfile(dummyUserId, profileData);
      res.json({ success: true, user: updatedUser, debug: "Using dummy user for testing" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : void 0
      });
    }
  });
  app2.post("/api/user/setup", async (req, res) => {
    try {
      const { firstName, lastName, email, selectedUploads, supabaseUserId, companyName } = req.body;
      console.log("User setup request:", { firstName, lastName, email, selectedUploads, supabaseUserId, companyName });
      const userData = {
        email,
        password: "",
        // Not stored since we use Supabase auth
        firstName: firstName || null,
        lastName: lastName || null,
        companyName: companyName || null,
        // Use the provided company name
        role: "company_admin",
        isEmailVerified: true,
        // Assuming email is verified via Supabase
        profileImageUrl: null,
        isComplete: false
        // Will be true after business info is completed
      };
      const user = await storage.createUser(userData);
      console.log("User created successfully:", user);
      res.json({
        success: true,
        message: "User setup completed",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          companyName: user.companyName,
          isComplete: user.isComplete,
          selectedUploads
        }
      });
    } catch (error) {
      console.error("Error setting up user:", error);
      res.status(500).json({
        message: "Failed to set up user",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.post("/api/onboarding-requests", async (req, res) => {
    try {
      const validatedData = createRequestSchema.parse(req.body);
      const token = randomBytes(32).toString("hex");
      const expirationDays = req.body.expirationDays || 30;
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);
      const requesterCompany = validatedData.onboardingTypeName || "Your Company";
      const request = await storage.createOnboardingRequest({
        token,
        onboardingTypeName: validatedData.onboardingTypeName,
        requesterCompany,
        requesterEmail: "user@company.com",
        // This would come from authenticated user
        requestedFields: validatedData.requestedFields,
        expiresAt
      });
      res.json({
        success: true,
        requestId: request.id,
        token: request.token,
        link: `${req.protocol}://${req.get("host")}/onboarding/${request.token}`
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/onboarding-types/:id", async (req, res) => {
    try {
      console.log("=== API ROUTE HIT: /api/onboarding-types/:id ===");
      const { id } = req.params;
      console.log("Fetching onboarding type for ID:", id);
      const request = await storage.getOnboardingRequest(parseInt(id));
      if (!request) {
        console.log("No onboarding type found for ID:", id);
        return res.status(404).json({ error: "Onboarding type not found" });
      }
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
        link: `${req.protocol}://${req.get("host")}/onboarding/${request.token}`
      };
      console.log("Sending onboarding type response:", {
        title: onboardingType.title,
        id: onboardingType.id
      });
      res.json(onboardingType);
    } catch (error) {
      console.log("Error fetching onboarding type:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/onboarding-requests/id/:id", async (req, res) => {
    try {
      console.log("=== API ROUTE HIT: /api/onboarding-requests/id/:id ===");
      const { id } = req.params;
      console.log("Fetching onboarding request for ID:", id);
      res.setHeader("Content-Type", "application/json");
      const request = await storage.getOnboardingRequest(parseInt(id));
      if (!request) {
        console.log("No request found for ID:", id);
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      let vendor = null;
      if (request.partnerId) {
        vendor = await storage.getPartner(request.partnerId);
      }
      const responseData = {
        request: {
          ...request,
          title: request.onboardingTypeName
          // Add title field for easier access
        },
        vendor
      };
      console.log("Sending response for ID:", id, {
        title: request.onboardingTypeName,
        id: request.id
      });
      return res.status(200).json(responseData);
    } catch (error) {
      console.log("Error fetching request:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/onboarding-requests/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const request = await storage.getOnboardingRequestByToken(token);
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      if (/* @__PURE__ */ new Date() > request.expiresAt) {
        return res.status(410).json({
          error: "Onboarding link has expired",
          expiredAt: request.expiresAt
        });
      }
      if (request.status === "completed") {
        return res.status(409).json({
          error: "Onboarding has already been completed",
          completedAt: /* @__PURE__ */ new Date()
        });
      }
      if (/* @__PURE__ */ new Date() > request.expiresAt) {
        return res.status(410).json({ error: "Onboarding request has expired" });
      }
      let vendor = null;
      if (request.partnerId) {
        vendor = await storage.getPartner(request.partnerId);
      }
      res.json({ request, vendor });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/onboarding-requests/:token/company-info", async (req, res) => {
    try {
      const { token } = req.params;
      const request = await storage.getOnboardingRequestByToken(token);
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      if (/* @__PURE__ */ new Date() > request.expiresAt) {
        return res.status(410).json({ error: "Onboarding request has expired" });
      }
      const validatedData = companyInfoSchema.parse(req.body);
      let vendor;
      if (request.partnerId) {
        vendor = await storage.updatePartner(request.partnerId, {
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
          arContactName: validatedData.sameAsPrimary ? validatedData.primaryContactName : validatedData.arContactName,
          arContactEmail: validatedData.sameAsPrimary ? validatedData.primaryContactEmail : validatedData.arContactEmail
        });
      } else {
        vendor = await storage.createPartner({
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
          arContactName: validatedData.sameAsPrimary ? validatedData.primaryContactName : validatedData.arContactName,
          arContactEmail: validatedData.sameAsPrimary ? validatedData.primaryContactEmail : validatedData.arContactEmail,
          username: null,
          password: null
        });
        await storage.updateOnboardingRequest(request.id, {
          partnerId: vendor.id,
          currentStep: 2
        });
      }
      res.json({ success: true, vendor });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/onboarding-requests/:token/documents", uploadSingle, async (req, res) => {
    try {
      const { token } = req.params;
      const { documentType } = req.body;
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
      if (!request.partnerId) {
        return res.status(400).json({ error: "Complete company information first" });
      }
      if (request.status === "completed") {
        return res.status(400).json({ error: "Onboarding already completed" });
      }
      if (/* @__PURE__ */ new Date() > request.expiresAt) {
        return res.status(400).json({ error: "Onboarding request has expired" });
      }
      const fileInfo = getFileInfo(req.file);
      const document = await storage.createDocument({
        partnerId: request.partnerId,
        requestId: request.id,
        documentType,
        fileName: fileInfo.fileName,
        fileSize: fileInfo.size,
        mimeType: fileInfo.mimeType
      });
      res.json({
        success: true,
        document: {
          ...document,
          originalName: fileInfo.originalName
        }
      });
    } catch (error) {
      if (req.file) {
        try {
          await deleteUploadedFile(req.file.filename);
        } catch (deleteError) {
          console.error("Error deleting uploaded file:", deleteError);
        }
      }
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.use("/api/onboarding-requests/:token/documents", handleUploadError);
  app2.get("/api/user/documents", async (req, res) => {
    try {
      const documentProfile = {
        w9: true,
        // User has W-9 on file
        insurance: true,
        // User has insurance on file
        banking: false
        // User needs to upload banking
      };
      res.json({ documents: documentProfile });
    } catch (error) {
      console.error("Error fetching user documents:", error);
      res.status(500).json({ error: "Failed to fetch user documents" });
    }
  });
  app2.post("/api/document-consent", async (req, res) => {
    try {
      const { user_id, onboarding_request_id, document_type, consented_at } = req.body;
      await storage.createDocumentConsent({
        userId: user_id,
        onboardingRequestId: onboarding_request_id,
        documentType: document_type,
        consentedAt: new Date(consented_at)
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording consent:", error);
      res.status(500).json({ error: "Failed to record consent" });
    }
  });
  app2.get("/api/onboarding-requests/:token/documents", async (req, res) => {
    try {
      const { token } = req.params;
      const request = await storage.getOnboardingRequestByToken(token);
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      const documents2 = await storage.getDocumentsByRequest(request.id);
      res.json({ documents: documents2 });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.delete("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDocument(parseInt(id));
      if (!success) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/onboarding-requests/:token/complete", async (req, res) => {
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
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.patch("/api/onboarding-requests/:token/step", async (req, res) => {
    try {
      const { token } = req.params;
      const { step } = req.body;
      const request = await storage.getOnboardingRequestByToken(token);
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      await storage.updateOnboardingRequest(request.id, { currentStep: step });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/onboarding-requests", async (req, res) => {
    try {
      const allRequests = await storage.getAllOnboardingRequests();
      const requests = allRequests.map((request) => ({
        id: request.id,
        title: request.onboardingTypeName || request.requesterCompany,
        onboardingTypeName: request.onboardingTypeName || request.requesterCompany,
        description: `${request.requestedFields.length} fields, ${request.status}`,
        fields: request.requestedFields,
        createdAt: request.createdAt,
        link: `${req.protocol}://${req.get("host")}/onboarding/${request.token}`,
        status: request.status
      }));
      res.json(requests);
    } catch (error) {
      console.error("Error fetching onboarding requests:", error);
      res.status(500).json({ error: "Failed to fetch onboarding requests" });
    }
  });
  app2.post("/api/vendors/share", async (req, res) => {
    try {
      const { onboardingToken, shareDocuments = true } = req.body;
      const vendorId = req.vendor.id;
      const onboardingRequest = await storage.getOnboardingRequestByToken(onboardingToken);
      if (!onboardingRequest) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      if (/* @__PURE__ */ new Date() > onboardingRequest.expiresAt) {
        return res.status(410).json({ error: "Onboarding request has expired" });
      }
      if (onboardingRequest.status === "completed") {
        return res.status(409).json({ error: "Onboarding already completed" });
      }
      const vendor = await storage.getPartner(vendorId);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      let documents2 = [];
      if (shareDocuments) {
        documents2 = await storage.getDocumentsByPartner(vendorId);
      }
      await storage.updateOnboardingRequest(onboardingRequest.id, {
        partnerId: vendorId,
        status: "completed",
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
            address: `${vendor.street}, ${vendor.city}, ${vendor.state} ${vendor.postalCode}, ${vendor.country}`,
            primaryContact: {
              name: vendor.primaryContactName,
              title: vendor.primaryContactTitle,
              email: vendor.primaryContactEmail,
              phone: vendor.primaryContactPhone
            },
            arContact: {
              name: vendor.arContactName,
              email: vendor.arContactEmail
            }
          },
          documentsShared: shareDocuments ? documents2.map((doc) => ({
            id: doc.id,
            documentType: doc.documentType,
            fileName: doc.fileName,
            uploadedAt: doc.uploadedAt,
            status: doc.status
          })) : [],
          recipient: onboardingRequest.requesterCompany,
          sharedAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      console.error("Error sharing vendor information:", error);
      res.status(500).json({ error: "Failed to share vendor information" });
    }
  });
  app2.get("/api/vendors/sharing-history", async (req, res) => {
    try {
      const vendorId = req.vendor.id;
      const sharingHistory = [];
      res.json({
        success: true,
        sharingHistory
      });
    } catch (error) {
      console.error("Error fetching sharing history:", error);
      res.status(500).json({ error: "Failed to fetch sharing history" });
    }
  });
  app2.get("/api/vendors/validate-share/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const request = await storage.getOnboardingRequestByToken(token);
      if (!request) {
        return res.status(404).json({ error: "Onboarding request not found" });
      }
      if (/* @__PURE__ */ new Date() > request.expiresAt) {
        return res.status(410).json({ error: "Onboarding request has expired" });
      }
      if (request.status === "completed") {
        return res.status(409).json({ error: "Onboarding already completed" });
      }
      const vendor = await storage.getPartner(req.vendor.id);
      const documents2 = await storage.getDocumentsByPartner(req.vendor.id);
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
          documentsAvailable: documents2.length,
          documentTypes: documents2.map((doc) => doc.documentType)
        }
      });
    } catch (error) {
      console.error("Error validating share request:", error);
      res.status(500).json({ error: "Failed to validate sharing request" });
    }
  });
  app2.post("/api/documents/:documentId/share", async (req, res) => {
    try {
      const { documentId } = req.params;
      const validatedData = shareDocumentSchema.parse(req.body);
      const mockUserId = 1;
      const shareToken = randomBytes(32).toString("hex");
      const sharingChain = {
        id: Date.now(),
        // Simple ID generation for demo
        documentId: parseInt(documentId),
        fromUserId: mockUserId,
        toUserId: validatedData.toUserId,
        shareToken,
        shareReason: validatedData.shareReason || null,
        permissions: validatedData.permissions,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        sharedAt: /* @__PURE__ */ new Date(),
        status: "active"
      };
      res.json({
        success: true,
        chain: sharingChain,
        shareLink: `${req.protocol}://${req.get("host")}/shared/${shareToken}`
      });
    } catch (error) {
      console.error("Error creating sharing chain:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/shared/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const mockChain = {
        id: 1,
        documentId: 1,
        fromUserId: 1,
        toUserId: 2,
        shareToken: token,
        status: "active",
        permissions: { canRelay: true, canView: true, canDownload: true },
        expiresAt: null,
        sharedAt: /* @__PURE__ */ new Date()
      };
      const mockDocument = {
        id: 1,
        fileName: "sample-w9.pdf",
        documentType: "w9",
        fileSize: 2048,
        uploadedAt: /* @__PURE__ */ new Date()
      };
      const chainPath = [1, 2];
      res.json({
        success: true,
        document: mockDocument,
        chain: mockChain,
        chainPath,
        chainDepth: chainPath.length - 1
      });
    } catch (error) {
      console.error("Error accessing shared document:", error);
      res.status(500).json({ error: "Failed to access shared document" });
    }
  });
  app2.post("/api/shared/:token/relay", async (req, res) => {
    try {
      const { token } = req.params;
      const validatedData = shareDocumentSchema.parse(req.body);
      const mockUserId = 2;
      const parentChain = {
        id: 1,
        permissions: { canRelay: true, canView: true, canDownload: true }
      };
      if (!parentChain.permissions.canRelay) {
        return res.status(403).json({ error: "You don't have permission to relay this document" });
      }
      const relayToken = randomBytes(32).toString("hex");
      const relayChain = {
        id: Date.now(),
        documentId: 1,
        // From parent chain
        fromUserId: mockUserId,
        toUserId: validatedData.toUserId,
        parentChainId: parentChain.id,
        shareToken: relayToken,
        shareReason: validatedData.shareReason || null,
        permissions: validatedData.permissions,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        sharedAt: /* @__PURE__ */ new Date(),
        status: "active"
      };
      res.json({
        success: true,
        chain: relayChain,
        shareLink: `${req.protocol}://${req.get("host")}/shared/${relayToken}`,
        chainPath: [1, 2, validatedData.toUserId]
        // Extended chain
      });
    } catch (error) {
      console.error("Error relaying document:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/documents/:documentId/chain-history", async (req, res) => {
    try {
      const { documentId } = req.params;
      const chainHistory = [
        {
          id: 1,
          fromUser: { id: 1, name: "John Doe", company: "Company A" },
          toUser: { id: 2, name: "Jane Smith", company: "Company B" },
          sharedAt: new Date(Date.now() - 24 * 60 * 60 * 1e3),
          // 1 day ago
          status: "active",
          permissions: { canRelay: true, canView: true, canDownload: true }
        },
        {
          id: 2,
          fromUser: { id: 2, name: "Jane Smith", company: "Company B" },
          toUser: { id: 3, name: "Bob Johnson", company: "Company C" },
          sharedAt: new Date(Date.now() - 12 * 60 * 60 * 1e3),
          // 12 hours ago
          status: "active",
          permissions: { canRelay: false, canView: true, canDownload: true },
          parentChainId: 1
        }
      ];
      const provenance = {
        originalOwner: { id: 1, name: "John Doe", company: "Company A" },
        currentDepth: 2,
        totalShares: 2,
        lastSharedAt: new Date(Date.now() - 12 * 60 * 60 * 1e3)
      };
      res.json({
        success: true,
        chainHistory,
        provenance,
        visualizationData: {
          nodes: [
            { id: 1, name: "John Doe", company: "Company A", type: "original" },
            { id: 2, name: "Jane Smith", company: "Company B", type: "relay" },
            { id: 3, name: "Bob Johnson", company: "Company C", type: "endpoint" }
          ],
          edges: [
            { from: 1, to: 2, label: "Direct Share", date: chainHistory[0].sharedAt },
            { from: 2, to: 3, label: "Relay Share", date: chainHistory[1].sharedAt }
          ]
        }
      });
    } catch (error) {
      console.error("Error fetching chain history:", error);
      res.status(500).json({ error: "Failed to fetch chain history" });
    }
  });
  app2.get("/api/users/:userId/sharing-permissions", async (req, res) => {
    try {
      const { userId } = req.params;
      const permissions = [
        {
          id: 1,
          granteeUser: { id: 2, name: "Jane Smith", company: "Company B" },
          documentTypes: ["w9", "insurance"],
          canRelay: true,
          canViewHistory: false,
          maxChainDepth: 3,
          status: "active",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
        },
        {
          id: 2,
          granteeUser: { id: 3, name: "Bob Johnson", company: "Company C" },
          documentTypes: ["banking"],
          canRelay: false,
          canViewHistory: true,
          maxChainDepth: 1,
          status: "active",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3)
        }
      ];
      res.json({
        success: true,
        permissions
      });
    } catch (error) {
      console.error("Error fetching sharing permissions:", error);
      res.status(500).json({ error: "Failed to fetch sharing permissions" });
    }
  });
  app2.put("/api/users/:userId/sharing-permissions/:permissionId", async (req, res) => {
    try {
      const { userId, permissionId } = req.params;
      const validatedData = updateSharingPermissionSchema.parse(req.body);
      const updatedPermission = {
        id: parseInt(permissionId),
        granterUserId: parseInt(userId),
        granteeUserId: validatedData.granteeUserId,
        documentTypes: validatedData.documentTypes,
        canRelay: validatedData.canRelay,
        canViewHistory: validatedData.canViewHistory,
        maxChainDepth: validatedData.maxChainDepth,
        status: "active",
        updatedAt: /* @__PURE__ */ new Date()
      };
      res.json({
        success: true,
        permission: updatedPermission
      });
    } catch (error) {
      console.error("Error updating sharing permissions:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/chains/:chainId/revoke", async (req, res) => {
    try {
      const { chainId } = req.params;
      const revokedChain = {
        id: parseInt(chainId),
        status: "revoked",
        revokedAt: /* @__PURE__ */ new Date(),
        revokedBy: 1
        // Current user
      };
      res.json({
        success: true,
        message: "Sharing chain revoked successfully",
        chain: revokedChain
      });
    } catch (error) {
      console.error("Error revoking sharing chain:", error);
      res.status(500).json({ error: "Failed to revoke sharing chain" });
    }
  });
  app2.get("/api/users/:userId/sharing-notifications", async (req, res) => {
    try {
      const { userId } = req.params;
      const { unreadOnly } = req.query;
      const notifications = [
        {
          id: 1,
          fromUser: { id: 1, name: "John Doe", company: "Company A" },
          notificationType: "share_request",
          message: "John Doe shared a W-9 document with you",
          documentType: "w9",
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1e3),
          // 2 hours ago
          metadata: { shareToken: "abc123" }
        },
        {
          id: 2,
          fromUser: { id: 2, name: "Jane Smith", company: "Company B" },
          notificationType: "share_accepted",
          message: "Jane Smith accepted your document share",
          documentType: "insurance",
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1e3),
          // 1 day ago
          metadata: { chainId: 5 }
        }
      ];
      const filteredNotifications = unreadOnly === "true" ? notifications.filter((n) => !n.isRead) : notifications;
      res.json({
        success: true,
        notifications: filteredNotifications,
        unreadCount: notifications.filter((n) => !n.isRead).length
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  app2.put("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      const { notificationId } = req.params;
      res.json({
        success: true,
        message: "Notification marked as read"
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// api/index.ts
dotenv.config();
console.log("=== API Environment Check ===");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET");
console.log("VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL ? "SET" : "NOT SET");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
if (process.env.VITE_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}
if (process.env.VITE_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
app.get("/", (req, res) => {
  res.json({
    message: "VendorVault API is running!",
    endpoints: ["/api/health", "/api/onboarding-requests", "/api/user/profile"]
  });
});
var isSetup = false;
async function handler(req, res) {
  if (!isSetup) {
    await registerRoutes(app);
    app.use((err, _req, res2, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("API Error:", err);
      res2.status(status).json({ message });
    });
    isSetup = true;
  }
  req.url = req.url || "/";
  req.query = req.query || {};
  return app(req, res);
}
export {
  handler as default
};
