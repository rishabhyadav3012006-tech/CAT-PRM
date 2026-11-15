# CareNest Healthcare Platform - PostgreSQL Database Architecture & Prisma Schema

This document details the database architecture, entity relationships, security controls, and migration instructions for the **CareNest** smart elderly healthcare management platform.

---

## 1. High-Level Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o| ElderlyProfile : "has profile"
    User ||--o{ CareMember : "participates in circles"
    User ||--o{ Invitation : "sends/accepts"
    User ||--o{ Medication : "prescribes/creates"
    User ||--o{ MedicationLog : "records dose"
    User ||--o{ Appointment : "schedules"
    User ||--o{ MedicalRecord : "uploads"
    User ||--o{ CareActivity : "assigns/completes"
    User ||--o{ HealthLog : "records vitals"
    User ||--o{ Notification : "receives"
    User ||--o| NotificationPreference : "configures"
    User ||--o{ AuditLog : "triggers action"

    ElderlyProfile ||--o{ CareMember : "collaborating circle"
    ElderlyProfile ||--o{ Invitation : "pending invites"
    ElderlyProfile ||--o{ Medication : "prescribed meds"
    ElderlyProfile ||--o{ Appointment : "consultations"
    ElderlyProfile ||--o{ MedicalRecord : "vault documents"
    ElderlyProfile ||--o{ CareActivity : "daily care tasks"
    ElderlyProfile ||--o{ HealthLog : "biometric vitals"
    ElderlyProfile ||--o{ EmergencyAlert : "incident telemetry"
    ElderlyProfile ||--o{ AuditLog : "audit ledger"

    Medication ||--o{ MedicationSchedule : "recurrence slots"
    Medication ||--o{ MedicationLog : "intake history"
    MedicationSchedule ||--o{ MedicationLog : "scheduled slot"
```

---

## 2. Model Catalog (14 Core Models + 1 Incident Model)

### 1. `User` (Table: `users`)
Global identity, credentials, role categorization, time zones, and soft deletion.
- **Primary Key**: `id` (UUID, string)
- **Fields**:
  - `email`: String (Unique, Indexed, Lowercase normalized)
  - `password`: String (Bcrypt hashed, $\ge 10$ salt rounds, never stored plain-text)
  - `full_name`: String (User's legal or preferred name)
  - `phone`: String? (E.164 phone number)
  - `avatar_url`: String? (Avatar picture or initial avatar)
  - `role`: Enum `UserRole` (`ELDERLY`, `FAMILY_MEMBER`, `CAREGIVER`, `CARETAKER`, `DOCTOR`, `ADMIN`)
  - `time_zone`: String (Default: `"UTC"`, supports configurable time zones like `"America/New_York"`)
  - `is_email_verified`: Boolean (Default: `false`)
  - `is_active`: Boolean (Default: `true`, Indexed)
  - `last_login_at`: Timestamp?
  - `deleted_at`: Timestamp? (Soft deletion support)
  - `created_at`, `updated_at`: Timestamps (UTC)

### 2. `ElderlyProfile` (Table: `elderly_profiles`)
Clinical baseline, chronic conditions, mobility, allergies, and emergency points of contact.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` $\rightarrow$ `users(id)` (1-to-1, `ON DELETE CASCADE`)
- **Fields**:
  - `date_of_birth`: Timestamp? (UTC)
  - `gender`: String?
  - `blood_group`: String? (e.g. `"O+"`, `"A+"`, `"B+"`, `"AB-"`)
  - `allergies`: Text Array (Default: `[]`)
  - `chronic_conditions`: Text Array (Default: `[]`)
  - `address`: Text?
  - `time_zone`: String (Default: `"UTC"`)
  - `primary_doctor_name`, `primary_doctor_contact`: String?
  - `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`: Text (Mandatory safety data)
  - `mobility_status`: String? (`"Independent"`, `"Assisted Walk"`, `"Wheelchair"`, `"Bedbound"`)
  - `dietary_restrictions`: Text?
  - `notes`: Text?
  - `is_archived`, `archived_at`: Soft archival tracking
  - `created_at`, `updated_at`: Timestamps (UTC)

### 3. `CareMember` (Table: `care_members`)
Many-to-Many bridge supporting **multiple elderly profiles per authorized family member** and **multiple caretakers per elderly profile** with **granular profile-level permissions**.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `elderly_id` $\rightarrow$ `elderly_profiles(id)` (`ON DELETE CASCADE`)
  - `user_id` $\rightarrow$ `users(id)` (`ON DELETE CASCADE`)
- **Constraints**: Composite Unique `(elderly_id, user_id)`
- **Role & Status**:
  - `role`: Enum `MemberRole` (`ELDERLY_SELF`, `PRIMARY_CAREGIVER`, `FAMILY_ADMIN`, `FAMILY_VIEWER`, `CARETAKER`, `PHYSICIAN`)
  - `relationship`: String? (e.g., `"Daughter"`, `"Nurse"`, `"Self"`)
  - `status`: Enum `MembershipStatus` (`ACTIVE`, `PENDING_APPROVAL`, `REVOKED`, `SUSPENDED`)
- **Granular Profile-Level Permissions**:
  - `can_manage_medications`: Boolean (Default: `false`)
  - `can_log_medication_intake`: Boolean (Default: `true`)
  - `can_manage_appointments`: Boolean (Default: `false`)
  - `can_view_vitals`: Boolean (Default: `true`)
  - `can_log_vitals`: Boolean (Default: `false`)
  - `can_manage_care_tasks`: Boolean (Default: `false`)
  - `can_view_documents`: Boolean (Default: `true`)
  - `can_upload_documents`: Boolean (Default: `false`)
  - `can_invite_members`: Boolean (Default: `false`)
  - `can_trigger_emergency`: Boolean (Default: `true`)
- **Caretaker Shift Metadata**: `shift_start` (e.g. `"08:00"`), `shift_end` (e.g. `"17:00"`), `notes`
- **Audit Fields**: `joined_at`, `updated_at`, `revoked_at`, `revoked_by_id`

### 4. `Invitation` (Table: `invitations`)
Cryptographically secure, single-use, expiring invitations to join a care circle.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `elderly_id` $\rightarrow$ `elderly_profiles(id)` (`ON DELETE CASCADE`)
  - `invited_by_user_id` $\rightarrow$ `users(id)` (`ON DELETE RESTRICT`)
  - `accepted_by_user_id` $\rightarrow$ `users(id)` (`ON DELETE SET NULL`)
- **Security Attributes**:
  - `invite_code_hash`: String (Unique, SHA-256 hashed — **never stored plain-text**)
  - `invite_code_mask`: String (e.g., `"NEST-****-9363"` for safe UI display)
  - `target_email`: String? (Optional recipient lock)
  - `assigned_role`: Enum `MemberRole`
  - `permissions`: JSONB (Granular permission override snapshot)
  - `status`: Enum `InvitationStatus` (`PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`)
  - `expires_at`: Timestamp (Enforced expiration window, e.g., 48 hours)
  - `accepted_at`: Timestamp?

### 5. `Medication` (Table: `medications`)
Master catalog of prescriptions, dosages, food instructions, stock, and refill alerts.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `elderly_id` $\rightarrow$ `elderly_profiles(id)` (`ON DELETE CASCADE`)
  - `created_by_id` $\rightarrow$ `users(id)` (`ON DELETE RESTRICT`)
- **Fields**:
  - `name`: String (e.g., `"Lisinopril"`)
  - `generic_name`: String? (e.g., `"Lisinopril Dihydrate"`)
  - `category`: Enum `MedicationCategory` (`CARDIOVASCULAR`, `DIABETES`, `NEUROLOGICAL`, `ANALGESIC`, `ANTIBIOTIC`, `SUPPLEMENT`, `RESPIRATORY`, `GASTROINTESTINAL`, `OTHER`)
  - `dosage`: String (e.g., `"10mg"`, `"1 tablet"`)
  - `form`: Enum `MedicationForm` (`TABLET`, `CAPSULE`, `LIQUID`, `INJECTION`, `TOPICAL`, `DROPS`, `INHALER`, `PATCH`, `OTHER`)
  - `frequency`: String (`"DAILY"`, `"TWICE_DAILY"`, `"AS_NEEDED"`)
  - `scheduled_times`: Text Array (e.g., `["08:00", "20:00"]`)
  - `instructions`: Text?
  - `food_requirement`: Enum `FoodRequirement` (`BEFORE_FOOD`, `AFTER_FOOD`, `WITH_FOOD`, `NO_RESTRICTION`)
  - `start_date`, `end_date`: Timestamps
  - `stock_quantity`, `refill_reminder_threshold`: Integers for automatic inventory replenishment
  - `is_active`, `is_archived`, `deleted_at`: Status and soft-delete

### 6. `MedicationSchedule` (Table: `medication_schedules`)
Recurrent time slots, day-of-week recurrence rules, and time-specific dosage overrides.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `medication_id` $\rightarrow$ `medications(id)` (`ON DELETE CASCADE`)
- **Fields**:
  - `time_of_day`: String (Format `HH:mm`, e.g., `"08:00"`)
  - `dosage_override`: String?
  - `days_of_week`: Integer Array (Default: `[0, 1, 2, 3, 4, 5, 6]` where 0=Sunday)
  - `label`: String? (e.g., `"Morning with Breakfast"`)
  - `is_active`: Boolean

### 7. `MedicationLog` (Table: `medication_logs`)
Immutable longitudinal history of dose intakes, status, who recorded it, and clinical skips.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `medication_id` $\rightarrow$ `medications(id)` (`ON DELETE CASCADE`)
  - `schedule_id` $\rightarrow$ `medication_schedules(id)` (`ON DELETE SET NULL`)
  - `logged_by_id` $\rightarrow$ `users(id)` (`ON DELETE SET NULL`)
- **Constraints**: Composite Unique `(medication_id, scheduled_for)` (**strictly prevents duplicate dose recording**)
- **Fields**:
  - `scheduled_for`: Timestamp (UTC intended dose time)
  - `taken_at`: Timestamp? (Actual recorded time)
  - `status`: Enum `MedicationLogStatus` (`UPCOMING`, `SCHEDULED`, `PENDING`, `TAKEN`, `SKIPPED`, `MISSED`, `CANCELLED`, `SNOOZED`)
  - `recorded_by_name`, `recorded_by_role`: Denormalized audit snapshot
  - `skip_reason`: Text? (Mandatory when status is `SKIPPED`)
  - `dosage_taken`: String?
  - `notes`: Text?
  - `is_confirmed`, `confirmed_by_id`: Verification flags

### 8. `Appointment` (Table: `appointments`)
Clinical consultations, specialty, location, reminders, and consultation summaries.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `elderly_id` $\rightarrow$ `elderly_profiles(id)` (`ON DELETE CASCADE`)
  - `created_by_id` $\rightarrow$ `users(id)` (`ON DELETE RESTRICT`)
- **Fields**:
  - `doctor_name`, `specialty`, `hospital`, `location`, `contact_phone`: Text
  - `appointment_date`: Timestamp (UTC)
  - `duration_minutes`: Integer (Default: 30)
  - `status`: Enum `AppointmentStatus` (`UPCOMING`, `SCHEDULED`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`)
  - `reminder_sent`: Boolean
  - `cancellation_reason`: Text?
  - `notes`, `consultation_notes`: Post-visit clinical summary
  - `deleted_at`: Soft delete

### 9. `MedicalRecord` (Table: `medical_records`)
Secure Medical Records and Prescription Vault with SHA-256 integrity and HMAC signed link protection.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `elderly_id` $\rightarrow$ `elderly_profiles(id)` (`ON DELETE CASCADE`)
  - `uploaded_by_id` $\rightarrow$ `users(id)` (`ON DELETE RESTRICT`)
- **Fields**:
  - `title`: String
  - `category`: Enum `VaultCategory` (`PRESCRIPTION`, `BLOOD_REPORT`, `MEDICAL_HISTORY`, `DIAGNOSTIC_REPORT`, `DISCHARGE_SUMMARY`, `OTHER`)
  - `file_url`: String (Private storage URI: `private://vault/{elderlyId}/{docId}-{file}`)
  - `file_hash`: String (SHA-256 integrity digest)
  - `file_name`, `file_extension`, `mime_type`, `size_bytes`: File metadata
  - `doctor_name`, `facility_name`: Clinical origin
  - `document_date`: Timestamp (Clinical event date)
  - `tags`: Text Array
  - `summary`: Text?
  - `is_archived`, `archived_at`, `archived_by_id`, `archive_reason`: Outdated document archiving
  - `deleted_at`: Soft delete

### 10. `Notification` (Table: `notifications`)
Multi-channel notification ledger (In-App, Email, SMS, Push) with priority and read tracking.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` $\rightarrow$ `users(id)` (`ON DELETE CASCADE`)
- **Fields**:
  - `elderly_id`: String?
  - `type`: Enum `NotificationType` (`MEDICATION_REMINDER`, `MEDICATION_MISSED`, `APPOINTMENT_REMINDER`, `CARE_ACTIVITY_DUE`, `EMERGENCY_ALERT`, `CIRCLE_INVITE`, `SYSTEM_NOTICE`)
  - `title`, `message`: Text
  - `priority`: Enum `NotificationPriority` (`LOW`, `NORMAL`, `HIGH`, `URGENT`)
  - `channel`: Enum `NotificationChannel` (`IN_APP`, `EMAIL`, `SMS`, `PUSH`)
  - `is_read`, `read_at`: Read state
  - `action_url`: Relative routing link (e.g. `"/medications"`)
  - `metadata`: JSONB
  - `sent_at`: Timestamp

### 11. `CareActivity` (Table: `care_activities`)
Daily senior care checklist: hygiene, meals, walks, cognitive activities, and checkups.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `elderly_id` $\rightarrow$ `elderly_profiles(id)` (`ON DELETE CASCADE`)
  - `created_by_id` $\rightarrow$ `users(id)` (`ON DELETE RESTRICT`)
  - `assigned_to_id` $\rightarrow$ `users(id)` (`ON DELETE SET NULL`)
  - `completed_by_id` $\rightarrow$ `users(id)` (`ON DELETE SET NULL`)
- **Fields**:
  - `title`, `description`: Text
  - `category`: Enum `ActivityCategory` (`HYGIENE`, `MEAL`, `MOBILITY`, `EXERCISE`, `MENTAL_HEALTH`, `CHECKUP`, `OTHER`)
  - `scheduled_date`: Timestamp (UTC)
  - `scheduled_time`: String (e.g. `"09:30"`)
  - `status`: Enum `ActivityStatus` (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`)
  - `completed_at`, `notes`: Completion telemetry

### 12. `HealthLog` (Table: `health_logs`)
Longitudinal biometric telehealth telemetry: blood pressure, glucose, heart rate, SpO2, temperature, and weight.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `elderly_id` $\rightarrow$ `elderly_profiles(id)` (`ON DELETE CASCADE`)
  - `recorded_by_id` $\rightarrow$ `users(id)` (`ON DELETE RESTRICT`)
- **Fields**:
  - `recorded_at`: Timestamp (UTC)
  - `systolic_bp`, `diastolic_bp`: Integers (mmHg)
  - `blood_glucose`: Float (mg/dL)
  - `heart_rate`: Integer (bpm)
  - `oxygen_saturation`: Float (% SpO2)
  - `body_temperature`: Float (°F)
  - `weight`: Float (kg)
  - `is_alert`: Boolean (True when outside clinical target thresholds)
  - `alert_reason`: Text?
  - `notes`: Text?

### 13. `AuditLog` (Table: `audit_logs`)
HIPAA-compliant, tamper-evident security ledger tracking all sensitive reads, writes, and role changes.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `actor_id` $\rightarrow$ `users(id)` (`ON DELETE SET NULL` — retains audit trace even if actor account is purged)
  - `elderly_id` $\rightarrow$ `elderly_profiles(id)` (`ON DELETE CASCADE`)
- **Fields**:
  - `action`: Enum `AuditAction` (`CREATE`, `READ`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `PASSWORD_RESET`, `INVITE_SENT`, `INVITE_ACCEPTED`, `ROLE_CHANGED`, `PERMISSION_CHANGED`, `DOCUMENT_DOWNLOADED`, `DOCUMENT_ARCHIVED`, `EMERGENCY_TRIGGERED`, `EMERGENCY_RESOLVED`)
  - `entity_type`: String (`"Medication"`, `"MedicalRecord"`, `"CareMember"`, `"User"`, etc.)
  - `entity_id`: String (UUID of the target entity)
  - `description`: Text
  - `previous_state`, `new_state`: JSONB snapshots (Diff tracking)
  - `ip_address`, `user_agent`: Network origin
  - `created_at`: Timestamp (UTC)

### 14. `NotificationPreference` (Table: `notification_preferences`)
Per-user multi-channel delivery configuration, lead times, and quiet hour schedules.
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` $\rightarrow$ `users(id)` (1-to-1, `ON DELETE CASCADE`)
- **Fields**:
  - `email_notifications`, `sms_notifications`, `push_notifications`: Booleans
  - `medication_reminders`, `missed_dose_alerts`, `appointment_reminders`, `care_activity_updates`, `emergency_alerts`: Booleans
  - `reminder_lead_minutes`: Integer (Default: 15)
  - `quiet_hours_enabled`: Boolean
  - `quiet_hours_start`, `quiet_hours_end`: Strings (e.g. `"22:00"`, `"07:00"`)

### Complementary Model: `EmergencyAlert` (Table: `emergency_alerts`)
Immediate incident dispatch, coordinates SOS alerts, geo-coordinates, and formal resolution.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `elderly_id` $\rightarrow$ `elderly_profiles(id)` (`ON DELETE CASCADE`)
  - `triggered_by_id` $\rightarrow$ `users(id)` (`ON DELETE RESTRICT`)
- **Fields**:
  - `type`: String (Default: `"SOS_BUTTON"`)
  - `message`: Text?
  - `latitude`, `longitude`: Float?
  - `resolved`: Boolean (Default: `false`, Indexed)
  - `resolved_at`, `resolved_notes`: Incident resolution data

---

## 3. Migration & Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally or in Docker

### Step 1: Configure Environment Variables
Ensure `backend/.env` has a valid PostgreSQL connection string:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/carenest?schema=public"
JWT_SECRET="carenest-production-jwt-super-secret-key-at-least-32-chars"
VAULT_SECRET="carenest-medical-vault-hmac-sha256-signing-secret-key"
```

### Step 2: Validate Schema
```bash
npm --prefix backend run prisma:validate
```

### Step 3: Format Schema
```bash
npm --prefix backend run prisma:format
```

### Step 4: Generate Prisma Client
```bash
npm --prefix backend run prisma:generate
```

### Step 5: Execute Migration Against PostgreSQL
Apply the initial migration:
```bash
# In development (applies pending migrations and tracks them in _prisma_migrations):
npm --prefix backend run prisma:migrate

# Or push schema directly for quick prototyping:
npm --prefix backend run prisma:push
```

### Step 6: Seed Demonstration Database
Populate the database with clinical demonstration data:
```bash
npm --prefix backend run prisma:seed
```

### Step 7: Open Prisma Studio (Database GUI)
Browse and edit tables visually in your browser:
```bash
npm --prefix backend run prisma:studio
```

