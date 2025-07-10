# Digital Marketing Carbon Calculator

## Overview

This is a comprehensive digital marketing carbon emissions calculator built with React and Express. The application helps users estimate the CO₂e emissions of their digital marketing campaigns, considering factors like impressions, platform choice, AI-generated assets, cloud storage, and campaign spend. It provides detailed insights into emissions per dollar spent and per impression.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks for local state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Pattern**: RESTful API with `/api` prefix

### Development Environment
- **Development Server**: Vite dev server with HMR
- **Production Build**: ESBuild for server bundling, Vite for client
- **Type Checking**: TypeScript with strict mode enabled
- **Code Quality**: ESLint and Prettier (implied by shadcn/ui setup)

## Key Components

### Carbon Calculation Engine
- **Updated Platform Emission Factors**: Research-based factors for 10 platforms:
  - Google Search: 0.2g CO₂e per impression
  - Google Display: 0.5g CO₂e per impression  
  - YouTube: 0.6g CO₂e per impression (30-second ad)
  - Meta/Facebook: 0.5g CO₂e per impression
  - TikTok: 0.3g CO₂e per impression
  - Microsoft Bing: 0.2g CO₂e per impression
  - Pinterest: 0.5g CO₂e per impression
  - Reddit: 0.5g CO₂e per impression
  - LinkedIn: 0.5g CO₂e per impression
  - Programmatic: 0.51g CO₂e per impression
- **AI Asset Calculations**: Separate factors for AI-generated images (2g), text (based on tokens), and video content
- **Storage Calculations**: Cloud storage emissions with green cloud reduction options
- **Device Usage**: Laptop usage emissions factored into calculations

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Built on Radix UI primitives for screen reader compatibility
- **Theme Support**: CSS variables for light/dark mode theming
- **Interactive Elements**: Sliders, checkboxes, dropdowns for user inputs
- **Results Visualization**: Breakdown of emissions by category with color coding

### Data Management
- **Local Storage**: Form state persisted across sessions
- **Real-time Calculations**: Updates as users modify inputs
- **Export Functionality**: Results can be downloaded for reporting

## Data Flow

1. **User Input**: Users enter campaign parameters through form controls
2. **Real-time Calculation**: Each input change triggers recalculation using predefined emission factors
3. **Results Display**: Calculated emissions are broken down by category and displayed with visual indicators
4. **Data Persistence**: User preferences and recent calculations stored locally
5. **Export Options**: Users can download detailed reports of their calculations

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL for production scalability
- **Drizzle ORM**: Type-safe database operations with automatic migrations
- **Connection Pooling**: Built-in connection management for serverless environments

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Consistent iconography throughout the application
- **shadcn/ui**: Pre-built component library with customizable styling

### Development Tools
- **Replit Integration**: Native support for Replit development environment
- **Cartographer**: Development-time dependency tracking
- **Runtime Error Overlay**: Enhanced error reporting in development

## Deployment Strategy

### Build Process
- **Client Build**: Vite optimizes React application for production
- **Server Build**: ESBuild bundles Express server with external dependencies
- **Asset Optimization**: Automatic code splitting and tree shaking

### Environment Configuration
- **Database URL**: Environment variable for database connection
- **Development Mode**: Conditional feature loading based on NODE_ENV
- **Replit Detection**: Special handling for Replit deployment environment

### Production Considerations
- **Static Asset Serving**: Express serves optimized client bundle
- **API Route Separation**: Clear separation between API and static routes
- **Error Handling**: Comprehensive error boundaries and logging
- **Session Management**: PostgreSQL-backed sessions for user state

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 02, 2025. Initial setup
- July 07, 2025. Updated platform emission factors based on latest research:
  - Reduced emission factors significantly (from 3-60g to 0.2-0.6g per impression) 
  - Added 5 new platforms (Bing, Pinterest, Reddit, LinkedIn, separate Google Display)
  - Consolidated 40+ academic and industry sources in methodology section
  - Updated calculations reflect more accurate, research-based emission factors