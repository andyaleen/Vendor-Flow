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

// Vendors table
export const vendors = pgTable("vendors", {
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
  vendorId: integer("vendor_id").references(() => vendors.id),
  status: text("status").notNull().default("pending"), // pending, completed, expired
  currentStep: integer("current_step").default(1),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
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
  userId: integer("user_id").references(() => vendors.id).notNull(),
  requestId: integer("request_id").references(() => onboardingRequests.id).notNull(),
  documentType: text("document_type").notNull(),
  sharedAt: timestamp("shared_at").defaultNow(),
});

// Insert schemas
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  isActive: true,
});

export const insertOnboardingRequestSchema = createInsertSchema(onboardingRequests).omit({
  id: true,
  vendorId: true,
  status: true,
  currentStep: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type OnboardingRequest = typeof onboardingRequests.$inferSelect;
export type InsertOnboardingRequest = z.infer<typeof insertOnboardingRequestSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

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
  sameAsPRIMARY: z.boolean().optional(),
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

export const vendorAuthSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Company Users table for JWT authentication
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;
export type CreateRequestFormData = z.infer<typeof createRequestSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type VendorAuthFormData = z.infer<typeof vendorAuthSchema>;
