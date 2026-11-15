import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Pill, Calendar, Activity, CheckSquare, Bell, Save } from 'lucide-react';
import { CareCircleMember, CirclePermissions } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { circleApi } from '../../api/client.ts';

interface PermissionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: CareCircleMember | null;
  onSuccess: () => void;
}

export const PermissionSettingsModal: React.FC<PermissionSettingsModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess
}) => {
  const [permissions, setPermissions] = useState<CirclePermissions>({
    canManageMedications: false,
    canManageAppointments: false,
    canViewVitals: false,
    canRecordVitals: false,
    canManageActivities: false,
    receivesAlerts: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setPermissions({ ...member.permissions });
    }
  }, [member, isOpen]);

  if (!member) return null;

  const handleToggle = (key: keyof CirclePermissions) => {
    setPermissions({
      ...permissions,
      [key]: !permissions[key]
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await circleApi.updatePermissions(member.id, permissions);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const permissionItems = [
    {
      key: 'canManageMedications' as const,
      label: 'Manage Medications & Prescriptions',
      description: 'Add, edit, log intake doses, and record skip reasons.',
      icon: <Pill className="w-4 h-4 text-[#2B8756]" />
    },
    {
      key: 'canManageAppointments' as const,
      label: 'Manage Doctor Appointments',
      description: 'Schedule, edit, reschedule, or cancel clinical consultations.',
      icon: <Calendar className="w-4 h-4 text-[#2B6EB5]" />
    },
    {
      key: 'canViewVitals' as const,
      label: 'View Health Vitals & History',
      description: 'View biometric graphs, blood pressure, glucose, and oxygen logs.',
      icon: <Activity className="w-4 h-4 text-[#7969B5]" />
    },
    {
      key: 'canRecordVitals' as const,
      label: 'Record Daily Health Vitals',
      description: 'Log new blood pressure readings, heart rate, and blood sugar tests.',
      icon: <Activity className="w-4 h-4 text-[#B85820]" />
    },
    {
      key: 'canManageActivities' as const,
      label: 'Manage Care Tasks & Daily Checklist',
      description: 'Create and mark completed hygiene, meals, and mobility routines.',
      icon: <CheckSquare className="w-4 h-4 text-[#A62650]" />
    },
    {
      key: 'receivesAlerts' as const,
      label: 'Receive Instant Emergency SOS Alerts',
      description: 'Receive emergency notifications, SMS, and geolocation when SOS triggers.',
      icon: <Bell className="w-4 h-4 text-rose-600" />
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Healthcare Permissions"
      subtitle={`Granular access control for ${member.userName} (${member.relationship})`}
      icon={<Sliders className="w-5 h-5 text-[#7969B5]" />}
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Member Recap Header */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] flex items-center justify-between text-xs">
          <div>
            <p className="font-black text-[#34354A]">{member.userName}</p>
            <p className="text-[#7969B5] font-bold">{member.relationship}</p>
          </div>
          <span className="px-2.5 py-1 rounded-xl font-bold bg-[#E9E3FF] text-[#55428F]">
            {member.circleRole.replace('_', ' ')}
          </span>
        </div>

        {/* Permissions List */}
        <div className="space-y-2.5">
          {permissionItems.map((item) => {
            const isChecked = permissions[item.key];
            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isChecked
                    ? 'bg-[#FAF9FF] border-[#D1C6F8]'
                    : 'bg-white border-[#ECEAF5] opacity-75'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white border border-[#ECEAF5] flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-black font-heading text-[#34354A]">
                      {item.label}
                    </p>
                    <p className="text-[11px] font-medium text-[#575973] leading-snug mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(item.key)}
                    className="w-4 h-4 text-[#7969B5] rounded border-[#C2B5F0] focus:ring-[#7969B5] cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
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
            leftIcon={<Save className="w-4 h-4" />}
            className="rounded-2xl shadow-glow-purple px-6"
          >
            <span>{loading ? 'Saving...' : 'Save Permissions'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

