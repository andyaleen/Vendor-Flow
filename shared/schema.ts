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
  requesterCompany: text("requester_company").notNull(),
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
  requesterCompany: z.string().min(1, "Company name is required"),
  requesterEmail: z.string().email("Valid email is required"),
  requestedFields: z.array(z.string()).min(1, "At least one field is required"),
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

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;
export type CreateRequestFormData = z.infer<typeof createRequestSchema>;
