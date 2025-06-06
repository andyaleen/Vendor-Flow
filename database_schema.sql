-- VendorVault Database Schema for Supabase PostgreSQL
-- Run this SQL in your Supabase SQL Editor if you prefer manual setup

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Users table for chain sharing
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  business_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document sharing chains table
CREATE TABLE IF NOT EXISTS document_sharing_chains (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id),
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_id INTEGER NOT NULL REFERENCES users(id),
  share_token TEXT NOT NULL UNIQUE,
  share_reason TEXT,
  permissions JSONB NOT NULL,
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
  can_relay BOOLEAN,
  can_view_history BOOLEAN,
  max_chain_depth INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document provenance table
CREATE TABLE IF NOT EXISTS document_provenance (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id),
  original_uploader_id INTEGER NOT NULL REFERENCES users(id),
  chain_depth INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  is_original BOOLEAN DEFAULT true,
  last_shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sharing notifications table
CREATE TABLE IF NOT EXISTS sharing_notifications (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER NOT NULL REFERENCES users(id),
  to_user_id INTEGER NOT NULL REFERENCES users(id),
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  document_id INTEGER REFERENCES documents(id),
  chain_id INTEGER REFERENCES document_sharing_chains(id),
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_token ON onboarding_requests(token);
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_partner_id ON onboarding_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_documents_partner_id ON documents(partner_id);
CREATE INDEX IF NOT EXISTS idx_documents_request_id ON documents(request_id);
CREATE INDEX IF NOT EXISTS idx_sharing_chains_token ON document_sharing_chains(share_token);
CREATE INDEX IF NOT EXISTS idx_sharing_chains_document_id ON document_sharing_chains(document_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_granter ON user_sharing_permissions(granter_user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_grantee ON user_sharing_permissions(grantee_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_to_user ON sharing_notifications(to_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON sharing_notifications(to_user_id, is_read);

-- Insert sample data for testing
INSERT INTO partners (company_name, dba_name, tax_id, business_type, street, city, state, postal_code, country, primary_contact_name, primary_contact_title, primary_contact_email, primary_contact_phone, ar_contact_name, ar_contact_email) VALUES
('Sample Vendor Inc', 'Sample Vendor', '12-3456789', 'LLC', '123 Business St', 'New York', 'NY', '10001', 'USA', 'John Smith', 'CEO', 'john@samplevendor.com', '555-0123', 'Jane Doe', 'jane@samplevendor.com')
ON CONFLICT DO NOTHING;

INSERT INTO users (email, password, business_info) VALUES
('test@company.com', 'hashed_password', '{"company": "Test Company", "role": "Administrator"}'),
('vendor@supplier.com', 'hashed_password', '{"company": "Supplier Corp", "role": "Vendor"}'),
('partner@business.com', 'hashed_password', '{"company": "Business Partners", "role": "Partner"}')
ON CONFLICT DO NOTHING;

-- Add sample onboarding request
INSERT INTO onboarding_requests (token, onboarding_type_name, requester_company, requester_email, requested_fields, expires_at, status) VALUES
('sample-token-' || encode(gen_random_bytes(16), 'hex'), 'Basic Vendor Setup', 'Test Company', 'test@company.com', ARRAY['company_info', 'contact_info', 'w9', 'insurance', 'banking'], CURRENT_TIMESTAMP + INTERVAL '30 days', 'pending')
ON CONFLICT DO NOTHING;
