# 🪺 CareNest — Smart Elderly Healthcare Management Ecosystem

> **An enterprise-grade, full-stack healthcare coordination platform designed to connect elderly individuals, their families, caregivers, and medical practitioners into a unified, secure, and accessible care ecosystem.**

---

## 🌟 Key Platform Modules & Capabilities

CareNest is engineered to provide dignified, accessible, and life-saving healthcare coordination across six interconnected clinical modules:

1. **🏥 Role-Based Clinical Dashboards & Personas:**
   - **Elderly Patient Dashboard**: High-contrast, large touch-target interface featuring one-touch medication intake confirmations, daily care checklists, appointment notifications, and immediate emergency SOS dispatch.
   - **Family Administrator & Viewer Portals**: Real-time adherence tracking, shared care calendars, invitation management with granular permissions, and emergency broadcast reception.
   - **Caretaker Workstation**: Shift handover checklists (hygiene, nutrition, mobility, medication reminders), patient wellness logs, and care activity timelines.
   - **Doctor & Clinician Portal**: Longitudinal biometric vitals monitoring (Blood Pressure, Glucose, Heart Rate, $SpO_2$), threshold anomaly alarms, and consultation notes.

2. **💊 Intelligent Medication Management & Adherence Engine:**
   - Multi-dose scheduling supporting configurable daily frequencies, time zones, and recurrence windows.
   - One-touch dose logging with distinct states: `TAKEN`, `SKIPPED`, `MISSED`, and `UNCONFIRMED`.
   - **Duplicate Dose Prevention Guard**: Prevents accidental overdose or double-recording on the same day.
   - Real-time clinical adherence scoring with historical log retention and trend analysis.

3. **🔒 Medical Records & Prescription Vault:**
   - Secure repository categorizing documents into *Prescriptions*, *Blood Reports*, *Medical History*, *Diagnostic Reports*, *Discharge Summaries*, and *Other Documents*.
   - Private object storage integration utilizing **15-minute HMAC-SHA256 signed download links**.
   - Strict MIME-type validation and 10MB size limits with comprehensive audit trails for document creation, access, and revocation.

4. **📅 Specialist Appointments & Care Calendar:**
   - Doctor visit scheduling, time-slot management, and automated patient reminders.
   - Rescheduling workflows requiring patient-safety reason codes and audit tracking.
   - Consultation notes recording and direct medical document attachment.

5. **📊 Healthcare Analytics & Visual Reporting:**
   - Interactive Recharts visualization: 7-day/30-day adherence trend lines, weekly intake bar charts, status distribution doughnuts, and vitals trend graphs.
   - Dynamic date filtering: *Today*, *This Week*, *This Month*, or *Custom Range*.
   - **Strict Clinical Integrity**: Zero fabricated data; missing dose data is clearly distinguished from non-compliance.

6. **🤖 Smart Care Assistant (Ambient Wellness Guide):**
   - Natural language conversational daily routines, medication summaries, and appointment guides.
   - Daily wellness check-in telemetry: Water intake logging, mood tracking, and sleep routine monitoring.
   - Safety boundaries: Refuses medication alteration or diagnostic claims; provides non-clinical lifestyle guidance.

7. **🚨 Emergency Assistance & Universal Accessibility (WCAG 2.1 AAA):**
   - **High-Visibility Emergency SOS**: Two-stage confirmation, instant dispatch to registered family contacts and emergency responders, and audit timeline logging.
   - **Permitted Emergency Profile**: Instant read-only access to critical allergies, chronic conditions, and active prescriptions with clear 911 disclaimers.
   - **Universal Accessibility Settings**: Large text mode (125%), high-contrast mode, reduced-motion preferences, large touch targets, keyboard focus traps, and ARIA screen-reader landmarks.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | Sub-150KB core bundle, route-level code splitting |
| **Styling** | Tailwind CSS | WCAG-compliant accessible design system with high-contrast themes |
| **Animations** | Framer Motion | Accessible modal transitions and reduced-motion compliance |
| **Icons** | Lucide React | Clean, intuitive healthcare and navigation iconography |
| **Charts** | Recharts | Isolated charting chunk for adherence and longitudinal vitals |
| **Backend** | Node.js, Express.js, TypeScript | Typed RESTful API engine with strict modular routing |
| **Database** | PostgreSQL 16 | Relational data integrity, UUID keys, composite query indexes |
| **ORM** | Prisma ORM | Type-safe database queries, schema migrations, and client generation |
| **Validation**| Zod | Runtime schema validation for requests and environment variables |
| **Queue / Jobs**| Redis 7 + BullMQ | Background scheduling for medication reminders & missed-dose alerts |
| **Notifications**| Nodemailer | Transactional HTML email alerts with responsive branded layouts |
| **Security** | Argon2id / BCrypt, JWT, Helmet | RBAC middleware, secure HTTP-only cookies, and hardened headers |

---

## 📁 Repository Structure

```
carenest-platform/
├── DEPLOYMENT.md                   # Enterprise production deployment & operations manual
├── docker-compose.yml              # Local PostgreSQL 16 + Redis 7 + Adminer containers
├── docker-compose.production.yml   # Production Docker multi-container stack
├── package.json                    # Workspace orchestration & test scripts
├── README.md                       # Platform documentation
│
├── backend/                        # Node.js + Express + Prisma + BullMQ API
│   ├── Dockerfile                  # Multi-stage production container build
│   ├── render.yaml                 # Render Blueprint for Web Service, Postgres & Redis
│   ├── .env.example                # Local environment template
│   ├── .env.production.example     # Production environment template
│   ├── prisma/
│   │   ├── schema.prisma           # 14 Prisma PostgreSQL data models, indexes & enums
│   │   └── seed.ts                 # Database seed script for 4 healthcare personas
│   ├── src/
│   │   ├── config/                 # Environment validation (Zod), Prisma, Redis, Mailer
│   │   ├── constants/              # UserRole, Status & Category enums
│   │   ├── controllers/            # REST API controllers (Auth, Meds, Appts, Vault, Assistant, SOS)
│   │   ├── middleware/             # Auth (JWT/RBAC), Validation (Zod), Error Handling
│   │   ├── routes/                 # Express API route modules mounted under /api/v1
│   │   ├── services/               # Business logic, BullMQ queues & Audit logging
│   │   ├── types/                  # Express & DTO TypeScript interfaces
│   │   ├── utils/                  # Logger, JWT, Password hashing, ApiResponse
│   │   ├── app.ts                  # Express application setup
│   │   └── server.ts               # Server startup & graceful shutdown
│   └── test-api.mjs                # 22-suite automated end-to-end integration test runner
│
└── frontend/                       # React 18 + TypeScript + Vite SPA
    ├── vercel.json                 # Vercel SPA routing rewrites & security headers
    ├── .env.example                # Local frontend environment template
    ├── .env.production.example     # Production frontend environment template
    ├── src/
    │   ├── api/                    # Axios client with JWT interceptor & API endpoints
    │   ├── components/
    │   │   ├── common/             # Navbar, Sidebar, StatCard, Modal, NotificationBanner
    │   │   └── emergency/          # EmergencyConfirmationModal, EmergencyProfileCard
    │   ├── context/
    │   │   ├── AuthContext.tsx     # Authentication state & persona switcher
    │   │   └── AccessibilityContext.tsx # Large text, High contrast, Reduced motion
    │   ├── layouts/
    │   │   ├── DashboardLayout.tsx # Main dashboard frame with responsive mobile drawer
    │   │   └── AuthLayout.tsx      # Clean authentication pages layout
    │   ├── pages/                  # Route-split pages (Dashboard, Meds, Vault, Assistant, Reports)
    │   ├── types/                  # Domain TypeScript definitions
    │   ├── App.tsx                 # React Router with Suspense lazy loading
    │   └── main.tsx                # Application bootstrap
    ├── tailwind.config.js          # Accessibility and pastel color system
    └── vite.config.ts              # Manual chunking optimization (React, Motion, Charts, Icons)
```

---

## 🔐 Pre-Configured Healthcare Personas

For rapid evaluation and testing, CareNest includes pre-configured personas loaded with realistic medical histories:

| Role | Persona Name | Demo Email | Password | Clinical Context |
|---|---|---|---|---|
| **Elderly** | Eleanor Vance | `eleanor.vance@carenest.health` | `Password123!` | 78 y/o patient with Hypertension & Type 2 Diabetes |
| **Family** | Sarah Vance | `sarah.vance@carenest.health` | `Password123!` | Daughter & Primary Emergency Contact (Admin) |
| **Caregiver** | Marcus Chen | `marcus.chen@carenest.health` | `Password123!` | Certified Geriatric Caregiver (Shift 08:00 - 18:00) |
| **Doctor** | Dr. Elizabeth Adams | `dr.adams@carenest.health` | `Password123!` | Attending Cardiologist & Geriatrician |

*(Use the **1-Click Demo Sign-in** buttons on the Login page or the **Switch Persona** dropdown in the navigation header to switch roles instantly).*

---

## ⚡ Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20 & v22 LTS)
- **npm**: v9+
- **Docker** *(optional, for running local PostgreSQL 16 and Redis 7)*

### 2. Install Dependencies
```bash
# Install root orchestration tools
npm install

# Install backend and frontend dependencies
npm run install:all
```

### 3. Environment Setup
```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

> **Resilient Database Mode (`DB_MODE=auto`):**
> When PostgreSQL is running, CareNest communicates directly with Prisma. If PostgreSQL or Redis is not yet running, CareNest automatically falls back to its built-in in-memory data store with realistic seed data, guaranteeing **zero startup crashes** during local development.

### 4. Database Initialization (With Docker)
```bash
# Start PostgreSQL 16, Redis 7, and Adminer
docker compose up -d

# Push Prisma schema and seed clinical personas
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start Development Servers
```bash
# Run both Backend (:5000) and Frontend (:5173) concurrently:
npm run dev
```
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🧪 Comprehensive Automated Test Suite

CareNest comes with an automated integration and security test suite covering **22 test suites with over 50 individual assertions**:

```bash
npm test
```

### Verified Test Areas:
1. **Health & Readiness Check**: Server status, uptime, and database responsiveness.
2. **Authentication Flow**: User registration, bcrypt password verification, and JWT issuance.
3. **Identity Verification**: Profile retrieval and role-based metadata.
4. **Dashboard Aggregation**: Calculated adherence scores, upcoming appointments, and pending tasks.
5. **Medication Management**: Schedule retrieval and active prescription catalogs.
6. **Adherence & Safety Guard**: Dose logging (`TAKEN`) and duplicate dose prevention (HTTP 409).
7. **Specialist Appointments**: Scheduling, rescheduling reason enforcement, consultation notes, document attachment, and cancellation guards.
8. **Clinical Biometrics**: Historical vitals logs and vital signs recording with automatic threshold alerts.
9. **Daily Care Routines**: Caregiver shift checklists and status tracking.
10. **Emergency SOS System**: Real-time alert dispatch, emergency responder notification, and delivery confirmation.
11. **Incident Feed**: Active emergency incident resolution and responder logging.
12. **Care Circle Collaboration**: Invitation generation with Argon2id cryptographic hashing, join verification, and membership approval.
13. **Medical Vault**: Category filtering, document upload validation, and 15-minute signed download link generation.
14. **Healthcare Analytics**: 7-day adherence trends, weekly intakes, and status distributions without data fabrication.
15. **Authentication Security**: Email verification tokens, password reset flows, and secure session revocation.
16. **Caregiver Activity Timeline**: Chronological event tracking and actor attribution.
17. **Smart Care Assistant**: Natural conversational routines, hydration logging, mood tracking, and sleep logs.
18. **Emergency Assistance & Permitted Medical Profile**: Read-only critical health card sharing and 911 disclaimers.
19. **Clinical Security Penetration**: Unauthorized access rejection (401), invalid credentials (401), malformed payload rejection (422), sensitive hash leakage prevention, tampered token rejection (401), duplicate registration prevention (409), and disallowed executable upload blocking.

---

## 🚀 Production Deployment & Operations

For complete step-by-step production setup, refer to the [Production Deployment & Operations Manual](file:///c:/Users/risha/Desktop/CAT%20PRM/DEPLOYMENT.md).

### Quick Deployment Summary:

| Component | Target Provider | Configuration File | Key Highlights |
|---|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | [`frontend/vercel.json`](file:///c:/Users/risha/Desktop/CAT%20PRM/frontend/vercel.json) | Route-level code splitting, 140KB core bundle, immutable caching, security headers |
| **Backend** | [Render](https://render.com) | [`backend/render.yaml`](file:///c:/Users/risha/Desktop/CAT%20PRM/backend/render.yaml) | Blueprint deploying Node.js 20, Managed PostgreSQL 16, and Redis 7 |
| **Container** | Docker / AWS ECS | [`backend/Dockerfile`](file:///c:/Users/risha/Desktop/CAT%20PRM/backend/Dockerfile) | Multi-stage Alpine build, non-root `node` user, minimal image size |
| **Compose** | Docker Compose | [`docker-compose.production.yml`](file:///c:/Users/risha/Desktop/CAT%20PRM/docker-compose.production.yml) | Production-ready multi-service container orchestration |
| **Database** | Neon / AWS RDS | [`backend/prisma/schema.prisma`](file:///c:/Users/risha/Desktop/CAT%20PRM/backend/prisma/schema.prisma) | Point-in-Time Recovery (PITR), continuous WAL archiving, composite indexes |
| **Object Store**| AWS S3 / Cloudflare R2 | Private Buckets | Encrypted storage, 15-minute temporary signed URLs, strict MIME enforcement |

---

## 📄 License
This project is open-source under the [MIT License](file:///c:/Users/risha/Desktop/CAT%20PRM/LICENSE).
