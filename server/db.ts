import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

console.log('🔧 Database Configuration:');
console.log('Supabase URL:', supabaseUrl ? '✅ SET' : '❌ NOT SET');
console.log('Service Role Key:', supabaseServiceKey ? '✅ SET' : '❌ NOT SET');
console.log('Database URL:', databaseUrl ? '✅ SET' : '❌ NOT SET');

// Create PostgreSQL connection for Drizzle (only if DATABASE_URL is available)
let db: any = null;
if (databaseUrl) {
  try {
    const queryClient = postgres(databaseUrl);
    db = drizzle(queryClient, { schema });
    console.log('✅ PostgreSQL connection established');
  } catch (error) {
    console.error('❌ Failed to create PostgreSQL connection:', error);
  }
} else {
  console.warn("⚠️ DATABASE_URL not set. Database operations will be limited.");
}

// Create Supabase client for authentication and real-time features
let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized');
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
  }
} else {
  console.warn("⚠️ Supabase configuration incomplete. Authentication features may not work.");
}

export { db, supabase };