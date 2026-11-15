-- ==============================================================================
-- CareNest Healthcare Platform - Initial Migration (20261115000000_init)
-- Database: PostgreSQL
-- Full Schema: Users, Elderly Profiles, Care Members, Invitations, Medications,
--              Schedules, Logs, Appointments, Medical Records, Notifications,
--              Care Activities, Health Logs, Audit Logs, Notification Preferences
-- ==============================================================================

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ELDERLY', 'FAMILY_MEMBER', 'CAREGIVER', 'CARETAKER', 'DOCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ELDERLY_SELF', 'PRIMARY_CAREGIVER', 'FAMILY_ADMIN', 'FAMILY_VIEWER', 'CARETAKER', 'PHYSICIAN');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'PENDING_APPROVAL', 'REVOKED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "MedicationCategory" AS ENUM ('CARDIOVASCULAR', 'DIABETES', 'NEUROLOGICAL', 'ANALGESIC', 'ANTIBIOTIC', 'SUPPLEMENT', 'RESPIRATORY', 'GASTROINTESTINAL', 'OTHER');

-- CreateEnum
CREATE TYPE "MedicationForm" AS ENUM ('TABLET', 'CAPSULE', 'LIQUID', 'INJECTION', 'TOPICAL', 'DROPS', 'INHALER', 'PATCH', 'OTHER');

-- CreateEnum
CREATE TYPE "FoodRequirement" AS ENUM ('BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD', 'NO_RESTRICTION');

-- CreateEnum
CREATE TYPE "MedicationLogStatus" AS ENUM ('UPCOMING', 'SCHEDULED', 'PENDING', 'TAKEN', 'SKIPPED', 'MISSED', 'CANCELLED', 'SNOOZED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('UPCOMING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "VaultCategory" AS ENUM ('PRESCRIPTION', 'BLOOD_REPORT', 'MEDICAL_HISTORY', 'DIAGNOSTIC_REPORT', 'DISCHARGE_SUMMARY', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('HYGIENE', 'MEAL', 'MOBILITY', 'EXERCISE', 'MENTAL_HEALTH', 'CHECKUP', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MEDICATION_REMINDER', 'MEDICATION_MISSED', 'APPOINTMENT_REMINDER', 'CARE_ACTIVITY_DUE', 'EMERGENCY_ALERT', 'CIRCLE_INVITE', 'SYSTEM_NOTICE');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'INVITE_SENT', 'INVITE_ACCEPTED', 'ROLE_CHANGED', 'PERMISSION_CHANGED', 'DOCUMENT_DOWNLOADED', 'DOCUMENT_ARCHIVED', 'EMERGENCY_TRIGGERED', 'EMERGENCY_RESOLVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FAMILY_MEMBER',
    "time_zone" TEXT NOT NULL DEFAULT 'UTC',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elderly_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "blood_group" TEXT,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chronic_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "address" TEXT,
    "time_zone" TEXT NOT NULL DEFAULT 'UTC',
    "primary_doctor_name" TEXT,
    "primary_doctor_contact" TEXT,
    "emergency_contact_name" TEXT NOT NULL,
    "emergency_contact_phone" TEXT NOT NULL,
    "emergency_contact_relation" TEXT NOT NULL,
    "mobility_status" TEXT,
    "dietary_restrictions" TEXT,
    "notes" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elderly_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_members" (
    "id" TEXT NOT NULL,
    "elderly_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'FAMILY_VIEWER',
    "relationship" TEXT,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "can_manage_medications" BOOLEAN NOT NULL DEFAULT false,
    "can_log_medication_intake" BOOLEAN NOT NULL DEFAULT true,
    "can_manage_appointments" BOOLEAN NOT NULL DEFAULT false,
    "can_view_vitals" BOOLEAN NOT NULL DEFAULT true,
    "can_log_vitals" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_care_tasks" BOOLEAN NOT NULL DEFAULT false,
    "can_view_documents" BOOLEAN NOT NULL DEFAULT true,
    "can_upload_documents" BOOLEAN NOT NULL DEFAULT false,
    "can_invite_members" BOOLEAN NOT NULL DEFAULT false,
    "can_trigger_emergency" BOOLEAN NOT NULL DEFAULT true,
    "shift_start" TEXT,
    "shift_end" TEXT,
    "notes" TEXT,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "revoked_by_id" TEXT,

    CONSTRAINT "care_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "elderly_id" TEXT NOT NULL,
    "invited_by_user_id" TEXT NOT NULL,
    "invite_code_hash" TEXT NOT NULL,
    "invite_code_mask" TEXT NOT NULL,
    "target_email" TEXT,
    "assigned_role" "MemberRole" NOT NULL DEFAULT 'FAMILY_VIEWER',
    "permissions" JSONB,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "accepted_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "elderly_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "category" "MedicationCategory" NOT NULL DEFAULT 'OTHER',
    "dosage" TEXT NOT NULL,
    "form" "MedicationForm" NOT NULL DEFAULT 'TABLET',
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "scheduled_times" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instructions" TEXT,
    "food_requirement" "FoodRequirement" NOT NULL DEFAULT 'NO_RESTRICTION',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "stock_quantity" INTEGER NOT NULL DEFAULT 30,
    "refill_reminder_threshold" INTEGER NOT NULL DEFAULT 5,
    "last_refill_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_schedules" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "time_of_day" TEXT NOT NULL,
    "dosage_override" TEXT,
    "days_of_week" INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6]::INTEGER[],
    "label" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_logs" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "schedule_id" TEXT,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "taken_at" TIMESTAMP(3),
    "status" "MedicationLogStatus" NOT NULL DEFAULT 'PENDING',
    "logged_by_id" TEXT,
    "recorded_by_name" TEXT,
    "recorded_by_role" TEXT,
    "skip_reason" TEXT,
    "dosage_taken" TEXT,
    "notes" TEXT,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT true,
    "confirmed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "elderly_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "hospital" TEXT,
    "location" TEXT NOT NULL,
    "contact_phone" TEXT,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'UPCOMING',
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "cancellation_reason" TEXT,
    "notes" TEXT,
    "consultation_notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "elderly_id" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "VaultCategory" NOT NULL DEFAULT 'OTHER',
    "file_url" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_extension" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "doctor_name" TEXT,
    "facility_name" TEXT,
    "document_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by_id" TEXT,
    "archive_reason" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "elderly_id" TEXT,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM_NOTICE',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "action_url" TEXT,
    "metadata" JSONB,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_activities" (
    "id" TEXT NOT NULL,
    "elderly_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "completed_by_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ActivityCategory" NOT NULL DEFAULT 'OTHER',
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_logs" (
    "id" TEXT NOT NULL,
    "elderly_id" TEXT NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "blood_glucose" DOUBLE PRECISION,
    "heart_rate" INTEGER,
    "oxygen_saturation" DOUBLE PRECISION,
    "body_temperature" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "is_alert" BOOLEAN NOT NULL DEFAULT false,
    "alert_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "elderly_id" TEXT,
    "actor_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previous_state" JSONB,
    "new_state" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "sms_notifications" BOOLEAN NOT NULL DEFAULT false,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "medication_reminders" BOOLEAN NOT NULL DEFAULT true,
    "missed_dose_alerts" BOOLEAN NOT NULL DEFAULT true,
    "appointment_reminders" BOOLEAN NOT NULL DEFAULT true,
    "care_activity_updates" BOOLEAN NOT NULL DEFAULT true,
    "emergency_alerts" BOOLEAN NOT NULL DEFAULT true,
    "reminder_lead_minutes" INTEGER NOT NULL DEFAULT 15,
    "quiet_hours_enabled" BOOLEAN NOT NULL DEFAULT false,
    "quiet_hours_start" TEXT,
    "quiet_hours_end" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_alerts" (
    "id" TEXT NOT NULL,
    "elderly_id" TEXT NOT NULL,
    "triggered_by_id" TEXT NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'SOS_BUTTON',
    "message" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_is_active_idx" ON "users"("is_active");
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "elderly_profiles_user_id_key" ON "elderly_profiles"("user_id");
CREATE INDEX "elderly_profiles_user_id_idx" ON "elderly_profiles"("user_id");
CREATE INDEX "elderly_profiles_is_archived_idx" ON "elderly_profiles"("is_archived");

-- CreateIndex
CREATE INDEX "care_members_elderly_id_idx" ON "care_members"("elderly_id");
CREATE INDEX "care_members_user_id_idx" ON "care_members"("user_id");
CREATE INDEX "care_members_status_idx" ON "care_members"("status");
CREATE INDEX "care_members_role_idx" ON "care_members"("role");
CREATE UNIQUE INDEX "care_members_elderly_id_user_id_key" ON "care_members"("elderly_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_invite_code_hash_key" ON "invitations"("invite_code_hash");
CREATE INDEX "invitations_elderly_id_idx" ON "invitations"("elderly_id");
CREATE INDEX "invitations_invite_code_hash_idx" ON "invitations"("invite_code_hash");
CREATE INDEX "invitations_status_expires_at_idx" ON "invitations"("status", "expires_at");
CREATE INDEX "invitations_target_email_idx" ON "invitations"("target_email");

-- CreateIndex
CREATE INDEX "medications_elderly_id_idx" ON "medications"("elderly_id");
CREATE INDEX "medications_elderly_id_is_active_idx" ON "medications"("elderly_id", "is_active");
CREATE INDEX "medications_name_idx" ON "medications"("name");
CREATE INDEX "medications_is_archived_idx" ON "medications"("is_archived");

-- CreateIndex
CREATE INDEX "medication_schedules_medication_id_idx" ON "medication_schedules"("medication_id");
CREATE INDEX "medication_schedules_medication_id_time_of_day_idx" ON "medication_schedules"("medication_id", "time_of_day");

-- CreateIndex
CREATE INDEX "medication_logs_medication_id_idx" ON "medication_logs"("medication_id");
CREATE INDEX "medication_logs_scheduled_for_idx" ON "medication_logs"("scheduled_for");
CREATE INDEX "medication_logs_status_idx" ON "medication_logs"("status");
CREATE INDEX "medication_logs_logged_by_id_idx" ON "medication_logs"("logged_by_id");
CREATE UNIQUE INDEX "medication_logs_medication_id_scheduled_for_key" ON "medication_logs"("medication_id", "scheduled_for");

-- CreateIndex
CREATE INDEX "appointments_elderly_id_idx" ON "appointments"("elderly_id");
CREATE INDEX "appointments_appointment_date_idx" ON "appointments"("appointment_date");
CREATE INDEX "appointments_status_idx" ON "appointments"("status");
CREATE INDEX "appointments_deleted_at_idx" ON "appointments"("deleted_at");

-- CreateIndex
CREATE INDEX "medical_records_elderly_id_idx" ON "medical_records"("elderly_id");
CREATE INDEX "medical_records_category_idx" ON "medical_records"("category");
CREATE INDEX "medical_records_is_archived_idx" ON "medical_records"("is_archived");
CREATE INDEX "medical_records_document_date_idx" ON "medical_records"("document_date");
CREATE INDEX "medical_records_deleted_at_idx" ON "medical_records"("deleted_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX "notifications_user_id_sent_at_idx" ON "notifications"("user_id", "sent_at");
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "care_activities_elderly_id_idx" ON "care_activities"("elderly_id");
CREATE INDEX "care_activities_scheduled_date_idx" ON "care_activities"("scheduled_date");
CREATE INDEX "care_activities_status_idx" ON "care_activities"("status");
CREATE INDEX "care_activities_assigned_to_id_idx" ON "care_activities"("assigned_to_id");
CREATE INDEX "care_activities_deleted_at_idx" ON "care_activities"("deleted_at");

-- CreateIndex
CREATE INDEX "health_logs_elderly_id_idx" ON "health_logs"("elderly_id");
CREATE INDEX "health_logs_recorded_at_idx" ON "health_logs"("recorded_at");
CREATE INDEX "health_logs_is_alert_idx" ON "health_logs"("is_alert");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");
CREATE INDEX "audit_logs_elderly_id_idx" ON "audit_logs"("elderly_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");
CREATE INDEX "notification_preferences_user_id_idx" ON "notification_preferences"("user_id");
CREATE INDEX "notification_preferences_email_notifications_idx" ON "notification_preferences"("email_notifications");

-- CreateIndex
CREATE INDEX "emergency_alerts_elderly_id_idx" ON "emergency_alerts"("elderly_id");
CREATE INDEX "emergency_alerts_resolved_idx" ON "emergency_alerts"("resolved");

-- AddForeignKey
ALTER TABLE "elderly_profiles" ADD CONSTRAINT "elderly_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_members" ADD CONSTRAINT "care_members_elderly_id_fkey" FOREIGN KEY ("elderly_id") REFERENCES "elderly_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "care_members" ADD CONSTRAINT "care_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_elderly_id_fkey" FOREIGN KEY ("elderly_id") REFERENCES "elderly_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_accepted_by_user_id_fkey" FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_elderly_id_fkey" FOREIGN KEY ("elderly_id") REFERENCES "elderly_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "medications" ADD CONSTRAINT "medications_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_schedules" ADD CONSTRAINT "medication_schedules_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "medication_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "medication_logs" ADD CONSTRAINT "medication_logs_logged_by_id_fkey" FOREIGN KEY ("logged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_elderly_id_fkey" FOREIGN KEY ("elderly_id") REFERENCES "elderly_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_elderly_id_fkey" FOREIGN KEY ("elderly_id") REFERENCES "elderly_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_activities" ADD CONSTRAINT "care_activities_elderly_id_fkey" FOREIGN KEY ("elderly_id") REFERENCES "elderly_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "care_activities" ADD CONSTRAINT "care_activities_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "care_activities" ADD CONSTRAINT "care_activities_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "care_activities" ADD CONSTRAINT "care_activities_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_logs" ADD CONSTRAINT "health_logs_elderly_id_fkey" FOREIGN KEY ("elderly_id") REFERENCES "elderly_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "health_logs" ADD CONSTRAINT "health_logs_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_elderly_id_fkey" FOREIGN KEY ("elderly_id") REFERENCES "elderly_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_alerts" ADD CONSTRAINT "emergency_alerts_elderly_id_fkey" FOREIGN KEY ("elderly_id") REFERENCES "elderly_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_alerts" ADD CONSTRAINT "emergency_alerts_triggered_by_id_fkey" FOREIGN KEY ("triggered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
