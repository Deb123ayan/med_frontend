# 🏥 Health Insights (Arogya-AI) — Complete Repository Reference

A full-stack AI-powered disease prediction system with a React/TypeScript frontend and a Django backend. Designed as a **doctor portal** for medical professionals to analyze patient data, generate explainable risk predictions, and perform counterfactual "what-if" analysis.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Layout](#2-repository-layout)
3. [Frontend — Pages](#3-frontend--pages)
4. [Frontend — Components](#4-frontend--components)
5. [Frontend — Hooks](#5-frontend--hooks)
6. [Frontend — State Management](#6-frontend--state-management)
7. [Shared Types and API Routes](#7-shared-types-and-api-routes)
8. [API Endpoints](#8-api-endpoints)
9. [Configuration Files](#9-configuration-files)
10. [Styling](#10-styling)
11. [Routing](#11-routing)
12. [Dependencies](#12-dependencies)
13. [NPM Scripts](#13-npm-scripts)
14. [Environment Variables](#14-environment-variables)
15. [Quick Start](#15-quick-start)
16. [Testing](#16-testing)
17. [Build and Deployment](#17-build-and-deployment)
18. [Key Design Decisions](#18-key-design-decisions)
19. [Project Statistics](#19-project-statistics)

---

## 1. Project Overview

**Health Insights / Arogya-AI** is a multimodal medical AI assistant. Doctors log in and:

- Submit patient data (clinical values, ECG time-series, medical images, text reports).
- Receive a disease risk score (0–100 %) for Heart Disease, Diabetes, or Cancer (6 sub-types).
- Inspect explainability data: SHAP-based feature importance, bias analysis (gender / age), and causal counterfactuals ("change BMI from 32 → 25 to reduce risk by 18 %").
- Browse a patient directory and historical predictions.

**Tech stack at a glance**

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 7 |
| UI library | Shadcn/ui (Radix UI primitives) + Tailwind CSS 3.4 |
| State / data | TanStack React Query 5 + React Context |
| Router | Wouter 3 |
| Charts | Recharts 2 |
| Forms | React Hook Form 7 + Zod 3 |
| Backend | Django + Django REST Framework |
| ML | Python RandomForest + SHAP (96–98 % accuracy) |
| DB (dev) | SQLite |
| DB (prod) | PostgreSQL |
| Auth | Token-based (Django REST Framework `Token`) |

---

## 2. Repository Layout

```
med_frontend/
├── client/                        # React frontend application
│   ├── index.html                 # Vite HTML entry point
│   ├── requirements.md            # Frontend notes
│   └── src/
│       ├── main.tsx               # ReactDOM.createRoot entry
│       ├── App.tsx                # Provider tree + Wouter router
│       ├── index.css              # Tailwind base + custom utilities
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── NewAssessment.tsx
│       │   ├── Patients.tsx
│       │   ├── PredictionReport.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   └── not-found.tsx
│       ├── components/
│       │   ├── Layout.tsx
│       │   ├── ProtectedRoute.tsx
│       │   ├── StatCard.tsx
│       │   ├── RiskGauge.tsx
│       │   ├── AuthDebug.tsx
│       │   └── ui/                # 50+ Shadcn/ui primitives
│       ├── contexts/
│       │   └── AuthContext.tsx
│       ├── hooks/
│       │   ├── use-medical.ts
│       │   ├── use-toast.ts
│       │   └── use-mobile.tsx
│       └── lib/
│           ├── queryClient.ts
│           └── utils.ts
│
├── shared/                        # Shared between frontend and backend
│   ├── schema.ts                  # Drizzle ORM table schemas + Zod validators
│   └── routes.ts                  # Typed API route map + buildUrl helper
│
├── script/
│   └── build.ts                   # Build helper script
│
├── attached_assets/               # Design prompts / reference images (not shipped)
├── staticfiles/                   # Django `collectstatic` output (admin CSS/JS)
│
├── package.json                   # Node dependencies and npm scripts
├── package-lock.json
├── tsconfig.json                  # TypeScript compiler config
├── vite.config.ts                 # Vite build + dev-server config
├── tailwind.config.ts             # Tailwind theme
├── postcss.config.js              # PostCSS (Tailwind + Autoprefixer)
├── components.json                # Shadcn/ui CLI config
│
├── .env                           # Django runtime secrets (not committed in prod)
├── .gitignore
├── .replit                        # Replit workspace config
├── .local/                        # Replit metadata
│
├── README.md                      # ← this file
├── README_DEVELOPMENT.md          # Step-by-step dev setup
├── REORGANIZATION_COMPLETE.md     # Notes on backend folder restructure
├── FRONTEND_BACKEND_FIX.md        # API endpoint fix notes
├── FINAL_API_FIX.md               # Latest API fix notes
├── API_FORMAT_FIX.md              # camelCase/snake_case compat notes
├── replit.md                      # Replit-specific instructions
│
├── start.bat                      # Windows: start frontend + backend
├── start_frontend.bat             # Windows: React only
├── start_backend.bat              # Windows: Django only
├── start_dev.py                   # Cross-platform Python starter
└── test_frontend_connection.html  # Browser-based API connectivity test
```

---

## 3. Frontend — Pages

### `Dashboard.tsx`

Main landing page after login.

- **Layout**: 4-column stat grid (collapses to 2 on mobile) + recent-assessments table.
- **Data**: `usePredictions()` + `usePatients()` from TanStack Query.
- **Stat cards**: Total Patients, High Risk Cases, Average Confidence, Recent Assessments.
- **Calls to action**: "New Assessment" button routes to `/assess`.
- **Mobile**: uses `useIsMobile()` hook to adjust padding and column counts.

### `NewAssessment.tsx`

Multi-step wizard for creating a new patient assessment and triggering an ML prediction.

- **Step 1 — Disease selection**: Cancer (Breast, Lung, Colorectal, Prostate, Skin, Brain), Heart Disease, Diabetes.
- **Step 2 — Patient info**: name, age, gender, medical history.
- **Step 3 — Clinical data**: 40+ dynamic fields that change based on the selected cancer type (e.g., PSA level for Prostate, CA-125 for Ovarian).
- **Step 4 — Image upload**: drag-and-drop or file picker; images are base64-encoded before sending.
- **Step 5 — Review & Submit**: summary before calling `useCreatePrediction()` mutation.
- **On success**: redirects to `/predictions/:id` with the new report.

### `PredictionReport.tsx`

Full explainability report for a single prediction.

| Section | Content |
|---|---|
| Risk Assessment | Semicircular `RiskGauge` (0–100 %) + risk category badge |
| Feature Importance | Recharts horizontal bar chart of top SHAP / feature-importance values |
| Bias Analysis | Gender bias score, age bias score, optional fairness warning |
| Counterfactual Analysis | Interactive slider → calls `useCounterfactual()` → shows hypothetical new risk |
| Clinical Recommendations | Model-generated text advice |
| Confidence Metrics | Confidence %, uncertainty % (Monte Carlo Dropout / ensemble variance) |

Handles both old (camelCase) and new (snake_case) response formats transparently.

### `Patients.tsx`

Patient directory.

- Search input (filters by patient name in real time).
- Responsive card grid: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop).
- Each card shows: name, age, gender, registration date, and a "New Assessment" shortcut.

### `Login.tsx`

Doctor authentication form.

- Fields: `username`, `password`.
- Calls `AuthContext.login()` → `POST /api/auth/login/`.
- On success: stores `auth_token` and `doctor_data` in `localStorage`, redirects to `/`.
- Displays inline error messages on failure.
- Link to `/register`.

### `Register.tsx`

Doctor account creation form.

- Fields: `username`, `password` (min 8 chars), `email`, `first_name`, `last_name`, `medical_license`, `specialization`, `hospital_affiliation`, `phone`.
- Calls `AuthContext.register()` → `POST /api/auth/register/`.
- On success: shows a "pending verification" message (accounts require admin approval).

### `not-found.tsx`

404 page with a centered alert icon and short message.

---

## 4. Frontend — Components

### `Layout.tsx`

Master wrapper used by every protected page.

- **Desktop**: fixed left sidebar (240 px) with nav items and doctor profile dropdown.
- **Mobile**: sticky top header with hamburger button that opens a full-screen drawer.
- **App name**: "Arogya-AI" displayed in the header.
- **Nav items**: Dashboard, Patients, New Assessment.
- **Logout**: calls `AuthContext.logout()` → `POST /api/auth/logout/` → clears localStorage → redirects to `/login`.

### `ProtectedRoute.tsx`

Wraps any page that requires authentication. Reads `isLoading` and `doctor` from `AuthContext`. Shows a spinner while loading; renders `null` (empty) if unauthenticated (the router handles redirect to `/login`).

### `StatCard.tsx`

Reusable KPI card.

Props: `label`, `value`, `icon` (Lucide React), `color` (`blue | emerald | amber | rose`), optional `trend` (`{ direction: "up"|"down", value: number }`).

### `RiskGauge.tsx`

Semicircular gauge built on a Recharts `PieChart` (half-donut technique).

- Colour zones: green (0–33 %), orange (34–66 %), red (67–100 %).
- Centred percentage label.
- Accepts `value` (0–100) and `label` props.

### `AuthDebug.tsx`

Development-only debug panel fixed to the bottom-right corner. Shows a coloured indicator dot and the result of a test API call, so developers can verify proxy and CORS settings without opening DevTools.

### `ui/` (Shadcn/ui primitives)

50+ generated components based on Radix UI, including: `accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `button`, `calendar`, `card`, `carousel`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle`, `toggle-group`, `tooltip`.

---

## 5. Frontend — Hooks

### `use-medical.ts`

All data-fetching and mutation hooks. Uses `api` and `buildUrl` from `shared/routes.ts`.

| Hook | Method | Path | Notes |
|---|---|---|---|
| `usePatients()` | GET | `/api/patients/` | Lists all patients |
| `usePatient(id)` | GET | `/api/patients/:id/` | Single patient; returns `null` on 404 |
| `useCreatePatient()` | POST | `/api/patients/` | Invalidates patient list on success |
| `usePredictions()` | GET | `/api/predictions/` | Lists all predictions |
| `usePrediction(id)` | GET | `/api/predictions/:id` | Single prediction; returns `null` on 404 |
| `useCreatePrediction()` | POST | `/api/predictions/predict/` | Invalidates predictions list on success |
| `useCounterfactual()` | POST | `/api/predictions/:id/counterfactual` | Returns hypothetical prediction |

**Auth headers**: currently sends only `Content-Type: application/json` (token not yet threaded into these hooks — managed separately in `AuthContext`).

### `use-toast.ts`

Lightweight toast notification system using a reducer pattern.

- `toast({ title, description, variant })` — shows a toast.
- `dismiss(toastId?)` — dismisses one or all toasts.
- Maximum 1 visible toast at a time (configurable via `TOAST_LIMIT`).
- Auto-remove delay: 1 000 000 ms (~16.7 minutes) — so large that toasts persist until manually dismissed.

### `use-mobile.tsx`

Returns `true` when viewport width < 768 px. Uses `window.matchMedia("(max-width: 767px)")` with an event listener for live updates.

---

## 6. Frontend — State Management

### Architecture layers

| Layer | Tool | Scope |
|---|---|---|
| Server / remote state | TanStack React Query | Patients, Predictions |
| Auth state | React Context (`AuthContext`) | Global |
| UI / form state | Component `useState` / React Hook Form | Local |
| Toasts | Custom reducer in `use-toast` | Global |
| Theme | `next-themes` | Global (dark/light — configured but not surfaced in UI yet) |

### `AuthContext` internals

```
localStorage keys:
  auth_token   → Django REST Framework token string
  doctor_data  → JSON-serialised Doctor object

Doctor shape:
  { id, username, first_name, last_name, email,
    specialization, hospital_affiliation,
    is_verified, patient_count? }

Methods:
  login(username, password)  → POST /api/auth/login/
  register(data)             → POST /api/auth/register/
  logout()                   → POST /api/auth/logout/ + clear localStorage
```

### `queryClient.ts` internals

```
staleTime:           Infinity   (data never goes stale automatically)
refetchInterval:     false      (no polling)
refetchOnWindowFocus: false     (no refetch on tab switch)
retry:               false      (fail immediately on error)
on401:               "throw"    (propagate 401 to caller)
```

---

## 7. Shared Types and API Routes

### `shared/schema.ts`

Drizzle ORM table definitions (PostgreSQL dialect) + Zod insert schemas + TypeScript inferred types.

#### `patients` table

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | auto-increment |
| `name` | text | not null |
| `age` | integer | not null |
| `gender` | text | `'Male' \| 'Female' \| 'Other'` |
| `medicalHistory` | jsonb | `string[]` of condition names |
| `createdAt` | timestamp | defaults to `now()` |

#### `healthRecords` table

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `patientId` | integer FK | references `patients.id` |
| `clinicalData` | jsonb | `Record<string, number>` — e.g. `{ glucose: 126, bmi: 31.5 }` |
| `ecgData` | jsonb | `number[]` — ECG signal sample points |
| `imageMetadata` | jsonb | `{ url, type, findings?, scanType: "MRI"\|"X-ray"\|"CT" }` |
| `reportText` | text | Free-text clinical note |
| `createdAt` | timestamp | |

#### `predictions` table

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `patientId` | integer FK | |
| `disease` | text | `'Heart Disease' \| 'Diabetes' \| 'Cancer'` |
| `riskScore` | double precision | 0–100 |
| `riskCategory` | text | `'Low' \| 'Medium' \| 'High'` |
| `confidence` | double precision | 0–1 |
| `uncertainty` | double precision | 0–1 — Monte Carlo Dropout / ensemble variance |
| `topFeatures` | jsonb | `Array<{ feature, value, importance, contribution: "positive"\|"negative" }>` |
| `biasAnalysis` | jsonb | `{ genderBias, ageBias, fairnessWarning? }` |
| `causalCounterfactuals` | jsonb | `Array<{ feature, originalValue, suggestedValue, impactOnRisk }>` |
| `createdAt` | timestamp | |

#### Extra API types

```typescript
PredictionRequest  // sent by NewAssessment.tsx
CounterfactualRequest  // sent by PredictionReport.tsx
PredictionResponse // Prediction & { patient: Patient }
```

### `shared/routes.ts`

Typed API route map consumed by `use-medical.ts`. Every route has `method`, `path`, `input` (Zod schema), and typed `responses` map.

```
api.patients.list           GET  /api/patients/
api.patients.create         POST /api/patients/
api.patients.get            GET  /api/patients/:id/
api.predictions.predict     POST /api/predictions/predict/
api.predictions.get         GET  /api/predictions/:id
api.predictions.list        GET  /api/predictions/
api.predictions.counterfactual  POST /api/predictions/:id/counterfactual
```

`buildUrl(path, params)` replaces `:param` placeholders with actual values.

---

## 8. API Endpoints

### Authentication

```
POST /api/auth/login/
  Body:     { username, password }
  Response: { token: string, doctor: Doctor }

POST /api/auth/register/
  Body:     { username, password, email, first_name, last_name,
              medical_license, specialization, hospital_affiliation, phone }
  Response: { doctor: Doctor, message: "pending verification" }

POST /api/auth/logout/
  Headers:  Authorization: Token <token>
  Response: 200 OK
```

### Patients

```
GET  /api/patients/       → Patient[]
POST /api/patients/       → Patient (201)
GET  /api/patients/:id/   → Patient | 404
```

### Predictions

```
POST /api/predictions/predict/
  Body: {
    patient_id?:      number,
    patient_data?:    InsertPatient,
    clinical_data:    Record<string, number | string>,
    ecg_data?:        number[],
    report_text?:     string,
    image_metadata?:  { url, type, scanType },
    medical_images?:  Array<{ filename, scanType, bodyPart, description?, imageData }>,
    disease:          'Heart Disease' | 'Diabetes' | 'Cancer'
  }
  Response: Prediction (201)

GET  /api/predictions/         → Prediction[]
GET  /api/predictions/:id      → Prediction | 404

POST /api/predictions/:id/counterfactual
  Body:     { changes: Record<string, number | string> }
  Response: Prediction (hypothetical, 200)
```

### ML Service (optional direct access)

```
GET  /ml/health/           Health check
GET  /ml/models/           List loaded ML models
POST /ml/predict/          Single prediction (direct ML)
POST /ml/predict/batch/    Batch predictions
```

---

## 9. Configuration Files

### `vite.config.ts`

- **Root**: `client/` directory.
- **Aliases**: `@` → `client/src`, `@shared` → `shared`, `@assets` → `attached_assets`.
- **Dev server proxy**: `/api/*` and `/ml/*` forwarded to `http://localhost:8000`.
- **Build output**: `client/dist/`.
- **Dev-only plugins**: `@replit/vite-plugin-runtime-error-modal` (always), `cartographer` + `devBanner` (Replit env only).
- **FS restrictions**: `strict: true`, dotfiles denied.

### `tsconfig.json`

- **Module system**: ESNext.
- **JSX**: preserve (Vite handles transform).
- **Lib**: ESNext, DOM, DOM.iterable.
- **Strict mode**: disabled (`strict: false`).
- **Paths**: `@/*` → `client/src/*`, `@shared/*` → `shared/*`.
- **No emit** (Vite handles transpilation).

### `tailwind.config.ts`

- **Dark mode**: class-based (`class` strategy).
- **Content paths**: `client/src/**/*.{ts,tsx}`.
- **Theme extension**:
  - Colors: HSL CSS variables for `primary`, `secondary`, `accent`, `destructive`, `muted`, `popover`, `card`, `sidebar-*`, `chart-1…5`.
  - Border radius: `lg` = 9 px, `md` = 6 px, `sm` = 3 px.
  - Fonts: `display` = Plus Jakarta Sans, `body` = Inter.
  - Custom keyframes: `accordion-down`, `accordion-up`.
- **Plugins**: `tailwindcss-animate`, `@tailwindcss/typography`.

### `postcss.config.js`

Runs Tailwind CSS and Autoprefixer.

### `components.json` (Shadcn/ui CLI)

- **Style**: New York.
- **Tailwind config file**: `tailwind.config.ts`.
- **CSS variables**: enabled.
- **Base colour**: neutral.
- **CSS file**: `client/src/index.css`.
- **Aliases**: `@/components`, `@/lib/utils`, `@/hooks`, `@/components/ui`.

### `.env` (backend runtime — do not commit to production)

```env
SECRET_KEY=django-insecure-change-me-in-production
DEBUG=True
```

---

## 10. Styling

### Design tokens (`index.css`)

All colours are defined as HSL CSS variables on `:root` and overridden under `.dark`. Tailwind reads them via `hsl(var(--color-name))`.

Key custom utilities:

```css
.glass-card   /* backdrop-blur + semi-transparent white background */
```

### Typography

- **Headings**: Plus Jakarta Sans (loaded via font stack or external font).
- **Body text**: Inter.

### Responsive breakpoints (Tailwind defaults)

| Prefix | Min-width | Usage in this project |
|---|---|---|
| (none) | 0 px | Mobile base styles |
| `sm:` | 640 px | Occasionally used |
| `md:` | 768 px | Main desktop threshold |
| `lg:` | 1024 px | Large desktop adjustments |

### Touch-target compliance

Interactive elements have a minimum height of 44 px on mobile screens to meet WCAG 2.5.5.

---

## 11. Routing

Router: **Wouter** (client-side only, no server-side rendering).

| Path | Component | Protected |
|---|---|---|
| `/login` | `Login` | No |
| `/register` | `Register` | No |
| `/` | `Dashboard` | Yes* |
| `/assess` | `NewAssessment` | Yes* |
| `/predictions/:id` | `PredictionReport` | Yes* |
| `/patients` | `Patients` | Yes* |
| `*` | `not-found` | — |

\* `ProtectedRoute` wrapper exists but the guard is currently bypassed in `App.tsx` (`// Skip authentication for now`). All routes are accessible without a token during development.

---

## 12. Dependencies

### Production dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.3.1 | UI library |
| `react-dom` | 18.3.1 | DOM renderer |
| `@tanstack/react-query` | 5.60.5 | Server state / data fetching |
| `wouter` | 3.3.5 | Client-side router |
| `zod` | 3.24.2 | Schema validation |
| `drizzle-orm` | 0.45.1 | ORM schema definitions (shared types) |
| `drizzle-zod` | 0.8.3 | Drizzle → Zod schema bridge |
| `react-hook-form` | 7.55.0 | Form state management |
| `@hookform/resolvers` | 3.10.0 | Zod adapter for react-hook-form |
| `axios` | 1.13.2 | HTTP client (used alongside fetch) |
| `recharts` | 2.15.4 | Charts (bar, pie/gauge) |
| `lucide-react` | 0.453.0 | Icon set |
| `framer-motion` | 11.18.2 | Animation library |
| `date-fns` | 3.6.0 | Date formatting |
| `next-themes` | 0.4.6 | Dark / light theme toggle |
| `tailwind-merge` | 2.6.0 | Safe Tailwind class merging |
| `clsx` | 2.1.1 | Conditional className helper |
| `class-variance-authority` | 0.7.1 | Component variant system |
| `tailwindcss-animate` | 1.0.7 | Tailwind animation utilities |
| `tw-animate-css` | 1.2.5 | Additional animation utilities |
| `cmdk` | 1.1.1 | Command-palette primitive |
| `vaul` | 1.1.2 | Drawer primitive |
| `embla-carousel-react` | 8.6.0 | Carousel component |
| `input-otp` | 1.4.2 | OTP input component |
| `react-day-picker` | 8.10.1 | Calendar / date picker |
| `react-icons` | 5.4.0 | Additional icon sets |
| `react-resizable-panels` | 2.1.7 | Resizable panel layouts |
| `@radix-ui/*` | various | 25+ accessible headless UI primitives |

### Dev dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | 7.3.0 | Build tool and dev server |
| `@vitejs/plugin-react` | 4.7.0 | Vite React Fast Refresh plugin |
| `typescript` | 5.6.3 | Type checker |
| `tailwindcss` | 3.4.17 | CSS framework |
| `postcss` | 8.4.47 | CSS processor |
| `autoprefixer` | 10.4.20 | Vendor prefixes |
| `@tailwindcss/typography` | 0.5.15 | Prose / typography plugin |
| `@tailwindcss/vite` | 4.1.18 | Tailwind v4 Vite integration (installed but v3 config is active) |
| `@types/react` | 18.3.11 | React type definitions |
| `@types/react-dom` | 18.3.1 | ReactDOM type definitions |
| `@replit/vite-plugin-*` | various | Replit dev tooling |

---

## 13. NPM Scripts

```jsonc
"dev"              // vite                        — start dev server on :5173
"dev:backend"      // python manage.py runserver  — start Django on :8000
"dev:frontend"     // vite                        — alias for dev
"build"            // vite build                  — production build → client/dist/
"preview"          // vite preview                — serve production build locally
"check"            // tsc                         — TypeScript type-check (no emit)
"migrate"          // python manage.py migrate
"makemigrations"   // python manage.py makemigrations
"createsuperuser"  // python manage.py createsuperuser
```

---

## 14. Environment Variables

### Backend (`.env` in project root)

```env
SECRET_KEY=django-insecure-change-me-in-production
DEBUG=True
```

Create `backend/.env` for the Django project settings if the backend looks there instead.

### Frontend

No `.env` file is needed for local development. Vite proxies `/api/*` and `/ml/*` to `http://localhost:8000`.

For production, either update the proxy target in `vite.config.ts` or use absolute API URLs.

### Runtime localStorage keys

| Key | Value |
|---|---|
| `auth_token` | Django REST Framework token string |
| `doctor_data` | JSON-encoded `Doctor` object |

---

## 15. Quick Start

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- pip

### Option A — Startup scripts (Windows)

```bat
start.bat            :: starts both frontend and backend
start_backend.bat    :: Django only
start_frontend.bat   :: React only
```

### Option B — Cross-platform Python starter

```bash
python start_dev.py
```

### Option C — Manual

```bash
# Terminal 1 — Django backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver          # http://localhost:8000

# Terminal 2 — React frontend
npm install
npm run dev                         # http://localhost:5173
```

### Access points

| Service | URL |
|---|---|
| React app (hot reload) | http://127.0.0.1:5173 |
| Django REST API | http://127.0.0.1:8000/api/ |
| Django admin panel | http://127.0.0.1:8000/admin/ (default: admin / admin123) |
| ML service | http://127.0.0.1:8000/ml/ |

---

## 16. Testing

### Backend

```bash
cd backend
python test_api.py            # Main Django API integration tests
python test_ml_api.py         # ML service tests
python test_camelcase_api.py  # camelCase/snake_case compatibility tests
```

### Frontend connectivity

Open `test_frontend_connection.html` directly in a browser while the dev server is running to verify `/api/patients/` and `/api/predictions/` respond correctly.

### TypeScript type check

```bash
npm run check
```

---

## 17. Build and Deployment

### Frontend build

```bash
npm run build
# Output: client/dist/  (static HTML + JS + CSS)
# Deploy to any static host: Netlify, Vercel, S3 + CloudFront, etc.
```

### Backend build

```bash
cd backend
pip install -r requirements.txt
python manage.py collectstatic      # copies staticfiles/ to STATIC_ROOT
python manage.py migrate
gunicorn health_insights.wsgi:application
```

### Production checklist

- [ ] Replace `SECRET_KEY` with a securely generated value.
- [ ] Set `DEBUG=False`.
- [ ] Set `ALLOWED_HOSTS` to your domain(s).
- [ ] Configure CORS for the production frontend URL.
- [ ] Switch to PostgreSQL.
- [ ] Serve frontend static files from a CDN.
- [ ] Enable HTTPS (TLS certificate).
- [ ] Remove or restrict the Django admin endpoint.

---

## 18. Key Design Decisions

### Why Wouter instead of React Router?

Wouter is ~2 KB vs ~50 KB for React Router. This project has a flat route structure with no nested layouts, so the simpler API is sufficient.

### Why TanStack React Query instead of Redux?

All global state in this app is either server-derived (patients, predictions) or auth-related (one context). React Query handles server state with caching and invalidation; a simple Context handles auth. Redux would add unnecessary boilerplate.

### Why Drizzle ORM in the frontend?

`shared/schema.ts` defines the database table shapes using Drizzle's column helpers so that TypeScript can infer precise row types (`typeof patients.$inferSelect`). These types are imported by both frontend hooks and backend serialisers, giving end-to-end type safety without duplicating definitions.

### Dual camelCase / snake_case support

The Django backend returns snake_case JSON. The frontend was originally written with camelCase. `PredictionReport.tsx` reads both formats (e.g., `prediction.riskScore ?? prediction.risk_score`) to maintain backwards compatibility during migration.

### Authentication bypass in development

`App.tsx` currently skips `ProtectedRoute` guards (`// Skip authentication for now`). All routes are accessible in development without logging in. Re-enable guards before deploying to production.

### Base64 image encoding

Medical images are encoded to base64 strings client-side before being sent in the `medical_images` array. This avoids the need for a separate file-upload endpoint and keeps the prediction request self-contained, at the cost of increased payload size.

---

## 19. Project Statistics

| Item | Count |
|---|---|
| Pages | 6 (+ 1 Not Found) |
| Custom components | 5 (Layout, RiskGauge, StatCard, ProtectedRoute, AuthDebug) |
| Shadcn/ui primitives | 50+ |
| Custom hooks | 3 (use-medical, use-toast, use-mobile) |
| React Query hooks | 7 (3 patient, 4 prediction) |
| Context providers | 4 (QueryClient, Tooltip, Auth, Toaster) |
| API routes consumed | 8 (2 auth, 3 patients, 3 predictions) |
| Shared TypeScript files | 2 (schema.ts, routes.ts) |
| Production dependencies | 46 |
| Dev dependencies | 9 |
| Supported cancer types | 6 (Breast, Lung, Colorectal, Prostate, Skin, Brain) |
| ML model accuracy | 96–98 % (RandomForest) |
| Vite alias paths | 3 (`@`, `@shared`, `@assets`) |
| localStorage keys | 2 (`auth_token`, `doctor_data`) |

---

*Health Insights (Arogya-AI) — AI-powered disease prediction with explainable AI for medical professionals.* 🎉