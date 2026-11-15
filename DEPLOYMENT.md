# CareNest Healthcare Platform — Production Deployment & Operations Manual

This comprehensive guide covers the enterprise deployment, cloud architecture, database migration, automated backup, security hardening, and observability strategy for the **CareNest Healthcare Ecosystem**.

---

## 1. Production Architecture Overview

```
                                  +-----------------------------+
                                  |     Vercel Edge Network     |
                                  |  (React 18, Vite, Tailwind) |
                                  |   https://carenest.health   |
                                  +--------------+--------------+
                                                 |
                                     HTTPS / WSS / REST APIs
                                                 |
                                  +--------------v--------------+
                                  |     Render / Cloud Run      |
                                  |   CareNest Express Engine   |
                                  |    (Node.js 20, TypeScript)|
                                  +-------+--------------+------+
                                          |              |
                      Prisma ORM (SSL)    |              | BullMQ / Redis
                                          |              |
                +-------------------------v-+          +-v-------------------------+
                |   Managed PostgreSQL 16   |          |    Upstash / Redis Cloud  |
                |   (Neon / AWS RDS / Supa) |          |  (Adherence, Missed Doses)|
                +---------------------------+          +---------------------------+
                              |                                      |
                      Daily PITR Backups                    High-Priority Schedulers
                              |                                      |
                +-------------v-------------+          +-------------v-------------+
                |  Private Cloud Storage    |          |    Transactional Email    |
                | (AWS S3 / Cloudflare R2)  |          | (SendGrid / AWS SES / Res)|
                +---------------------------+          +---------------------------+
```

---

## 2. Frontend Deployment (Vercel)

The frontend is an optimized Vite SPA with route-based code-splitting, accessible high-contrast themes, and sub-150KB core chunk sizes.

### Steps:
1. **Connect Repository**:
   * Navigate to [Vercel Dashboard](https://vercel.com/new).
   * Import the Git repository and select the `frontend` root directory.
2. **Framework & Build Settings**:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build` (`tsc -b && vite build`)
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
3. **Environment Variables**:
   Add the following variables in the Vercel project settings:
   * `VITE_API_URL`: `https://carenest-backend.onrender.com/api/v1`
   * `VITE_APP_ENV`: `production`
4. **Vercel Routing Configuration ([vercel.json](file:///c:/Users/risha/Desktop/CAT%20PRM/frontend/vercel.json))**:
   The deployed `vercel.json` already enforces:
   * Automatic SPA client-side routing fallback (`/* -> /index.html`).
   * Production security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`).
   * One-year immutable cache headers for hashed JavaScript and CSS bundles (`/assets/*`).

---

## 3. Backend Deployment (Render / Cloud Run / Node.js)

The backend is built with Express, TypeScript, Zod, and Prisma ORM.

### Steps:
1. **Render Blueprint Setup**:
   * Link your Git repository on Render.
   * Render will automatically detect [render.yaml](file:///c:/Users/risha/Desktop/CAT%20PRM/backend/render.yaml) located in the repository.
   * It provisions:
     1. `carenest-backend` (Node.js Web Service)
     2. `carenest-postgres` (Managed PostgreSQL 16)
     3. `carenest-redis` (Managed Redis instance)
2. **Manual Configuration (If not using Blueprint)**:
   * **Environment**: Node.js 20
   * **Root Directory**: `backend`
   * **Build Command**: `npm install && npx prisma generate && npm run build`
   * **Start Command**: `node dist/server.js`
   * **Health Check Path**: `/api/v1/health`
3. **Docker Alternative**:
   A production-hardened multi-stage Dockerfile is provided at [backend/Dockerfile](file:///c:/Users/risha/Desktop/CAT%20PRM/backend/Dockerfile). Build and deploy using:
   ```bash
   docker build -t carenest-backend:latest ./backend
   docker run -p 5000:5000 --env-file backend/.env.production carenest-backend:latest
   ```

---

## 4. Managed Database Configuration (PostgreSQL 16)

CareNest utilizes PostgreSQL with UUID primary keys, cryptographic invitation hashing, and composite query indexes.

### Recommended Providers:
* **Neon Tech** (Serverless with instant branching & auto-scaling)
* **Supabase** (Managed Postgres with connection pooling)
* **AWS RDS PostgreSQL** (Multi-AZ enterprise deployment)

### Database Migration Instructions:
1. **Set Production Connection String**:
   Ensure SSL mode is enforced:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/carenest_db?sslmode=require"
   ```
2. **Execute Schema Migration**:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
   *(Or run `npm run prisma:push` for synchronized environments)*
3. **Seed Baseline Clinical Catalogs & Admin Personas**:
   ```bash
   npm run prisma:seed
   ```
4. **Verify Schema Status**:
   ```bash
   npx prisma validate
   ```

---

## 5. Background Jobs & Scheduler (Redis & BullMQ)

CareNest dispatches automated medication reminders, missed-dose escalation alerts, and appointment notices via BullMQ.

### Recommended Providers:
* **Upstash Redis** (Serverless, TLS-encrypted `rediss://`)
* **Redis Cloud** (Managed AWS / GCP clusters)

### Configuration:
* Set `REDIS_URL` in backend environment:
  ```bash
  REDIS_URL="rediss://default:YourSecurePassword@your-redis-host.upstash.io:6379"
  ```
* **Graceful Degradation**: If Redis is unreachable during localized deployment, CareNest automatically falls back to deterministic in-memory interval schedulers so reminders are never lost.

---

## 6. Private Medical Records Vault (Object Storage)

Medical records, prescriptions, and lab reports are stored in private object storage and accessed via **15-minute HMAC-SHA256 signed download links**.

### Providers:
* **Amazon Web Services (AWS S3)**
* **Cloudflare R2** (Zero egress fees)
* **Google Cloud Storage (GCS)**

### S3 Bucket Policy:
* Block all public access (`BlockPublicAcls`, `BlockPublicPolicy`, `IgnorePublicAcls`, `RestrictPublicBuckets` = `true`).
* Enable server-side encryption with AWS KMS (`AES256`).

---

## 7. Transactional Email System

CareNest sends branded, responsive HTML notifications for medication confirmations, appointment rescheduling, and emergency alerts.

### Providers:
* **SendGrid** / **Resend** / **AWS SES** / **Postmark**

### Production Setup:
```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your_verified_api_key_here
EMAIL_FROM="CareNest Health <noreply@carenest.health>"
```

---

## 8. Complete Environment Variables Matrix

### Backend (`backend/.env.production`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Web server listening port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `REDIS_URL` | Redis BullMQ broker connection string | `rediss://default:pass@host:6379` |
| `JWT_SECRET` | Primary JWT session signing key | *64+ character random hex string* |
| `JWT_REFRESH_SECRET` | Refresh token cryptographic key | *64+ character random hex string* |
| `VAULT_HMAC_SECRET` | Secret for signed 15-min document links | *32+ character random hex string* |
| `CORS_ORIGIN` | Allowed web origins (comma-separated) | `https://carenest.vercel.app` |
| `COOKIE_DOMAIN` | Target cookie domain | `.onrender.com` / `.carenest.health` |
| `COOKIE_SECURE` | Enforce HTTPS cookies | `true` |
| `EMAIL_PROVIDER` | Email driver (`smtp` or `json`) | `smtp` |
| `SMTP_HOST` | Transactional SMTP server | `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `apikey` |
| `SMTP_PASS` | SMTP credential | `SG.xxxxxxxx` |
| `EMAIL_FROM` | Sender display name & address | `CareNest <noreply@carenest.health>` |

### Frontend (`frontend/.env.production`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Public API endpoint URL | `https://carenest-backend.onrender.com/api/v1` |
| `VITE_APP_ENV` | Application environment identifier | `production` |

---

## 9. Backup & Disaster Recovery Strategy

### A. Point-in-Time Recovery (PITR)
* Enable 30-day Continuous WAL archiving on PostgreSQL.
* Allows rolling back database state to any specific second in the event of human error or clinical data corruption.

### B. Automated Daily Snapshots
* Configure automated daily backups at `02:00 UTC` with a 90-day retention schedule.
* Store encrypted database dumps (`pg_dump -Fc`) in a secondary offsite cloud bucket.

### C. Recovery Objectives
* **Recovery Point Objective (RPO)**: < 5 minutes (via continuous WAL replication).
* **Recovery Time Objective (RTO)**: < 15 minutes (automated container restart & DNS failover).

---

## 10. Observability, Health & Error Monitoring

### A. Health Check Endpoint
* `GET /api/v1/health`
* Returns HTTP 200 with service timestamp and database status.
* Configure ping monitors on **BetterStack**, **UptimeRobot**, or **Pingdom** at 30-second intervals.

### B. Clinical Audit Logging
* All security-critical events (logins, medication intake, prescription downloads, emergency SOS activations) are logged to the `AuditLog` table with actor ID, IP address, and timestamp.

### C. Sentry Exception Tracking
To enable Sentry in production, set `SENTRY_DSN` in the environment. Unhandled Express exceptions and React error boundaries are captured and categorized with clinical severity tags.

