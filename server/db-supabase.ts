import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

// Alternative database setup using Supabase client instead of direct PostgreSQL connection
// This works with your API keys without needing the database password

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and anon key must be set");
}

// Create Supabase client for authentication and database operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Simple database operations using Supabase client
export const supabaseDb = {
  // Partners operations
  async getPartners() {
    const { data, error } = await supabase.from('partners').select('*');
    if (error) throw error;
    return data;
  },
  
  async createPartner(partner: any) {
    const { data, error } = await supabase.from('partners').insert(partner).select().single();
    if (error) throw error;
    return data;
  },
  
  // Documents operations
  async getDocuments() {
    const { data, error } = await supabase.from('documents').select('*');
    if (error) throw error;
    return data;
  },
  
  async createDocument(document: any) {
    const { data, error } = await supabase.from('documents').insert(document).select().single();
    if (error) throw error;
    return data;
  },
  
  // Chain sharing operations
  async getDocumentSharingChains() {
    const { data, error } = await supabase.from('document_sharing_chains').select('*');
    if (error) throw error;
    return data;
  },
  
  async createSharingChain(chain: any) {
    const { data, error } = await supabase.from('document_sharing_chains').insert(chain).select().single();
    if (error) throw error;
    return data;
  },
  
  // Users operations
  async getUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data;
  },
  
  async createUser(user: any) {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) throw error;
    return data;
  }
};

// Export the original drizzle setup as fallback
// Commented out until DATABASE_URL is properly set
/*
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using Supabase client instead of direct PostgreSQL connection.");
} else {
  const queryClient = postgres(process.env.DATABASE_URL);
  export const db = drizzle(queryClient, { schema });
}
*/
