// ==============================================================================
// CareNest Healthcare Platform - Responsive Email Template Engine
// Pastel Glassmorphism Email Styling, CareNest Branding,
// HIPAA-Compliant Footers & 10 Clinical/Family Notification Layouts.
// ==============================================================================

export interface BaseEmailLayoutOptions {
  preheader: string;
  badgeText?: string;
  badgeColor?: string; // hex
  headerGradient?: string;
  headerTitle: string;
  headerSubtitle: string;
  bodyContent: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}

export const renderBaseLayout = (opts: BaseEmailLayoutOptions): string => {
  const gradient = opts.headerGradient || 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)';
  const badgeColor = opts.badgeColor || '#0284c7';
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${opts.headerTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    a { color: #0284c7; text-decoration: none; }
    .btn-cta:hover { background-color: #0369a1 !important; }
  </style>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #f1f5f9; color: #1e293b;">
  <!-- Preheader text (hidden preview in mail clients) -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
    ${opts.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          
          <!-- Brand Header Banner -->
          <tr>
            <td style="padding: 32px 28px; background: ${gradient}; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; backdrop-filter: blur(4px);">
                CareNest Health Ecosystem
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">
                ${opts.headerTitle}
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.92; line-height: 1.4;">
                ${opts.headerSubtitle}
              </p>
            </td>
          </tr>

          <!-- Optional Context Badge -->
          ${
            opts.badgeText
              ? `<tr>
            <td align="center" style="padding-top: 18px;">
              <span style="display: inline-block; padding: 4px 12px; background-color: #f0fdfa; color: ${badgeColor}; border: 1px solid #ccfbf1; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                ${opts.badgeText}
              </span>
            </td>
          </tr>`
              : ''
          }

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 24px 32px 30px; font-size: 15px; line-height: 1.6; color: #334155;">
              ${opts.bodyContent}

              <!-- Action Call to Action Button -->
              ${
                opts.ctaText && opts.ctaUrl
                  ? `
                <div style="text-align: center; margin-top: 28px; margin-bottom: 10px;">
                  <a href="${opts.ctaUrl}" class="btn-cta" style="display: inline-block; background-color: #0284c7; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.25);">
                    ${opts.ctaText} &rarr;
                  </a>
                </div>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Footer & Confidentiality Notice -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 8px; font-weight: 500; color: #64748b;">
                CareNest &bull; Connected Healthcare, Medication Safety & Family Collaboration
              </p>
              <p style="margin: 0 0 10px;">
                ${
                  opts.footerNote ||
                  'This automated notification was generated according to care circle preferences. Please do not reply directly to this email.'
                }
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                CONFIDENTIALITY NOTICE: This transmission may contain protected clinical healthcare information.
                If you received this in error, please notify CareNest support and delete this email immediately.
                &copy; ${currentYear} CareNest Health. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ==============================================================================
// 1. UPCOMING MEDICATION REMINDER TEMPLATE
// ==============================================================================
export const upcomingMedicationTemplate = (data: {
  patientName: string;
  medicationName: string;
  dosage: string;
  time: string;
  foodInstructions?: string;
  instructions?: string;
  actionUrl?: string;
}) => {
  const content = `
    <p style="margin-top: 0;">Hello,</p>
    <p>This is a scheduled CareNest medication reminder for <strong>${data.patientName}</strong>:</p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="font-size: 18px; font-weight: 700; color: #166534; margin-bottom: 10px;">
        💊 ${data.medicationName}
      </div>
      <table style="width: 100%; font-size: 14px; color: #15803d;">
        <tr>
          <td style="padding: 4px 0; width: 130px; font-weight: 600;">Prescribed Dosage:</td>
          <td style="padding: 4px 0;"><strong>${data.dosage}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Scheduled Time:</td>
          <td style="padding: 4px 0;"><strong>${data.time}</strong></td>
        </tr>
        ${
          data.foodInstructions
            ? `<tr>
          <td style="padding: 4px 0; font-weight: 600;">Dietary Guidance:</td>
          <td style="padding: 4px 0;">${data.foodInstructions}</td>
        </tr>`
            : ''
        }
        ${
          data.instructions
            ? `<tr>
          <td style="padding: 4px 0; font-weight: 600;">Physician Notes:</td>
          <td style="padding: 4px 0;">${data.instructions}</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    <p style="color: #64748b; font-size: 14px;">
      Taking medications consistently at the prescribed hour maintains therapeutic efficacy.
      Once taken, please confirm intake in the CareNest portal to keep family and caregivers informed.
    </p>
  `;

  return renderBaseLayout({
    preheader: `Medication Reminder: ${data.medicationName} (${data.dosage}) scheduled for ${data.time}`,
    headerGradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    headerTitle: 'Medication Schedule Reminder',
    headerSubtitle: `Upcoming dose scheduled for ${data.patientName}`,
    badgeText: `Scheduled Dose: ${data.time}`,
    badgeColor: '#059669',
    bodyContent: content,
    ctaText: 'Confirm Dose in CareNest',
    ctaUrl: data.actionUrl || 'http://localhost:5173/medications'
  });
};

// ==============================================================================
// 2. UNCONFIRMED MEDICATION REMINDER (FRIENDLY NUDGE)
// ==============================================================================
export const unconfirmedMedicationTemplate = (data: {
  patientName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  minutesElapsed: number;
  actionUrl?: string;
}) => {
  const content = `
    <p style="margin-top: 0;">Hello,</p>
    <p>
      We noticed that the scheduled dose of <strong>${data.medicationName}</strong> (${data.dosage}) for
      <strong>${data.patientName}</strong> was scheduled at <strong>${data.scheduledTime}</strong>
      (${data.minutesElapsed} minutes ago) and has not yet been confirmed.
    </p>

    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="font-size: 16px; font-weight: 700; color: #b45309; margin-bottom: 8px;">
        ⏳ Awaiting Dose Confirmation
      </div>
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        If you or your caretaker have already taken this dose, please tap below to record it as taken.
        If the dose was held or skipped for clinical reasons, you can document the reason in one tap.
      </p>
    </div>

    <p style="color: #64748b; font-size: 14px;">
      CareNest will continue monitoring for the standard grace period before notifying authorized family contacts.
    </p>
  `;

  return renderBaseLayout({
    preheader: `Check-in: Scheduled dose of ${data.medicationName} awaiting confirmation`,
    headerGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    headerTitle: 'Medication Check-In',
    headerSubtitle: `Dose awaiting intake confirmation for ${data.patientName}`,
    badgeText: 'Status: Unconfirmed',
    badgeColor: '#b45309',
    bodyContent: content,
    ctaText: 'Record Dose Status Now',
    ctaUrl: data.actionUrl || 'http://localhost:5173/medications'
  });
};

// ==============================================================================
// 3. MISSED-DOSE ALERT (ESCALATED TO FAMILY & CAREGIVERS)
// ==============================================================================
export const missedDoseAlertTemplate = (data: {
  patientName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  gracePeriodMinutes: number;
  circleRole?: string;
  actionUrl?: string;
}) => {
  const content = `
    <p style="margin-top: 0; font-size: 16px; color: #991b1b; font-weight: 600;">
      Action Recommended: Unconfirmed Medication Dose
    </p>
    <p>
      The grace period of <strong>${data.gracePeriodMinutes} minutes</strong> has elapsed following the scheduled intake time for
      <strong>${data.patientName}</strong>:
    </p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="font-size: 18px; font-weight: 700; color: #dc2626; margin-bottom: 10px;">
        ⚠️ ${data.medicationName} (${data.dosage})
      </div>
      <table style="width: 100%; font-size: 14px; color: #b91c1c;">
        <tr>
          <td style="padding: 4px 0; width: 140px; font-weight: 600;">Patient:</td>
          <td style="padding: 4px 0;"><strong>${data.patientName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Scheduled Time:</td>
          <td style="padding: 4px 0;">${data.scheduledTime}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Grace Period:</td>
          <td style="padding: 4px 0;">${data.gracePeriodMinutes} min exceeded</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475569;">
      Because you are an authorized ${data.circleRole || 'Care Circle member'} for ${data.patientName},
      CareNest is dispatching this notification to ensure patient safety and adherence oversight.
      Please check in with ${data.patientName} or their assigned caretaker.
    </p>
  `;

  return renderBaseLayout({
    preheader: `[Adherence Alert] Unconfirmed medication dose for ${data.patientName}`,
    headerGradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    headerTitle: 'Adherence Escalation Alert',
    headerSubtitle: `Unconfirmed dose exceeded grace period for ${data.patientName}`,
    badgeText: 'Priority: High / Escalated',
    badgeColor: '#e11d48',
    bodyContent: content,
    ctaText: 'Review Patient Schedule & Log',
    ctaUrl: data.actionUrl || 'http://localhost:5173/medications'
  });
};

// ==============================================================================
// 4. MEDICATION CONFIRMATION RECEIPT
// ==============================================================================
export const medicationConfirmationTemplate = (data: {
  patientName: string;
  medicationName: string;
  dosage: string;
  takenAt: string;
  administeredByName: string;
  actionUrl?: string;
}) => {
  const content = `
    <p style="margin-top: 0;">Hello,</p>
    <p>Good news! A scheduled medication dose has been confirmed and logged in CareNest:</p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="font-size: 17px; font-weight: 700; color: #166534; margin-bottom: 8px;">
        ✅ ${data.medicationName} (${data.dosage}) Taken
      </div>
      <table style="width: 100%; font-size: 14px; color: #15803d;">
        <tr>
          <td style="padding: 4px 0; width: 140px; font-weight: 600;">Patient:</td>
          <td style="padding: 4px 0;"><strong>${data.patientName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Recorded Time:</td>
          <td style="padding: 4px 0;">${data.takenAt}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Administered By:</td>
          <td style="padding: 4px 0;">${data.administeredByName}</td>
        </tr>
      </table>
    </div>

    <p style="color: #64748b; font-size: 14px;">
      Inventory stock has been automatically updated. Adherence statistics reflect this completed intake.
    </p>
  `;

  return renderBaseLayout({
    preheader: `Dose Confirmed: ${data.medicationName} taken for ${data.patientName}`,
    headerGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    headerTitle: 'Medication Confirmed',
    headerSubtitle: `Intake recorded for ${data.patientName}`,
    badgeText: 'Status: Taken & Logged',
    badgeColor: '#10b981',
    bodyContent: content,
    ctaText: 'View Today’s Adherence Timeline',
    ctaUrl: data.actionUrl || 'http://localhost:5173/medications'
  });
};

// ==============================================================================
// 5. UPCOMING DOCTOR APPOINTMENT REMINDER
// ==============================================================================
export const upcomingAppointmentTemplate = (data: {
  patientName: string;
  doctorName: string;
  specialty: string;
  hospitalName?: string;
  appointmentDate: string;
  appointmentTime?: string;
  location: string;
  preparationNotes?: string;
  actionUrl?: string;
  is24HourNotice?: boolean;
}) => {
  const noticeTitle = data.is24HourNotice ? 'Appointment Tomorrow' : 'Upcoming Healthcare Appointment';
  const content = `
    <p style="margin-top: 0;">Hello,</p>
    <p>This is a reminder for an upcoming medical consultation scheduled for <strong>${data.patientName}</strong>:</p>

    <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="font-size: 18px; font-weight: 700; color: #3730a3; margin-bottom: 10px;">
        🩺 ${data.doctorName}
      </div>
      <table style="width: 100%; font-size: 14px; color: #4338ca;">
        <tr>
          <td style="padding: 4px 0; width: 140px; font-weight: 600;">Medical Specialty:</td>
          <td style="padding: 4px 0;">${data.specialty}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Facility / Clinic:</td>
          <td style="padding: 4px 0;">${data.hospitalName || 'CareNest Clinic'}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Date & Time:</td>
          <td style="padding: 4px 0;"><strong>${data.appointmentDate} ${data.appointmentTime || ''}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Location / Suite:</td>
          <td style="padding: 4px 0;">${data.location}</td>
        </tr>
        ${
          data.preparationNotes
            ? `<tr>
          <td style="padding: 4px 0; font-weight: 600;">Patient Prep:</td>
          <td style="padding: 4px 0;">${data.preparationNotes}</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    <p style="color: #64748b; font-size: 14px;">
      Please arrive 15 minutes prior to the scheduled consultation time. Remember to bring valid photo ID and recent medical records.
    </p>
  `;

  return renderBaseLayout({
    preheader: `Upcoming Medical Appointment: ${data.doctorName} (${data.specialty}) on ${data.appointmentDate}`,
    headerGradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
    headerTitle: noticeTitle,
    headerSubtitle: `Medical consultation for ${data.patientName}`,
    badgeText: data.is24HourNotice ? '24-Hour Notice' : 'Appointment Reminder',
    badgeColor: '#4f46e5',
    bodyContent: content,
    ctaText: 'View Appointment & Directions',
    ctaUrl: data.actionUrl || 'http://localhost:5173/appointments'
  });
};

// ==============================================================================
// 6. APPOINTMENT RESCHEDULING NOTIFICATION
// ==============================================================================
export const appointmentRescheduledTemplate = (data: {
  patientName: string;
  doctorName: string;
  specialty: string;
  oldDate?: string;
  newDate: string;
  newTime?: string;
  location: string;
  reason?: string;
  actionUrl?: string;
}) => {
  const content = `
    <p style="margin-top: 0;">Hello,</p>
    <p>Please note that a healthcare appointment for <strong>${data.patientName}</strong> has been rescheduled:</p>

    <div style="background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="font-size: 18px; font-weight: 700; color: #0f766e; margin-bottom: 10px;">
        🗓️ ${data.doctorName} (${data.specialty})
      </div>
      <table style="width: 100%; font-size: 14px; color: #115e59;">
        ${
          data.oldDate
            ? `<tr>
          <td style="padding: 4px 0; width: 140px; font-weight: 600; color: #991b1b;">Original Date:</td>
          <td style="padding: 4px 0; text-decoration: line-through; color: #991b1b;">${data.oldDate}</td>
        </tr>`
            : ''
        }
        <tr>
          <td style="padding: 4px 0; width: 140px; font-weight: 600; color: #0f766e;">New Date & Time:</td>
          <td style="padding: 4px 0; font-size: 15px;"><strong>${data.newDate} ${data.newTime || ''}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Location:</td>
          <td style="padding: 4px 0;">${data.location}</td>
        </tr>
        ${
          data.reason
            ? `<tr>
          <td style="padding: 4px 0; font-weight: 600;">Reschedule Reason:</td>
          <td style="padding: 4px 0;">${data.reason}</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    <p style="color: #64748b; font-size: 14px;">
      All background reminder timers have been automatically updated to reflect the new appointment window.
    </p>
  `;

  return renderBaseLayout({
    preheader: `Appointment Rescheduled: ${data.doctorName} - New Time: ${data.newDate}`,
    headerGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    headerTitle: 'Appointment Rescheduled',
    headerSubtitle: `Updated consultation schedule for ${data.patientName}`,
    badgeText: 'Status: Rescheduled',
    badgeColor: '#0d9488',
    bodyContent: content,
    ctaText: 'View Updated Calendar',
    ctaUrl: data.actionUrl || 'http://localhost:5173/appointments'
  });
};

// ==============================================================================
// 7. APPOINTMENT CANCELLATION NOTIFICATION
// ==============================================================================
export const appointmentCancelledTemplate = (data: {
  patientName: string;
  doctorName: string;
  specialty: string;
  cancelledDate: string;
  reason?: string;
  actionUrl?: string;
}) => {
  const content = `
    <p style="margin-top: 0;">Hello,</p>
    <p>This message confirms that the medical appointment for <strong>${data.patientName}</strong> has been cancelled:</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="font-size: 16px; font-weight: 700; color: #475569; margin-bottom: 8px;">
        🚫 Cancelled Appointment Summary
      </div>
      <table style="width: 100%; font-size: 14px; color: #64748b;">
        <tr>
          <td style="padding: 4px 0; width: 140px; font-weight: 600;">Physician:</td>
          <td style="padding: 4px 0;">${data.doctorName} (${data.specialty})</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Originally Scheduled:</td>
          <td style="padding: 4px 0;">${data.cancelledDate}</td>
        </tr>
        ${
          data.reason
            ? `<tr>
          <td style="padding: 4px 0; font-weight: 600;">Cancellation Note:</td>
          <td style="padding: 4px 0;">${data.reason}</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    <p style="color: #64748b; font-size: 14px;">
      All automated reminders for this appointment have been safely withdrawn.
      If you need to book an alternate appointment, you can do so in the CareNest portal.
    </p>
  `;

  return renderBaseLayout({
    preheader: `Appointment Cancelled: ${data.doctorName} on ${data.cancelledDate}`,
    headerGradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    headerTitle: 'Appointment Cancelled',
    headerSubtitle: `Notice of cancelled appointment for ${data.patientName}`,
    badgeText: 'Status: Cancelled',
    badgeColor: '#64748b',
    bodyContent: content,
    ctaText: 'Schedule Alternate Appointment',
    ctaUrl: data.actionUrl || 'http://localhost:5173/appointments'
  });
};

// ==============================================================================
// 8. NEW FAMILY MEMBER / CARE CIRCLE INVITATION
// ==============================================================================
export const familyCircleInviteTemplate = (data: {
  inviterName: string;
  elderlyName: string;
  targetRole: string;
  targetRelationship: string;
  invitationCode: string;
  expiresInHours: number;
  actionUrl?: string;
}) => {
  const content = `
    <p style="margin-top: 0;">Hello,</p>
    <p>
      <strong>${data.inviterName}</strong> has invited you to join the CareNest Family Care Circle for
      <strong>${data.elderlyName}</strong> as a <strong>${data.targetRelationship} (${data.targetRole})</strong>.
    </p>

    <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #7e22ce; text-transform: uppercase; letter-spacing: 0.5px;">
        Your Single-Use Secure Invitation Code
      </p>
      <div style="display: inline-block; background-color: #ffffff; border: 2px dashed #c084fc; border-radius: 8px; padding: 12px 24px; font-size: 26px; font-family: monospace; font-weight: 700; color: #6b21a8; letter-spacing: 2px;">
        ${data.invitationCode}
      </div>
      <p style="margin: 12px 0 0; font-size: 12px; color: #9333ea;">
        ⏳ Valid for the next ${data.expiresInHours} hours &bull; Single-use security token
      </p>
    </div>

    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      Joining the Care Circle allows you to collaborate on daily medication management, view upcoming medical consultations,
      track health logs, and coordinate care effortlessly.
    </p>
  `;

  return renderBaseLayout({
    preheader: `Invitation to join ${data.elderlyName}'s CareNest Family Circle`,
    headerGradient: 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)',
    headerTitle: 'Family Circle Invitation',
    headerSubtitle: `Join ${data.elderlyName}'s healthcare support circle`,
    badgeText: `Role: ${data.targetRole}`,
    badgeColor: '#9333ea',
    bodyContent: content,
    ctaText: 'Accept Invitation & Join Circle',
    ctaUrl: data.actionUrl || `http://localhost:5173/join-profile?code=${data.invitationCode}`
  });
};

// ==============================================================================
// 9. CARETAKER ACTIVITY UPDATE
// ==============================================================================
export const caretakerActivityTemplate = (data: {
  caretakerName: string;
  patientName: string;
  activityTitle: string;
  category: string;
  scheduledTime?: string;
  completedAt: string;
  notes?: string;
  actionUrl?: string;
}) => {
  const content = `
    <p style="margin-top: 0;">Hello,</p>
    <p>A care activity has been completed for <strong>${data.patientName}</strong>:</p>

    <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="font-size: 17px; font-weight: 700; color: #0f766e; margin-bottom: 8px;">
        📋 ${data.activityTitle}
      </div>
      <table style="width: 100%; font-size: 14px; color: #115e59;">
        <tr>
          <td style="padding: 4px 0; width: 140px; font-weight: 600;">Category:</td>
          <td style="padding: 4px 0;">${data.category}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Completed By:</td>
          <td style="padding: 4px 0;">${data.caretakerName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Timestamp:</td>
          <td style="padding: 4px 0;">${data.completedAt}</td>
        </tr>
        ${
          data.notes
            ? `<tr>
          <td style="padding: 4px 0; font-weight: 600;">Care Notes:</td>
          <td style="padding: 4px 0;">${data.notes}</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    <p style="color: #64748b; font-size: 14px;">
      Family members and caretakers can view the complete activity log in the CareNest dashboard.
    </p>
  `;

  return renderBaseLayout({
    preheader: `Care Activity Completed: ${data.activityTitle} for ${data.patientName}`,
    headerGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    headerTitle: 'Daily Care Activity Update',
    headerSubtitle: `Care task completed for ${data.patientName}`,
    badgeText: `Category: ${data.category}`,
    badgeColor: '#0ea5e9',
    bodyContent: content,
    ctaText: 'View Daily Care Checklist',
    ctaUrl: data.actionUrl || 'http://localhost:5173/dashboard'
  });
};

// ==============================================================================
// 10. MEDICATION SCHEDULE MODIFICATION
// ==============================================================================
export const medicationScheduleModifiedTemplate = (data: {
  patientName: string;
  medicationName: string;
  modificationType: string; // 'ADDED' | 'TIME_UPDATED' | 'DOSAGE_ADJUSTED' | 'DISCONTINUED'
  details: string;
  modifiedByName: string;
  actionUrl?: string;
}) => {
  const content = `
    <p style="margin-top: 0;">Hello,</p>
    <p>The medication regimen for <strong>${data.patientName}</strong> has been updated:</p>

    <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="font-size: 17px; font-weight: 700; color: #5b21b6; margin-bottom: 8px;">
        💊 ${data.medicationName} (${data.modificationType})
      </div>
      <table style="width: 100%; font-size: 14px; color: #6d28d9;">
        <tr>
          <td style="padding: 4px 0; width: 140px; font-weight: 600;">Update Type:</td>
          <td style="padding: 4px 0;"><strong>${data.modificationType}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Details:</td>
          <td style="padding: 4px 0;">${data.details}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600;">Updated By:</td>
          <td style="padding: 4px 0;">${data.modifiedByName}</td>
        </tr>
      </table>
    </div>

    <p style="color: #64748b; font-size: 14px;">
      All scheduled reminders and daily timeline occurrences have been synchronized with this clinical change.
    </p>
  `;

  return renderBaseLayout({
    preheader: `Medication Protocol Update: ${data.medicationName} modified for ${data.patientName}`,
    headerGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    headerTitle: 'Medication Protocol Updated',
    headerSubtitle: `Schedule adjustment for ${data.patientName}`,
    badgeText: 'Schedule Modified',
    badgeColor: '#7c3aed',
    bodyContent: content,
    ctaText: 'Review Full Medication Schedule',
    ctaUrl: data.actionUrl || 'http://localhost:5173/medications'
  });
};

