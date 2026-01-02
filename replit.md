# MediPredict - Multimodal Explainable AI Disease Prediction System

## Overview

MediPredict is a clinical decision support system that predicts early disease risk using multimodal health data. The system provides explainable, uncertainty-aware predictions for Heart Disease, Diabetes, and Cancer with features like SHAP-based feature importance, counterfactual analysis, and bias detection.

The architecture follows a microservices pattern with a Node.js/Express API gateway orchestrating a Python ML service for machine learning inference. The frontend is a React dashboard displaying risk assessments, patient management, and explainability visualizations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with custom medical-themed color palette
- **Charts**: Recharts for risk gauges and feature importance visualizations
- **Build Tool**: Vite with custom Replit plugins

### Backend Architecture
- **API Gateway**: Express.js (Node.js/TypeScript)
- **ML Service**: FastAPI (Python) running on port 8000
- **Pattern**: The Node.js server acts as an orchestration layer, forwarding ML requests to the Python service via HTTP
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation

### Data Layer
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines patients, health records, and predictions tables
- **Migrations**: Drizzle Kit for schema migrations (`npm run db:push`)

### Key Design Decisions

1. **Microservices Split**: Node.js handles HTTP routing, authentication, and database operations while Python handles ML inference. This allows using Python's rich ML ecosystem (scikit-learn, SHAP) while keeping the web layer in TypeScript.

2. **Shared Types**: The `shared/` directory contains schemas and route definitions used by both frontend and backend, ensuring type safety across the stack.

3. **Explainability First**: The prediction schema includes dedicated fields for SHAP values, bias analysis, uncertainty scores, and counterfactual recommendations - treating explainability as a core feature rather than an afterthought.

4. **Multimodal Data Support**: Health records schema supports tabular clinical data, ECG time-series, medical images, and report text for NLP processing.

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with PostgreSQL dialect

### ML Service
- **FastAPI/Uvicorn**: Python web framework for ML inference endpoints
- **scikit-learn**: Machine learning models (RandomForest, XGBoost planned)
- **SHAP**: Feature importance and explainability
- **pandas/numpy**: Data processing

### Frontend Libraries
- **@tanstack/react-query**: Data fetching and caching
- **Radix UI**: Accessible UI primitives (dialogs, dropdowns, forms)
- **Recharts**: Data visualization
- **axios**: HTTP client for API calls

### Infrastructure
- **Vite**: Frontend build and dev server with HMR
- **esbuild**: Server bundling for production
- **connect-pg-simple**: PostgreSQL session storage (if sessions needed)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `ML_SERVICE_URL`: Python ML service URL (defaults to `http://0.0.0.0:8000`)