import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  CalendarClock,
  XCircle,
  Edit2,
  AlertCircle,
  FileCheck,
  Download,
  Stethoscope,
  Send
} from 'lucide-react';
import { Appointment, AppointmentDocument } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { CountdownBadge } from './CountdownBadge.tsx';
import { appointmentsApi } from '../../api/client.ts';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onRefresh: () => void;
  onEdit: (apt: Appointment) => void;
  onReschedule: (apt: Appointment) => void;
  onCancel: (apt: Appointment) => void;
  onMarkCompleted: (id: string) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onRefresh,
  onEdit,
  onReschedule,
  onCancel,
  onMarkCompleted
}) => {
  const [consultationNotes, setConsultationNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Document upload form
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Lab Report');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);

  React.useEffect(() => {
    if (appointment) {
      setConsultationNotes(appointment.consultationNotes || '');
      setIsEditingNotes(!appointment.consultationNotes);
    }
  }, [appointment]);

  if (!appointment) return null;

  const dateObj = new Date(appointment.appointmentDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const timeString =
    appointment.appointmentTime ||
    dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

  const isActionable =
    appointment.status === 'UPCOMING' ||
    appointment.status === 'SCHEDULED' ||
    appointment.status === 'RESCHEDULED';

  const handleSaveNotes = async () => {
    if (!consultationNotes.trim()) return;
    setSavingNotes(true);
    try {
      await appointmentsApi.addConsultationNotes(appointment.id, consultationNotes);
      setIsEditingNotes(false);
      onRefresh();
    } catch (err) {
      alert('Failed to save consultation notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAttachDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      alert('Please enter a document name.');
      return;
    }
    setIsUploadingDoc(true);
    try {
      await appointmentsApi.addDocument(appointment.id, {
        name: docName.trim().endsWith('.pdf') ? docName.trim() : `${docName.trim()}.pdf`,
        type: docType,
        size: '1.6 MB',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80'
      });
      setDocName('');
      setShowDocUpload(false);
      onRefresh();
    } catch (err) {
      alert('Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Details & Clinical Notes"
      subtitle="Complete appointment dossier with hospital info, countdown, clinical observations, and documents"
      icon={<Stethoscope className="w-5 h-5 text-[#7969B5]" />}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Header Summary Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#E9E3FF]/80 via-[#DFEEFF]/80 to-[#DDF5E9]/80 border-2 border-[#D1C6F8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-glass-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/90 text-[#7969B5] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black font-heading text-[#34354A] text-xl">
                  {appointment.doctorName}
                </h3>
                <CuteBadge variant="babyBlue" size="sm">
                  {appointment.specialty}
                </CuteBadge>
              </div>
              <p className="text-xs font-bold font-body text-[#575973] mt-0.5">
                {appointment.hospitalName || 'Affiliated Healthcare Provider'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <CountdownBadge
              appointmentDate={appointment.appointmentDate}
              status={appointment.status}
            />
            <CuteBadge
              variant={
                appointment.status === 'COMPLETED'
                  ? 'mint'
                  : appointment.status === 'CANCELLED'
                  ? 'pink'
                  : appointment.status === 'RESCHEDULED'
                  ? 'peach'
                  : 'lavender'
              }
              size="sm"
            >
              {appointment.status}
            </CuteBadge>
          </div>
        </div>

        {/* Schedule & Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Timing details */}
          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-2.5">
            <h4 className="text-xs font-black font-heading uppercase text-[#7A7D9D] tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#7969B5]" />
              Schedule & Reminders
            </h4>
            <div className="space-y-1.5 text-xs font-medium font-body text-[#34354A]">
              <p className="flex items-center gap-2 text-sm font-bold text-[#34354A]">
                <Calendar className="w-4 h-4 text-[#7969B5]" />
                <span>{formattedDate}</span>
              </p>
              <p className="flex items-center gap-2 text-sm font-bold text-[#7969B5]">
                <Clock className="w-4 h-4 text-[#7969B5]" />
                <span>{timeString}</span>
              </p>
              <div className="pt-1 text-[11px] text-[#575973] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>BullMQ 24h & 1h prior SMS/email reminders active</span>
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-2.5">
            <h4 className="text-xs font-black font-heading uppercase text-[#7A7D9D] tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2B6EB5]" />
              Hospital & Direct Contact
            </h4>
            <div className="space-y-1.5 text-xs font-medium font-body text-[#34354A]">
              <p className="flex items-start gap-2 font-bold">
                <Building2 className="w-4 h-4 text-[#7A7D9D] flex-shrink-0 mt-0.5" />
                <span>{appointment.hospitalName || 'Clinic'}</span>
              </p>
              <p className="flex items-start gap-2 text-[#575973]">
                <MapPin className="w-4 h-4 text-[#7A7D9D] flex-shrink-0 mt-0.5" />
                <span>{appointment.location}</span>
              </p>
              {appointment.contactNumber && (
                <p className="flex items-center gap-2 text-[#2B6EB5]">
                  <Phone className="w-4 h-4 text-[#2B6EB5] flex-shrink-0" />
                  <a
                    href={`tel:${appointment.contactNumber}`}
                    className="font-bold hover:underline"
                  >
                    {appointment.contactNumber}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Clinical Preparation / Patient Notes */}
        {appointment.notes && (
          <div className="p-3.5 rounded-2xl bg-[#FFF9ED] border border-[#F7ECCF] space-y-1">
            <h4 className="text-xs font-black font-heading text-[#B85820] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#B85820]" />
              Preparation & Focus Areas:
            </h4>
            <p className="text-xs font-medium font-body text-[#575973] leading-relaxed">
              {appointment.notes}
            </p>
          </div>
        )}

        {/* Rescheduled Note Banner */}
        {appointment.rescheduleReason && (
          <div className="p-3 rounded-2xl bg-[#FFE9DC]/60 border border-[#FBD2BA] text-xs text-[#B85820] space-y-0.5">
            <p className="font-bold flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4" />
              Rescheduled History:
            </p>
            <p className="font-medium text-[#575973]">{appointment.rescheduleReason}</p>
          </div>
        )}

        {/* Cancellation Banner */}
        {appointment.cancelReason && (
          <div className="p-3 rounded-2xl bg-[#FCE4ED]/60 border border-[#F7C6D7] text-xs text-[#A62650] space-y-0.5">
            <p className="font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Cancellation Reason:
            </p>
            <p className="font-medium text-[#575973]">{appointment.cancelReason}</p>
          </div>
        )}

        {/* Consultation Notes Section */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#ECEAF5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#7969B5]" />
              <h4 className="font-black font-heading text-[#34354A] text-sm">
                Doctor's Consultation Notes & Treatment Plan
              </h4>
            </div>

            {!isEditingNotes && (
              <button
                type="button"
                onClick={() => setIsEditingNotes(true)}
                className="text-xs font-bold text-[#7969B5] hover:text-[#55428F] flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{appointment.consultationNotes ? 'Edit Notes' : '+ Add Notes'}</span>
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-2.5">
              <textarea
                rows={3}
                placeholder="Enter post-consultation diagnosis, prescribed therapeutic exercises, follow-up tests, or doctor advice..."
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#E5E4F2] hover:border-[#C2B5F0] focus:border-[#7969B5] focus:ring-4 focus:ring-[#E9E3FF]/80 text-xs sm:text-sm font-medium font-body text-[#34354A] bg-[#FAF9FF] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                {appointment.consultationNotes && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setConsultationNotes(appointment.consultationNotes || '');
                      setIsEditingNotes(false);
                    }}
                  >
                    <span>Cancel</span>
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  className="rounded-xl shadow-glow-purple"
                >
                  <span>{savingNotes ? 'Saving...' : 'Save Consultation Notes'}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#ECEAF5]">
              {appointment.consultationNotes ? (
                <p className="text-xs font-medium font-body text-[#34354A] whitespace-pre-line leading-relaxed">
                  {appointment.consultationNotes}
                </p>
              ) : (
                <p className="text-xs font-medium font-body text-[#7A7D9D] italic">
                  No consultation notes recorded yet. Add notes after the checkup to preserve medical guidance.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Medical Documents Section */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#ECEAF5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2B6EB5]" />
              <h4 className="font-black font-heading text-[#34354A] text-sm">
                Relevant Medical Documents & Scans
              </h4>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDocUpload(!showDocUpload)}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              className="rounded-xl text-xs py-1 px-3"
            >
              <span>{showDocUpload ? 'Close' : '+ Attach Document'}</span>
            </Button>
          </div>

          {/* Upload Form Accordion */}
          {showDocUpload && (
            <form
              onSubmit={handleAttachDocument}
              className="p-3.5 rounded-2xl bg-[#DFEEFF]/40 border border-[#BDDCFF] space-y-3"
            >
              <p className="text-xs font-bold text-[#1B5494]">
                Attach Lab Report, Referral, or Imaging Scan
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="e.g. ECG_Rhythm_Strip_Feb2026.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#BDDCFF] bg-white font-medium text-[#34354A] focus:outline-none"
                  required
                />
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#BDDCFF] bg-white font-bold text-[#34354A] focus:outline-none"
                >
                  <option value="Lab Report">Lab Report (Blood / Urine)</option>
                  <option value="Referral Letter">Physician Referral Letter</option>
                  <option value="Imaging">Imaging / X-Ray / MRI Scan</option>
                  <option value="Prescription">Specialist Prescription</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isUploadingDoc}
                  className="rounded-xl shadow-glow-purple text-xs"
                >
                  <span>{isUploadingDoc ? 'Attaching...' : 'Upload & Attach'}</span>
                </Button>
              </div>
            </form>
          )}

          {/* List of Attached Documents */}
          {appointment.documents && appointment.documents.length > 0 ? (
            <div className="space-y-2">
              {appointment.documents.map((doc: AppointmentDocument) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9FF] border border-[#ECEAF5] hover:border-[#D1C6F8] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#DFEEFF] text-[#1B5494] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#34354A] truncate">
                        {doc.name}
                      </p>
                      <p className="text-[11px] font-medium text-[#7A7D9D]">
                        {doc.type} • {doc.size || '1.2 MB'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={doc.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-[#7969B5] hover:bg-[#E9E3FF] transition-colors"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-medium text-[#7A7D9D] italic py-2">
              No medical files attached yet. You can attach previous ECGs, lab reports, or referral letters.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#ECEAF5] flex flex-wrap items-center justify-between gap-2.5">
          <Button variant="ghost" size="md" onClick={onClose} className="rounded-xl">
            <span>Close</span>
          </Button>

          {isActionable && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  onClose();
                  onCancel(appointment);
                }}
                className="rounded-xl text-rose-600 hover:bg-[#FCE4ED]/60"
              >
                <span>Cancel</span>
              </Button>

              <Button
                variant="peach"
                size="md"
                onClick={() => {
                  onClose();
                  onReschedule(appointment);
                }}
                leftIcon={<CalendarClock className="w-4 h-4" />}
                className="rounded-xl"
              >
                <span>Reschedule</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  onClose();
                  onEdit(appointment);
                }}
                leftIcon={<Edit2 className="w-4 h-4" />}
                className="rounded-xl"
              >
                <span>Edit</span>
              </Button>

              <Button
                variant="mint"
                size="md"
                onClick={() => {
                  onMarkCompleted(appointment.id);
                  onClose();
                }}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="rounded-xl font-bold"
              >
                <span>Mark Completed</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

