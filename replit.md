# VendorFlow - Vendor Onboarding Platform

## Overview

VendorFlow is a vendor onboarding platform that streamlines the process of collecting vendor information and documents. The system allows businesses to create onboarding requests, generate secure links for vendors to complete their information, and manage the entire vendor registration process through a multi-step workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

VendorFlow is built as a full-stack web application using a modern TypeScript stack with a clean separation between client and server concerns. The architecture follows a monorepo structure with shared schemas and types between frontend and backend.

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Uploads**: Multer for handling multipart form data
- **Storage**: In-memory storage implementation with interface for easy database migration

## Key Components

### Database Schema
The application uses three main tables:
1. **Vendors**: Stores complete vendor information including company details, addresses, and contact information
2. **Onboarding Requests**: Tracks onboarding sessions with tokens, expiration dates, and completion status
3. **Documents**: Manages uploaded files with metadata and associations to vendors/requests

### Multi-Step Onboarding Flow
1. **Request Creation**: Businesses create onboarding requests specifying required fields
2. **Company Information**: Vendors fill out comprehensive company and contact details
3. **Document Upload**: Vendors upload required documents (W-9, insurance certificates, banking info)
4. **Review & Submit**: Final review before submission

### API Structure
- `POST /api/onboarding-requests` - Create new onboarding request
- `GET /api/onboarding-requests/:token` - Retrieve request details
- `POST /api/onboarding-requests/:token/company-info` - Submit company information
- `POST /api/onboarding-requests/:token/documents` - Upload documents
- File handling with validation for PDF, DOC, DOCX, JPG, PNG formats (10MB limit)

## Data Flow

1. **Request Generation**: Business creates onboarding request → System generates secure token → Shareable link provided
2. **Vendor Onboarding**: Vendor accesses link → Multi-step form completion → Real-time progress tracking
3. **Data Persistence**: Form data saved to database → Documents stored with metadata → Progress tracking updated
4. **Completion**: Final review → Submission → Status update to completed

## External Dependencies

- **Database**: Neon Database (PostgreSQL) for production data storage
- **UI Components**: Extensive Shadcn/ui component library for consistent design
- **File Processing**: Multer for secure file upload handling
- **Validation**: Zod for runtime type checking and form validation
- **Date Handling**: date-fns for date manipulation and formatting

## Deployment Strategy

### Development
- Runs on Node.js 20 with hot reloading via Vite
- Development server on port 5000 with automatic restart
- PostgreSQL 16 module for database connectivity

### Production
- Build process: Vite builds client → ESBuild bundles server
- Deployment target: Autoscale infrastructure
- Static files served from Express with Vite middleware in development
- Environment variables for database connection and configuration

### Key Architectural Decisions

1. **Monorepo Structure**: Shared schemas and types between client/server eliminate code duplication and ensure type safety across the full stack

2. **Token-Based Security**: Secure random tokens for onboarding links with expiration dates provide security without requiring user authentication

3. **Progressive Form Completion**: Multi-step workflow with progress tracking improves user experience and allows for partial completion

4. **Interface-Based Storage**: Storage interface allows easy migration from in-memory to database persistence without changing business logic

5. **Type-Safe Database Operations**: Drizzle ORM with Zod schemas ensure compile-time and runtime type safety for all database operations

6. **Component-Based UI**: Shadcn/ui provides consistent, accessible components while maintaining customization flexibility with Tailwind CSS