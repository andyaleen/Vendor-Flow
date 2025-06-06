import type { User as SupabaseUser } from "@supabase/supabase-js";

// Extended User type that includes additional properties
export interface User extends SupabaseUser {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  isComplete?: boolean;
}

// Re-export all types from shared schema
export * from "@shared/schema";
