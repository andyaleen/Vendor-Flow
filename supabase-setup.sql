-- VendorVault Database Schema for Supabase PostgreSQL
-- This file sets up all required tables for the VendorVault application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and profile data
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL, -- Not used with Supabase auth but kept for schema compatibility
  first_name VARCHAR,
  last_name VARCHAR,
  company_name VARCHAR,
  role VARCHAR DEFAULT 'company_admin' NOT NULL, -- 'company_admin', 'vendor'
  is_email_verified BOOLEAN DEFAULT false,
  profile_image_url VARCHAR,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partners table (formerly vendors)
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  dba_name TEXT,
  tax_id TEXT NOT NULL,
  business_type TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  primary_contact_name TEXT NOT NULL,
  primary_contact_title TEXT NOT NULL,
  primary_contact_email TEXT NOT NULL,
  primary_contact_phone TEXT NOT NULL,
  ar_contact_name TEXT,
  ar_contact_email TEXT,
  username TEXT UNIQUE,
  password TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Onboarding requests table
CREATE TABLE IF NOT EXISTS onboarding_requests (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  onboarding_type_name TEXT NOT NULL,
  requester_company TEXT,
  requester_email TEXT NOT NULL,
  requested_fields TEXT[] NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  partner_id INTEGER REFERENCES partners(id),
  status TEXT NOT NULL DEFAULT 'pending',
  current_step INTEGER DEFAULT 1
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  request_id INTEGER REFERENCES onboarding_requests(id),
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
);

-- Onboarding consent tracking table
CREATE TABLE IF NOT EXISTS onboarding_consent (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES partners(id) NOT NULL,
  request_id INTEGER REFERENCES onboarding_requests(id) NOT NULL,
  document_type TEXT NOT NULL,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document sharing chains table
CREATE TABLE IF NOT EXISTS document_sharing_chains (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id),
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_id INTEGER NOT NULL REFERENCES users(id),
  parent_chain_id INTEGER REFERENCES document_sharing_chains(id),
  share_token TEXT NOT NULL UNIQUE,
  share_reason TEXT,
  permissions JSONB NOT NULL DEFAULT '{"canRelay": true, "canView": true, "canDownload": true}',
  expires_at TIMESTAMP,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'active'
);

-- User sharing permissions table
CREATE TABLE IF NOT EXISTS user_sharing_permissions (
  id SERIAL PRIMARY KEY,
  granter_user_id INTEGER NOT NULL REFERENCES users(id),
  grantee_user_id INTEGER NOT NULL REFERENCES users(id),
  document_types TEXT[] NOT NULL,
  can_relay BOOLEAN DEFAULT true,
  can_view_history BOOLEAN DEFAULT false,
  max_chain_depth INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'active'
);

-- Document provenance tracking table
CREATE TABLE IF NOT EXISTS document_provenance (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id),
  original_owner_id INTEGER NOT NULL REFERENCES users(id),
  current_holder_id INTEGER NOT NULL REFERENCES users(id),
  chain_depth INTEGER NOT NULL DEFAULT 0,
  access_path JSONB NOT NULL,
  last_shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_shares INTEGER DEFAULT 0,
  is_original BOOLEAN DEFAULT true
);

-- Sharing request notifications table
CREATE TABLE IF NOT EXISTS sharing_notifications (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_id INTEGER NOT NULL REFERENCES users(id),
  document_id INTEGER REFERENCES documents(id),
  chain_id INTEGER REFERENCES document_sharing_chains(id),
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for compatibility, though Supabase handles auth)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_partners_company_name ON partners(company_name);
CREATE INDEX IF NOT EXISTS idx_partners_primary_email ON partners(primary_contact_email);
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_token ON onboarding_requests(token);
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_status ON onboarding_requests(status);
CREATE INDEX IF NOT EXISTS idx_documents_partner_id ON documents(partner_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- Add updated_at trigger for users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some test data for development
INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, is_complete) 
VALUES 
  ('test@example.com', 'placeholder', 'Test', 'User', 'company_admin', true, false),
  ('admin@vendorflow.com', 'placeholder', 'Admin', 'User', 'company_admin', true, true)
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'VendorVault database schema setup completed successfully!' as message;
