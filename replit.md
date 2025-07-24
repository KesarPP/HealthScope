# HealthScope - Health and Wellness Management Platform

## Overview

HealthScope is a comprehensive health and wellness management platform built as a single-page React application. The application provides users with tools for tracking vital signs, monitoring mood, accessing emergency contacts, and interacting with an AI health assistant named "Sakhi." The system integrates with Google's Gemini AI to provide personalized health insights and recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.
Dashboard interface: User requested organized buttons on dashboard instead of direct display and report generation functionality after vitals examination.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using functional components and hooks
- **Build Tool**: Vite for development and bundling
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks (useState, useEffect) and TanStack React Query for server state
- **UI Components**: Radix UI primitives with custom styling via shadcn/ui

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Structure**: RESTful endpoints for health data analysis and AI interactions
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload with Vite middleware integration

### Database Strategy
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: @neondatabase/serverless for serverless PostgreSQL connections

## Key Components

### Health Tracking Features
1. **Vitals Tracking**: Input and analysis of heart rate, blood pressure, temperature, and oxygen saturation
2. **Mood Tracking**: Mood selection with AI-generated activity recommendations
3. **Emergency Contacts**: Static display of important emergency contact numbers
4. **AI Chatbot (Sakhi)**: Interactive health assistant powered by Gemini AI

### User Interface Components
- Responsive single-page application design with dashboard-based navigation
- Mobile-first approach with Tailwind CSS breakpoints
- Component-based architecture using shadcn/ui
- Conditional section rendering based on active navigation state
- Organized dashboard with action buttons for each feature section
- Health report generation and download functionality
- Form handling with proper validation and error states
- Loading states and error handling for AI interactions

### API Integration
- **Gemini AI**: Integration with Google's gemini-2.0-flash model for:
  - Vital signs analysis and health recommendations
  - Mood-based activity suggestions
  - Interactive chat responses
- **Error Handling**: Comprehensive try-catch blocks with user-friendly error messages

## Data Flow

### Vitals Analysis Flow
1. User inputs vital signs through form interface
2. Frontend validates input and sends POST request to `/api/vitals/analyze`
3. Backend processes data and calls Gemini AI for analysis
4. AI response is formatted and returned to frontend
5. Results displayed with timestamp and recommendations

### Mood Tracking Flow
1. User selects mood from predefined options
2. Frontend sends POST request to `/api/mood/recommendations`
3. Backend queries Gemini AI for mood-appropriate activities
4. Personalized recommendations returned and displayed

### Chat Interface Flow
1. User types question in chat input
2. Frontend sends POST request to `/api/chat/sakhi`
3. Backend processes query through Gemini AI
4. Real-time response displayed in chat history
5. Loading states managed during AI processing

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI SDK for health insights and chat functionality
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Database ORM with PostgreSQL support
- **@neondatabase/serverless**: Serverless PostgreSQL connection

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for components
- **lucide-react**: Icon library for consistent iconography

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React application to static assets in `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses Vite dev server with Express middleware
- **Production**: Serves static files through Express with compiled backend
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **AI Integration**: Requires `GEMINI_API_KEY` for Google AI services

### File Structure
```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

### Development Workflow
- Uses TypeScript for type safety across frontend and backend
- Drizzle ORM with PostgreSQL for data persistence
- Real-time development with Vite HMR
- Component-driven development with shadcn/ui
- API-first approach with clear separation of concerns

The application is designed to be easily deployable on platforms that support Node.js applications with PostgreSQL databases, with particular optimization for serverless environments like Replit.