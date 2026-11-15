import React, { useState, useEffect } from 'react';
import { Stethoscope, Calendar, Clock, MapPin, Building2, Phone, FileText, Upload, Plus, X } from 'lucide-react';
import { Appointment } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { InputField } from '../ui/InputField.tsx';
import { SelectField } from '../ui/SelectField.tsx';
import { appointmentsApi } from '../../api/client.ts';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAppointment?: Appointment | null;
}

const SPECIALTY_OPTIONS = [
  { value: 'Cardiologist', label: 'Cardiologist (Heart & Blood Pressure)' },
  { value: 'Geriatrician', label: 'Geriatrician (Elderly Care Specialist)' },
  { value: 'Endocrinologist', label: 'Endocrinologist (Diabetes & Metabolic)' },
  { value: 'Neurologist', label: 'Neurologist (Cognitive & Brain Health)' },
  { value: 'Ophthalmologist', label: 'Ophthalmologist (Vision & Retinopathy)' },
  { value: 'Physical Therapist', label: 'Physical Therapist (Mobility & Balance)' },
  { value: 'Orthopedic Surgeon', label: 'Orthopedic (Joints & Bone Health)' },
  { value: 'General Physician', label: 'General Physician / Primary Care' },
  { value: 'Dermatologist', label: 'Dermatologist (Skin Health)' },
  { value: 'Psychiatrist', label: 'Psychiatrist / Mental Wellness' },
  { value: 'Other Specialist', label: 'Other Clinical Specialist' }
];

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingAppointment
}) => {
  const isEdit = !!editingAppointment;

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('Cardiologist');
  const [hospitalName, setHospitalName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [location, setLocation] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Lab Report');
  const [attachedDocs, setAttachedDocs] = useState<Array<{ name: string; type: string; size: string }>>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingAppointment) {
      setDoctorName(editingAppointment.doctorName || '');
      setSpecialty(editingAppointment.specialty || 'Cardiologist');
      setHospitalName(editingAppointment.hospitalName || '');
      setContactNumber(editingAppointment.contactNumber || '');
      setLocation(editingAppointment.location || '');

      const d = new Date(editingAppointment.appointmentDate);
      const isoDate = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
      setAppointmentDate(isoDate);

      if (editingAppointment.appointmentTime) {
        // Try parsing to HH:MM if in 12h format or set directly
        setAppointmentTime(editingAppointment.appointmentTime);
      } else if (!isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        setAppointmentTime(`${hh}:${mm}`);
      }

      setNotes(editingAppointment.notes || '');
      setAttachedDocs([]);
    } else {
      // Default new appointment state (tomorrow at 10:00 AM)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDoctorName('');
      setSpecialty('Cardiologist');
      setHospitalName('');
      setContactNumber('');
      setLocation('');
      setAppointmentDate(tomorrow.toISOString().split('T')[0]);
      setAppointmentTime('10:00');
      setNotes('');
      setAttachedDocs([]);
    }
    setErrorMsg('');
  }, [editingAppointment, isOpen]);

  const handleAddDocumentTag = () => {
    if (!docName.trim()) return;
    setAttachedDocs([
      ...attachedDocs,
      {
        name: docName.trim().endsWith('.pdf') ? docName.trim() : `${docName.trim()}.pdf`,
        type: docType,
        size: '1.4 MB'
      }
    ]);
    setDocName('');
  };

  const handleRemoveDocTag = (index: number) => {
    setAttachedDocs(attachedDocs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!doctorName.trim()) {
      setErrorMsg('Please enter the doctor or physician name.');
      return;
    }
    if (!hospitalName.trim()) {
      setErrorMsg('Please enter the hospital or clinic name.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please specify the clinic address or room number.');
      return;
    }
    if (!appointmentDate) {
      setErrorMsg('Please select a valid appointment date.');
      return;
    }

    // Combine appointmentDate and appointmentTime into full ISO string
    let fullIsoDate: string;
    try {
      const [year, month, day] = appointmentDate.split('-').map(Number);
      let hours = 10;
      let minutes = 0;

      if (appointmentTime.includes(':')) {
        const parts = appointmentTime.split(':');
        hours = parseInt(parts[0], 10) || 10;
        minutes = parseInt(parts[1], 10) || 0;
      }
      const combinedDate = new Date(year, month - 1, day, hours, minutes);
      fullIsoDate = combinedDate.toISOString();
    } catch {
      fullIsoDate = new Date(appointmentDate).toISOString();
    }

    setLoading(true);
    try {
      if (isEdit && editingAppointment) {
        await appointmentsApi.update(editingAppointment.id, {
          doctorName: doctorName.trim(),
          specialty,
          hospitalName: hospitalName.trim(),
          contactNumber: contactNumber.trim(),
          location: location.trim(),
          appointmentDate: fullIsoDate,
          appointmentTime,
          notes: notes.trim()
        });
      } else {
        await appointmentsApi.create({
          elderlyId: 'eld-01',
          doctorName: doctorName.trim(),
          specialty,
          hospitalName: hospitalName.trim(),
          contactNumber: contactNumber.trim(),
          location: location.trim(),
          appointmentDate: fullIsoDate,
          appointmentTime,
          notes: notes.trim(),
          documents: attachedDocs
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Doctor Appointment' : 'Schedule New Doctor Appointment'}
      subtitle={
        isEdit
          ? 'Update physician information, location, date, or clinical instructions'
          : 'Coordinate medical checkups with automated reminders and document uploads'
      }
      icon={<Stethoscope className="w-5 h-5 text-[#7969B5]" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-[#FCE4ED] border border-[#F7C6D7] text-xs font-bold text-[#A62650]">
            {errorMsg}
          </div>
        )}

        {/* 1. Doctor Details */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-3">
          <h4 className="text-xs font-black font-heading uppercase text-[#7969B5] tracking-wider flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5" />
            1. Physician & Specialty
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Doctor / Physician Name *"
              placeholder="e.g. Dr. Elizabeth Adams"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              required
            />

            <SelectField
              label="Specialization *"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              options={SPECIALTY_OPTIONS}
            />
          </div>

          <InputField
            label="Doctor / Clinic Contact Number"
            placeholder="e.g. +1 (555) 234-8899"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            leftIcon={<Phone className="w-4 h-4 text-[#7A7D9D]" />}
          />
        </div>

        {/* 2. Hospital & Location Info */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-3">
          <h4 className="text-xs font-black font-heading uppercase text-[#1B5494] tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#1B5494]" />
            2. Hospital or Clinic Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Hospital / Clinic Name *"
              placeholder="e.g. St. Mary Heart & Vascular Hospital"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
            />

            <InputField
              label="Room / Suite / Address *"
              placeholder="e.g. Suite 410, 100 Health Blvd"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
        </div>

        {/* 3. Date & Time Schedule */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-3">
          <h4 className="text-xs font-black font-heading uppercase text-[#1D6A48] tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#1D6A48]" />
            3. Appointment Schedule
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Appointment Date *"
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />

            <InputField
              label="Appointment Time *"
              type="text"
              placeholder="e.g. 10:30 AM or 14:30"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* 4. Additional Preparation Notes */}
        <div>
          <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
            Additional Preparation Notes (Fasting, Reports to Bring)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Fasting 8 hours for lipid panel; bring current blood pressure monitor and medication log."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#E5E4F2] hover:border-[#C2B5F0] focus:border-[#7969B5] focus:ring-4 focus:ring-[#E9E3FF]/80 text-xs sm:text-sm font-medium font-body text-[#34354A] bg-white focus:outline-none"
          />
        </div>

        {/* 5. Document Upload Section (for new appointments) */}
        {!isEdit && (
          <div className="p-3.5 rounded-2xl bg-[#DFEEFF]/30 border border-[#BDDCFF] space-y-2.5">
            <h4 className="text-xs font-black font-heading text-[#1B5494] flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Optional: Attach Relevant Medical Scans or Reports
            </h4>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Document file name (e.g. Prior_ECG.pdf)"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#BDDCFF] bg-white font-medium text-[#34354A] focus:outline-none"
              />
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[#BDDCFF] bg-white font-bold text-[#34354A] focus:outline-none"
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Referral Letter">Referral Letter</option>
                <option value="Imaging">Imaging / X-Ray</option>
                <option value="Prescription">Prescription</option>
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddDocumentTag}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs py-1.5"
              >
                <span>Add Doc</span>
              </Button>
            </div>

            {attachedDocs.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachedDocs.map((doc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white border border-[#BDDCFF] text-[#1B5494]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocTag(idx)}
                      className="text-rose-500 hover:text-rose-700 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-[#ECEAF5] flex justify-end gap-2.5">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            <span>Cancel</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="rounded-2xl shadow-glow-purple px-6"
          >
            <span>{loading ? 'Saving...' : isEdit ? 'Update Appointment' : 'Confirm & Schedule'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

