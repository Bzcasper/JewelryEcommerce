# Luxury Jewelry Platform - Replit Development Guide

## Overview

A sophisticated pre-owned jewelry e-commerce platform specializing in authenticated vintage and designer pieces. The platform features AI-powered analysis for authentication, valuation, and automated product listing creation. Built with modern web technologies, it provides a premium shopping experience for jewelry enthusiasts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type-safe development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Radix UI primitives with shadcn/ui components for accessible, modern interface
- **Styling**: Tailwind CSS with custom luxury theme colors (pearl, charcoal, deep red, warm tan)
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple
- **Authentication**: Replit Auth integration with OIDC
- **API Design**: RESTful API architecture with comprehensive error handling

### Database Schema
The system uses PostgreSQL with the following core entities:
- **Products**: Core jewelry items with categories, materials, pricing, and condition ratings
- **Categories**: Jewelry types (rings, necklaces, earrings, bracelets, watches)
- **Materials**: Jewelry materials (gold, silver, platinum, diamond, pearl)
- **Brands**: Designer and brand information
- **Eras**: Historical periods for vintage pieces
- **Cart Items**: Session-based shopping cart functionality
- **Orders**: Purchase transactions and order management
- **Wishlist**: User favorites and saved items
- **AI Analyses**: AI-powered authentication and valuation results
- **Users**: User profiles and authentication data
- **Sessions**: PostgreSQL-based session storage

## Recent Changes

### CozyCommerce Complete Integration & React Hooks Fix (January 2025)
- Successfully integrated advanced search functionality with SearchBar component in Header
- Created enhanced Stripe checkout component for secure payment processing (mock implementation)
- Built comprehensive email service for order confirmations using nodemailer and React Email templates
- Developed enhanced shopping cart page with quantity management, tax calculation, and checkout flow
- Fixed critical React hooks error in ProductModal component by removing early return before hooks
- Updated ProductModal to use optional chaining (product?.field) for all product references
- All import errors resolved including Algolia search library compatibility issues
- Shopping cart fully integrated with Stripe checkout component and order management
- Email templates created for professional order confirmations with luxury jewelry branding

#### Comprehensive Page Integration from CozyCommerce:
- **Wishlist Page**: Complete wishlist functionality with product management and cart integration
- **Contact Page**: Professional contact form with business information and FAQ section
- **Blog System**: Full blog with article grid, detailed blog posts, categories, and newsletter signup
- **Blog Detail Pages**: Individual article pages with author bios, related articles, and social sharing
- **Error 404 Page**: Custom 404 page with helpful navigation and luxury jewelry theming
- **Mail Success Page**: Professional confirmation page for contact form submissions
- **Authentication Pages**: Complete sign-in and sign-up pages with Replit Auth integration
- **Admin Dashboard**: Comprehensive admin panel with analytics, recent orders, and quick actions
- **Admin Orders Management**: Full order management system with status tracking and customer details
- **Admin Products Management**: Product catalog management with filtering, search, and CRUD operations
- **Navigation Updates**: Header navigation updated with links to all new pages and features
- **UI Components**: Added all necessary shadcn/ui components (Badge, Table, Tabs, Checkbox)
- **Routing Integration**: Complete routing system with public routes, authenticated routes, and admin routes

### Modal AI Integration (January 2025)
- Successfully integrated user's Modal AI service (https://bzcasper--jewelry-ai-app-fastapi-app.modal.run) 
- Replaced mock setTimeout analysis with real AI processing in `server/routes.ts`
- Added `processModalAIAnalysis` function that converts uploaded images to base64 and calls Modal service
- Implemented proper error handling for Modal AI service calls with fallback status updates
- AI analysis now processes real jewelry images and returns authentic authentication results
- Status tracking: pending → processing → completed/failed with proper database updates
- Transform Modal results to match our database schema (materials, authenticity, condition, estimated value)
- Upload interface working correctly - entire drag-and-drop area serves as upload button
- All TypeScript errors resolved including JSONB array field handling for imageUrls

### Code Refactoring & Bug Fixes (January 2025)
- Successfully removed all "Drugga Curated Vintage Jewelry" branding from codebase
- Refactored `AIUpload.tsx` from 504 lines into 6 modular components for better maintainability:
  - `FileUploadArea.tsx` - File upload and preview component
  - `AnalysisForm.tsx` - Form fields for jewelry analysis
  - `AnalysisStatusCard.tsx` - Current analysis status display
  - `TipsCards.tsx` - Photography tips and AI process information
  - `RecentAnalysesList.tsx` - Recent analyses history
  - `useFileUpload.ts` - Custom hook for file handling logic
- Maintained `sidebar.tsx` as a complete UI library component (771 lines is appropriate for its comprehensive functionality)
- Fixed critical React hooks error in `ProductModal.tsx` by moving early return before hook calls
- Added sample jewelry products with authentic Unsplash images (6 luxury items)
- Successfully seeded database with real product data including categories, brands, eras, and materials
- Updated footer links to prevent 404 errors by pointing to existing pages
- Removed catch-all 404 routes to eliminate inappropriate 404 pages appearing under footer
- All existing functionality preserved while improving code organization and maintainability

### Database & TypeScript Fixes (January 2025)
- Fixed critical SelectItem error in `AnalysisForm.tsx` by changing empty string values to "unknown"
- Resolved all Drizzle ORM TypeScript errors in `server/storage.ts`:
  - Fixed query builder type inference issues by restructuring complex queries
  - Fixed insert operations to use array syntax for all create methods
  - Added proper null handling for cart item quantities
  - Fixed array field handling for JSONB fields (imageUrls in products and AI analyses)
  - Improved update operations to handle partial data and array fields safely
- Server is now running successfully with all database operations working correctly
- API endpoints are fully functional with proper error handling

## Key Components

### Authentication System
- **Replit Auth Integration**: Uses OIDC for secure authentication
- **Session Management**: PostgreSQL-based session storage with configurable TTL
- **User Management**: Profile management with optional fields
- **Authorization**: Route-level protection for authenticated features

### Product Management
- **Product Catalog**: Comprehensive product data with images, descriptions, and metadata
- **Category System**: Hierarchical organization by jewelry type
- **Material Tracking**: Multiple materials per product with relationships
- **Brand Management**: Designer and brand associations
- **Era Classification**: Historical period categorization for vintage pieces

### Shopping Experience
- **Product Discovery**: Advanced filtering by category, brand, era, price, and materials
- **Search Functionality**: Text-based product search
- **Shopping Cart**: Session-based cart with quantity management
- **Wishlist**: User favorites with persistence
- **Product Modal**: Detailed product view with image gallery and size selection

### AI Integration
- **Upload Interface**: Multi-file upload with drag-and-drop support
- **Analysis Pipeline**: AI-powered authentication, valuation, and categorization
- **Progress Tracking**: Real-time upload and analysis progress indicators
- **Result Management**: Structured analysis results with export capabilities
- **Modular Components**: Refactored into focused, reusable components for better maintainability

## Data Flow

1. **User Authentication**: Replit Auth → Session Creation → User Profile Management
2. **Product Browse**: Category/Filter Selection → API Query → Product Grid Display
3. **Product Details**: Product Selection → Modal Display → Add to Cart/Wishlist
4. **Shopping Cart**: Cart Management → Checkout Process → Order Creation
5. **AI Upload**: File Upload → Processing → Analysis Results → Product Creation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon Database
- **drizzle-orm**: Type-safe ORM with schema validation
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI primitives for consistent interface
- **wouter**: Lightweight routing for SPA navigation
- **react-hook-form**: Form management with validation
- **zod**: Runtime type validation for forms and API

### Development Dependencies
- **vite**: Build tool with hot module replacement
- **typescript**: Type safety across frontend and backend
- **tailwindcss**: Utility-first CSS framework
- **esbuild**: Fast JavaScript bundling for production

### Authentication
- **openid-client**: OIDC client for Replit Auth integration
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with Express backend integration
- **Database**: Neon Database with automatic migrations via Drizzle Kit
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS, ISSUER_URL
- **Build Process**: TypeScript compilation with Vite bundling

### Production Deployment
- **Build Command**: `npm run build` - Vite frontend build + esbuild backend bundling
- **Start Command**: `npm start` - Production server with compiled assets
- **Database Migration**: `npm run db:push` - Schema deployment to production database
- **Static Assets**: Served from dist/public directory
- **Session Storage**: PostgreSQL-based sessions for scalability

### Key Configuration Files
- **drizzle.config.ts**: Database configuration and migration settings
- **vite.config.ts**: Frontend build configuration with path aliases
- **tsconfig.json**: TypeScript configuration for shared types
- **tailwind.config.ts**: Custom theme configuration for luxury jewelry aesthetic