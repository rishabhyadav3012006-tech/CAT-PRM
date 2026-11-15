import React, { useState } from 'react';
import {
  KeyRound,
  Shield,
  Eye,
  HeartHandshake,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  UserPlus,
  Send,
  Lock
} from 'lucide-react';
import { CircleRole, CirclePermissions, CareCircleInvite } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { InputField } from '../ui/InputField.tsx';
import { circleApi } from '../../api/client.ts';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [targetRole, setTargetRole] = useState<CircleRole>('FAMILY_ADMIN');
  const [targetRelationship, setTargetRelationship] = useState('Daughter');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [invitedPhone, setInvitedPhone] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(48);

  const [permissions, setPermissions] = useState<CirclePermissions>({
    canManageMedications: true,
    canManageAppointments: true,
    canViewVitals: true,
    canRecordVitals: false,
    canManageActivities: true,
    receivesAlerts: true
  });

  const [loading, setLoading] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState<CareCircleInvite | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-adjust default permissions on role switch
  const handleRoleChange = (role: CircleRole) => {
    setTargetRole(role);
    if (role === 'FAMILY_ADMIN') {
      setTargetRelationship('Family Administrator / Trustee');
      setPermissions({
        canManageMedications: true,
        canManageAppointments: true,
        canViewVitals: true,
        canRecordVitals: true,
        canManageActivities: true,
        receivesAlerts: true
      });
    } else if (role === 'FAMILY_VIEWER') {
      setTargetRelationship('Family Member');
      setPermissions({
        canManageMedications: false,
        canManageAppointments: false,
        canViewVitals: true,
        canRecordVitals: false,
        canManageActivities: false,
        receivesAlerts: true
      });
    } else if (role === 'CARETAKER') {
      setTargetRelationship('Home Care Specialist / Nurse');
      setPermissions({
        canManageMedications: true,
        canManageAppointments: true,
        canViewVitals: true,
        canRecordVitals: true,
        canManageActivities: true,
        receivesAlerts: true
      });
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await circleApi.createInvite({
        elderlyId: 'eld-01',
        targetRole,
        targetRelationship,
        invitedEmail: invitedEmail.trim() || undefined,
        invitedPhone: invitedPhone.trim() || undefined,
        expiresInHours,
        defaultPermissions: permissions
      });

      if (res.success && res.data) {
        setGeneratedInvite(res.data);
        onSuccess();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to generate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedInvite) return;
    const shareText = `You have been invited to join Eleanor Vance's CareNest Care Circle as ${generatedInvite.targetRelationship}.\n\nInvitation Code: ${generatedInvite.code}\nExpires In: ${expiresInHours} Hours\n\nTo join, open CareNest, navigate to Join Healthcare Profile, and enter your secure code.`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReset = () => {
    setGeneratedInvite(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Invite Family Member or Caretaker"
      subtitle="Generate secure, SHA-256 hashed, expiring single-use invitation credentials"
      icon={<UserPlus className="w-5 h-5 text-[#7969B5]" />}
      maxWidth="lg"
    >
      {generatedInvite ? (
        /* Generated Code Success View */
        <div className="space-y-5 text-center py-2">
          <div className="w-16 h-16 rounded-3xl bg-[#DDF5E9] text-[#1D6A48] flex items-center justify-center mx-auto shadow-glass-sm">
            <KeyRound className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black font-heading text-[#34354A]">
              Secure Invitation Code Generated!
            </h3>
            <p className="text-xs font-medium text-[#575973] mt-1 max-w-md mx-auto">
              Share this single-use code with{' '}
              <strong>{generatedInvite.targetRelationship}</strong>. It will automatically expire
              in <strong>{expiresInHours} hours</strong>.
            </p>
          </div>

          {/* Big Code Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#E9E3FF]/90 via-[#DFEEFF]/90 to-[#DDF5E9]/90 border-2 border-[#D1C6F8] shadow-glass-sm max-w-md mx-auto">
            <span className="text-[11px] font-black font-heading uppercase tracking-widest text-[#55428F] block mb-1">
              One-Time Single-Use Code
            </span>
            <div className="text-3xl font-black font-mono tracking-widest text-[#34354A] select-all py-1">
              {generatedInvite.code}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#B85820] mt-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Valid for {expiresInHours} Hours • Single Use Only</span>
            </div>
          </div>

          {/* Copy Button */}
          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              className="rounded-2xl shadow-glow-purple px-6"
            >
              <span>{copied ? 'Copied Invitation to Clipboard!' : 'Copy Invitation Message'}</span>
            </Button>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF9ED] border border-[#F7ECCF] text-xs text-[#8C6D1F] text-left max-w-md mx-auto space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Security Guarantee:</span>
            </div>
            <p className="font-medium text-[#575973]">
              The invitation code is stored securely in the database as a cryptographic hash. Once redeemed by the recipient, it is permanently deactivated.
            </p>
          </div>

          <div className="pt-3 border-t border-[#ECEAF5] flex justify-end">
            <Button variant="ghost" size="md" onClick={handleReset}>
              <span>Done</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Invite Creation Form */
        <form onSubmit={handleGenerateCode} className="space-y-4">
          {/* 1. Choose Profile-Specific Role */}
          <div>
            <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
              Select Care Circle Role *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Family Admin */}
              <div
                onClick={() => handleRoleChange('FAMILY_ADMIN')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  targetRole === 'FAMILY_ADMIN'
                    ? 'bg-[#DFEEFF]/80 border-[#2B6EB5] shadow-2xs'
                    : 'bg-white border-[#E5E4F2] hover:border-[#BDDCFF]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-[#1B5494]" />
                  <span className="text-xs font-black font-heading text-[#1B5494]">
                    Family Admin
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#575973] leading-snug">
                  Full control over medical info, invitations, and care circle.
                </p>
              </div>

              {/* Family Viewer */}
              <div
                onClick={() => handleRoleChange('FAMILY_VIEWER')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  targetRole === 'FAMILY_VIEWER'
                    ? 'bg-[#FFF9ED] border-[#B85820] shadow-2xs'
                    : 'bg-white border-[#E5E4F2] hover:border-[#F7ECCF]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-[#8C6D1F]" />
                  <span className="text-xs font-black font-heading text-[#8C6D1F]">
                    Family Viewer
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#575973] leading-snug">
                  Read-only view of daily health telemetry and appointments.
                </p>
              </div>

              {/* Caretaker */}
              <div
                onClick={() => handleRoleChange('CARETAKER')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  targetRole === 'CARETAKER'
                    ? 'bg-[#DDF5E9]/80 border-[#2B8756] shadow-2xs'
                    : 'bg-white border-[#E5E4F2] hover:border-[#B7E7CE]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <HeartHandshake className="w-4 h-4 text-[#1D6A48]" />
                  <span className="text-xs font-black font-heading text-[#1D6A48]">
                    Caretaker
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#575973] leading-snug">
                  Records medications, daily care checklist & vital logs.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Relationship / Role Title */}
          <InputField
            label="Relationship or Clinical Role Title *"
            placeholder="e.g. Son, Daughter, Lead Home Nurse, Physical Therapist"
            value={targetRelationship}
            onChange={(e) => setTargetRelationship(e.target.value)}
            required
          />

          {/* 3. Optional Direct Delivery Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Recipient Email (Optional)"
              type="email"
              placeholder="e.g. family@carenest.health"
              value={invitedEmail}
              onChange={(e) => setInvitedEmail(e.target.value)}
            />

            <InputField
              label="Recipient Phone (Optional)"
              placeholder="e.g. +1 (555) 019-2834"
              value={invitedPhone}
              onChange={(e) => setInvitedPhone(e.target.value)}
            />
          </div>

          {/* 4. Expiration Duration */}
          <div>
            <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
              Code Expiration Duration *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { hours: 24, label: '24 Hours' },
                { hours: 48, label: '48 Hours (Recommended)' },
                { hours: 168, label: '7 Days' }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.hours}
                  onClick={() => setExpiresInHours(opt.hours)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold font-heading transition-all cursor-pointer ${
                    expiresInHours === opt.hours
                      ? 'bg-[#E9E3FF] border-[#7969B5] text-[#55428F] shadow-2xs'
                      : 'bg-white border-[#E5E4F2] text-[#575973] hover:bg-[#FAF9FF]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Granular Permissions Configuration */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black font-heading text-[#34354A]">
                Permissions Preset for this Invitation
              </span>
              <span className="text-[11px] font-bold text-[#7969B5]">
                Customizable per member
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#ECEAF5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canManageMedications}
                  onChange={(e) =>
                    setPermissions({ ...permissions, canManageMedications: e.target.checked })
                  }
                  className="rounded text-[#7969B5] focus:ring-[#7969B5]"
                />
                <span>Manage Medications</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#ECEAF5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canManageAppointments}
                  onChange={(e) =>
                    setPermissions({ ...permissions, canManageAppointments: e.target.checked })
                  }
                  className="rounded text-[#7969B5] focus:ring-[#7969B5]"
                />
                <span>Manage Appointments</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#ECEAF5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canViewVitals}
                  onChange={(e) =>
                    setPermissions({ ...permissions, canViewVitals: e.target.checked })
                  }
                  className="rounded text-[#7969B5] focus:ring-[#7969B5]"
                />
                <span>View Health Vitals</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#ECEAF5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canRecordVitals}
                  onChange={(e) =>
                    setPermissions({ ...permissions, canRecordVitals: e.target.checked })
                  }
                  className="rounded text-[#7969B5] focus:ring-[#7969B5]"
                />
                <span>Record New Vitals</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#ECEAF5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.canManageActivities}
                  onChange={(e) =>
                    setPermissions({ ...permissions, canManageActivities: e.target.checked })
                  }
                  className="rounded text-[#7969B5] focus:ring-[#7969B5]"
                />
                <span>Manage Care Tasks</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#ECEAF5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.receivesAlerts}
                  onChange={(e) =>
                    setPermissions({ ...permissions, receivesAlerts: e.target.checked })
                  }
                  className="rounded text-[#7969B5] focus:ring-[#7969B5]"
                />
                <span>Receive Emergency Alerts</span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#ECEAF5] flex justify-end gap-2.5">
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
              <span>{loading ? 'Generating Code...' : 'Generate Secure Invitation Code'}</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

