import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  varchar,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Partners table
export const partners = pgTable("partners", {
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
  isActive: boolean("is_active").default(true),
});

// Onboarding requests table
export const onboardingRequests = pgTable("onboarding_requests", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  onboardingTypeName: text("onboarding_type_name").notNull(),
  requesterCompany: text("requester_company"),
  requesterEmail: text("requester_email").notNull(),
  requestedFields: text("requested_fields").array().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  partnerId: integer("partner_id").references(() => partners.id),
  status: text("status").notNull().default("pending"), // pending, completed, expired
  currentStep: integer("current_step").default(1),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  requestId: integer("request_id").references(() => onboardingRequests.id),
  documentType: text("document_type").notNull(), // w9, insurance, banking
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Onboarding consent tracking table
export const onboardingConsent = pgTable("onboarding_consent", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => partners.id).notNull(),
  requestId: integer("request_id").references(() => onboardingRequests.id).notNull(),
  documentType: text("document_type").notNull(),
  sharedAt: timestamp("shared_at").defaultNow(),
});

// Document sharing chains table
export const documentSharingChains = pgTable("document_sharing_chains", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  parentChainId: integer("parent_chain_id"), // Self-referencing, will add foreign key constraint separately
  shareToken: text("share_token").unique().notNull(),
  shareReason: text("share_reason"),
  permissions: jsonb("permissions").notNull().default('{"canRelay": true, "canView": true, "canDownload": true}'),
  expiresAt: timestamp("expires_at"),
  sharedAt: timestamp("shared_at").defaultNow(),
  status: text("status").notNull().default("active"), // active, revoked, expired
});

// User to user sharing permissions table
export const userSharingPermissions = pgTable("user_sharing_permissions", {
  id: serial("id").primaryKey(),
  granterUserId: integer("granter_user_id").references(() => users.id).notNull(),
  granteeUserId: integer("grantee_user_id").references(() => users.id).notNull(),
  documentTypes: text("document_types").array().notNull(), // ['w9', 'insurance', 'banking', 'all']
  canRelay: boolean("can_relay").default(true),
  canViewHistory: boolean("can_view_history").default(false),
  maxChainDepth: integer("max_chain_depth").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  status: text("status").notNull().default("active"), // active, revoked
});

// Document provenance tracking table
export const documentProvenance = pgTable("document_provenance", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  originalOwnerId: integer("original_owner_id").references(() => users.id).notNull(),
  currentHolderId: integer("current_holder_id").references(() => users.id).notNull(),
  chainDepth: integer("chain_depth").notNull().default(0),
  accessPath: jsonb("access_path").notNull(), // Array of user IDs showing the sharing path
  lastSharedAt: timestamp("last_shared_at").defaultNow(),
  totalShares: integer("total_shares").default(0),
  isOriginal: boolean("is_original").default(true),
});

// Sharing request notifications table
export const sharingNotifications = pgTable("sharing_notifications", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").references(() => users.id).notNull(),
  toUserId: integer("to_user_id").references(() => users.id).notNull(),
  documentId: integer("document_id").references(() => documents.id),
  chainId: integer("chain_id").references(() => documentSharingChains.id),
  notificationType: text("notification_type").notNull(), // 'share_request', 'share_accepted', 'share_rejected', 'chain_complete'
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  isActive: true,
});

export const insertOnboardingRequestSchema = createInsertSchema(onboardingRequests).omit({
  id: true,
  partnerId: true,
  status: true,
  currentStep: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertDocumentSharingChainSchema = createInsertSchema(documentSharingChains).omit({
  id: true,
  sharedAt: true,
});

export const insertUserSharingPermissionSchema = createInsertSchema(userSharingPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentProvenanceSchema = createInsertSchema(documentProvenance).omit({
  id: true,
  lastSharedAt: true,
});

export const insertSharingNotificationSchema = createInsertSchema(sharingNotifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

// Vendor is an alias for Partner for backward compatibility
export type Vendor = Partner;
export type InsertVendor = InsertPartner;

export type OnboardingRequest = typeof onboardingRequests.$inferSelect;
export type InsertOnboardingRequest = z.infer<typeof insertOnboardingRequestSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type DocumentSharingChain = typeof documentSharingChains.$inferSelect;
export type InsertDocumentSharingChain = z.infer<typeof insertDocumentSharingChainSchema>;

export type UserSharingPermission = typeof userSharingPermissions.$inferSelect;
export type InsertUserSharingPermission = z.infer<typeof insertUserSharingPermissionSchema>;

export type DocumentProvenance = typeof documentProvenance.$inferSelect;
export type InsertDocumentProvenance = z.infer<typeof insertDocumentProvenanceSchema>;

export type SharingNotification = typeof sharingNotifications.$inferSelect;
export type InsertSharingNotification = z.infer<typeof insertSharingNotificationSchema>;

// Form validation schemas
export const companyInfoSchema = z.object({
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
  sameAsPrimary: z.boolean().optional(),
});

export const createRequestSchema = z.object({
  onboardingTypeName: z.string().min(1, "Onboarding type name is required"),
  requestedFields: z.array(z.string()).min(1, "At least one field is required"),
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().min(1, "Company name is required"),
});

export const userOnboardingSchema = z.object({
  email: z.string().email("Valid email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const vendorAuthSchema = z.object({
  username: z.string().min(1, "Username is required").optional(),
  email: z.string().email("Please enter a valid email").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
}).refine((data) => data.username || data.email, {
  message: "Either username or email is required",
  path: ["username"],
});

// Chain sharing validation schemas
export const shareDocumentSchema = z.object({
  documentId: z.number().int().positive("Document ID is required"),
  toUserId: z.number().int().positive("Recipient user ID is required"),
  shareReason: z.string().optional(),
  permissions: z.object({
    canRelay: z.boolean().default(true),
    canView: z.boolean().default(true),
    canDownload: z.boolean().default(true),
  }).default({}),
  expiresAt: z.string().datetime().optional(),
});

export const updateSharingPermissionSchema = z.object({
  granteeUserId: z.number().int().positive("Grantee user ID is required"),
  documentTypes: z.array(z.string()).min(1, "At least one document type is required"),
  canRelay: z.boolean().default(true),
  canViewHistory: z.boolean().default(false),
  maxChainDepth: z.number().int().min(1).max(10).default(3),
});

export const chainAccessRequestSchema = z.object({
  shareToken: z.string().min(1, "Share token is required"),
  requestReason: z.string().optional(),
});

// Sessions table (currently unused with Supabase auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Company Users table for Supabase authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  companyName: varchar("company_name"),
  role: varchar("role").default("company_admin").notNull(), // 'company_admin', 'vendor'
  isEmailVerified: boolean("is_email_verified").default(false),
  profileImageUrl: varchar("profile_image_url"),
  isComplete: boolean("is_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;
export type CreateRequestFormData = z.infer<typeof createRequestSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UserOnboardingFormData = z.infer<typeof userOnboardingSchema>;
export type VendorAuthFormData = z.infer<typeof vendorAuthSchema>;
export type ShareDocumentFormData = z.infer<typeof shareDocumentSchema>;
export type UpdateSharingPermissionFormData = z.infer<typeof updateSharingPermissionSchema>;
export type ChainAccessRequestFormData = z.infer<typeof chainAccessRequestSchema>;
