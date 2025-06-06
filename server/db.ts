import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL not set. Application will use in-memory storage. Set DATABASE_URL to use persistent database storage."
  );
}

// Create PostgreSQL connection for Drizzle (only if DATABASE_URL is available)
let db: any = null;
if (process.env.DATABASE_URL) {
  const queryClient = postgres(process.env.DATABASE_URL);
  db = drizzle(queryClient, { schema });
}
export { db };

// Create Supabase client for authentication and real-time features (optional)
let supabase: any = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
} else {
  console.warn("Supabase authentication variables not set. Supabase client will not be available.");
}

export { supabase };