# DRUGGA Jewelry Platform - Replit Development Guide

## Overview

DRUGGA Jewelry is a sophisticated pre-owned jewelry e-commerce platform specializing in authenticated vintage and designer pieces. The platform features AI-powered analysis for authentication, valuation, and automated product listing creation. Built with modern web technologies, it provides a premium shopping experience for jewelry enthusiasts.

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