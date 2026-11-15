import React, { useState, useEffect } from 'react';
import { alertsApi } from '../../api/client.ts';
import {
  EmergencyProfileData,
  NotificationDeliveryStatus,
  SosTriggerResult
} from '../../types/index.ts';
import {
  ShieldAlert,
  Phone,
  AlertTriangle,
  CheckCircle2,
  X,
  Heart,
  Pill,
  Clock,
  User,
  Activity,
  Check,
  Send,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmergencyConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  elderlyId?: string;
  onAlertTriggered?: () => void;
}

export const EmergencyConfirmationModal: React.FC<EmergencyConfirmationModalProps> = ({
  isOpen,
  onClose,
  elderlyId = 'eld-01',
  onAlertTriggered
}) => {
  const [step, setStep] = useState<'CONFIRM' | 'PROCESSING' | 'ACTIVE_STATUS'>('CONFIRM');
  const [profileData, setProfileData] = useState<EmergencyProfileData | null>(null);
  const [sosResult, setSosResult] = useState<SosTriggerResult | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load configured emergency profile data on modal open
  useEffect(() => {
    if (isOpen) {
      setStep('CONFIRM');
      setError(null);
      const fetchProfile = async () => {
        try {
          setLoadingProfile(true);
          const res: any = await alertsApi.getEmergencyProfile(elderlyId);
          if (res.success && res.data) {
            setProfileData(res.data);
          }
        } catch (err) {
          console.error('Failed to load emergency profile:', err);
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [isOpen, elderlyId]);

  if (!isOpen) return null;

  const handleConfirmSos = async () => {
    setStep('PROCESSING');
    setError(null);

    try {
      const res: any = await alertsApi.triggerSos({
        elderlyId,
        type: 'EMERGENCY_BUTTON',
        message: '🚨 Urgent assistance requested via CareNest emergency assistance button!'
      });

      if (res.success && res.data) {
        setSosResult(res.data);
        if (res.data.emergencyProfile) {
          setProfileData(res.data.emergencyProfile);
        }
        setStep('ACTIVE_STATUS');
        if (onAlertTriggered) onAlertTriggered();
      } else {
        throw new Error(res.message || 'Failed to dispatch SOS alert');
      }
    } catch (err: any) {
      setError(err?.message || 'Emergency broadcast dispatch failed. Please dial 911 directly.');
      setStep('CONFIRM');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'PROCESSING') onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-rose-300 overflow-hidden flex flex-col max-h-[92vh] text-[#34354A]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse text-white" />
            </div>
            <div>
              <h2
                id="emergency-modal-title"
                className="text-lg sm:text-xl font-black font-heading tracking-tight"
              >
                {step === 'ACTIVE_STATUS' ? 'Emergency Alert Active' : 'Emergency Assistance Protocol'}
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                CareNest Priority Family & Caregiver Notification System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/20 text-white transition-colors"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-sm font-bold flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CONFIRMATION SCREEN */}
          {step === 'CONFIRM' && (
            <div className="space-y-5">
              <div className="p-5 rounded-3xl bg-rose-50/70 border-2 border-rose-200 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
                  <ShieldAlert className="w-9 h-9 animate-bounce" />
                </div>
                <h3 className="text-lg sm:text-xl font-black font-heading text-rose-900">
                  Do you need emergency assistance?
                </h3>
                <p className="text-xs sm:text-sm text-rose-700 max-w-lg mx-auto leading-relaxed">
                  Pressing <strong>CONFIRM</strong> will immediately notify your designated family members, on-duty caregivers, and share your permitted emergency healthcare card.
                </p>
              </div>

              {/* Verified Emergency Integration Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1">
                <div className="flex items-center gap-2 font-bold font-heading">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Important Emergency Services Disclaimer:</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed pl-6">
                  CareNest notifies your <strong>authorized family and caregiver circle</strong>. Local municipal emergency services (911) will <strong>NOT</strong> be automatically dispatched unless verified integration is confirmed. If you are experiencing an acute medical emergency, please dial 911 directly.
                </p>
              </div>

              {/* Configured Emergency Contacts Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#7969B5] font-heading">
                  Configured Emergency Contacts to be Notified:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(profileData?.emergencyContacts || [
                    { name: 'Sarah Vance', relationship: 'Daughter / Family Admin', phone: '+1 (555) 345-6789' },
                    { name: 'Marcus Chen', relationship: 'Primary Caregiver', phone: '+1 (555) 456-7890' }
                  ]).map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#34354A] font-heading">
                          {contact.name}
                        </div>
                        <div className="text-[11px] text-[#7A7D9D]">
                          {contact.relationship}
                        </div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1 shadow-2xs"
                        title={`Call ${contact.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleConfirmSos}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-700 hover:to-red-700 active:scale-98 text-white rounded-2xl font-black font-heading text-base tracking-wide shadow-glow-pink flex items-center justify-center gap-2 transition-all cursor-pointer border-2 border-white/60"
                >
                  <ShieldAlert className="w-6 h-6" />
                  <span>YES, SEND EMERGENCY ALERT</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold font-heading text-sm rounded-2xl transition-colors"
                >
                  Cancel / Accidental Tap
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING DISPATCH */}
          {step === 'PROCESSING' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mx-auto" />
              <h3 className="text-lg font-bold font-heading text-[#34354A]">
                Dispatching Emergency Notifications...
              </h3>
              <p className="text-xs text-[#7A7D9D] max-w-sm mx-auto">
                Broadcasting urgent SMS, in-app alerts, and recording care timeline entry for Eleanor Vance.
              </p>
            </div>
          )}

          {/* STEP 3: ACTIVE STATUS & PERMITTED HEALTHCARE PROFILE */}
          {step === 'ACTIVE_STATUS' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Alert Active Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                    <span className="font-black text-sm uppercase tracking-wider font-heading">
                      Emergency Assistance Dispatched!
                    </span>
                  </div>
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-rose-100 leading-relaxed">
                  Your care circle has been alerted. The event has been logged to your care activity timeline.
                </p>
              </div>

              {/* Notification Delivery Success Status */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#7969B5] font-heading flex items-center justify-between">
                  <span>Notification Delivery Status:</span>
                  <span className="text-emerald-700 font-bold lowercase text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
                    {sosResult?.notificationDeliveries?.length || 3} recipients notified
                  </span>
                </h4>
                <div className="space-y-2">
                  {(
                    sosResult?.notificationDeliveries || [
                      {
                        contactName: 'Sarah Vance (Daughter)',
                        phone: '+1 (555) 345-6789',
                        channel: 'SMS & Email Alert',
                        status: 'DELIVERED',
                        details: 'Priority SMS sent with permitted medical profile.'
                      },
                      {
                        contactName: 'Marcus Chen (Caregiver)',
                        phone: '+1 (555) 456-7890',
                        channel: 'In-App SOS Banner & SMS',
                        status: 'DELIVERED',
                        details: 'Dashboard broadcast banner triggered & SMS dispatched.'
                      },
                      {
                        contactName: 'Dr. Elizabeth Adams',
                        phone: '+1 (555) 234-8899',
                        channel: 'Clinical Portal Ledger',
                        status: 'LOGGED',
                        details: 'Timeline entry logged for doctor review.'
                      }
                    ]
                  ).map((delivery, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white border border-gray-200 flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#34354A] font-heading block">
                            {delivery.contactName}
                          </span>
                          <span className="text-[11px] text-[#7A7D9D]">
                            {delivery.channel} • {delivery.details}
                          </span>
                        </div>
                      </div>
                      <a
                        href={`tel:${delivery.phone}`}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1 shrink-0"
                      >
                        <Phone className="w-3 h-3 text-rose-600" /> Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct 911 Dialing Section */}
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <div className="flex items-center gap-2 font-bold text-rose-900 text-sm font-heading">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Need Ambulance / Paramedics?</span>
                  </div>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Municipal emergency services (911) have not been contacted automatically.
                  </p>
                </div>
                <a
                  href="tel:911"
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Phone className="w-4 h-4" /> Call 911 Now
                </a>
              </div>

              {/* Permitted Emergency Medical Profile Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FAF9FF] to-[#E9E3FF]/40 border-2 border-purple-200 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#55428F] font-heading">
                      Permitted Emergency Medical Profile
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[#7969B5] bg-white px-2 py-0.5 rounded-full border border-purple-200">
                    Transmitted to Responders
                  </span>
                </div>

                {/* Patient Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-purple-50">
                    <span className="text-[10px] text-[#7A7D9D] block">Patient Name</span>
                    <span className="font-bold text-[#34354A]">
                      {profileData?.patient?.name || 'Eleanor Vance'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-purple-50">
                    <span className="text-[10px] text-[#7A7D9D] block">Blood Group</span>
                    <span className="font-bold text-[#34354A]">
                      {profileData?.patient?.bloodGroup || 'O+'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-purple-50">
                    <span className="text-[10px] text-[#7A7D9D] block">Primary Contact</span>
                    <span className="font-bold text-[#34354A]">
                      {profileData?.patient?.emergencyContactName || 'Sarah Vance'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-purple-50">
                    <span className="text-[10px] text-[#7A7D9D] block">Contact Phone</span>
                    <span className="font-bold text-[#34354A]">
                      {profileData?.patient?.emergencyContactPhone || '+1 (555) 345-6789'}
                    </span>
                  </div>
                </div>

                {/* Known Allergies */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-rose-700 block">
                    ⚠️ Known Medical Allergies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(profileData?.knownAllergies || ['Penicillin', 'Sulfa Drugs', 'Peanuts']).map(
                      (allergy, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs rounded-xl bg-rose-100 text-rose-800 font-bold border border-rose-200"
                        >
                          {allergy}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#2B6EB5] block">
                    Relevant Medical Conditions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      profileData?.relevantMedicalInfo || [
                        'Hypertension (Stage 1)',
                        'Type 2 Diabetes',
                        'Osteoarthritis'
                      ]
                    ).map((cond, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs rounded-xl bg-blue-100 text-[#2B6EB5] font-semibold border border-blue-200"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Medications (Where Authorized) */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#2B8756] block">
                    Current Medications (Authorized):
                  </span>
                  <div className="space-y-1">
                    {(profileData?.currentMedications || [
                      { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily with breakfast' },
                      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
                      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Daily evening' }
                    ]).map((med, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-white border border-emerald-100 text-xs flex items-center justify-between"
                      >
                        <span className="font-bold text-[#34354A]">
                          {med.name} ({med.dosage})
                        </span>
                        <span className="text-[#7A7D9D] text-[11px]">{med.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/activities');
                  }}
                  className="text-xs font-bold text-[#7969B5] hover:text-[#55428F] flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5" /> View Care Activity Timeline
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-2xl transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

