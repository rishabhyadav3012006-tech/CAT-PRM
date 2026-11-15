import React, { useState } from 'react';
import { Shield, Eye, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { CareCircleMember, CircleRole } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { circleApi } from '../../api/client.ts';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: CareCircleMember | null;
  onSuccess: () => void;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess
}) => {
  const [selectedRole, setSelectedRole] = useState<CircleRole>('FAMILY_ADMIN');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (member && member.circleRole !== 'ELDERLY_OWNER') {
      setSelectedRole(member.circleRole);
    }
  }, [member, isOpen]);

  if (!member) return null;

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await circleApi.updateRole(member.id, selectedRole);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      role: 'FAMILY_ADMIN' as const,
      title: 'Family Administrator',
      description: 'Manage permitted healthcare information, invitations, and family circle members.',
      icon: <Shield className="w-5 h-5 text-[#1B5494]" />,
      bgClass: 'bg-[#DFEEFF]/60 border-[#BDDCFF] text-[#1B5494]'
    },
    {
      role: 'FAMILY_VIEWER' as const,
      title: 'Family Viewer',
      description: 'View permitted healthcare telemetry, appointments, and general updates (read-only).',
      icon: <Eye className="w-5 h-5 text-[#8C6D1F]" />,
      bgClass: 'bg-[#FFF9ED] border-[#F7ECCF] text-[#8C6D1F]'
    },
    {
      role: 'CARETAKER' as const,
      title: 'Caretaker / Nurse',
      description: 'Record assigned care activities, meal completion, and daily medication administration events.',
      icon: <HeartHandshake className="w-5 h-5 text-[#1D6A48]" />,
      bgClass: 'bg-[#DDF5E9]/60 border-[#B7E7CE] text-[#1D6A48]'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Profile-Specific Role"
      subtitle={`Change access role and capabilities for ${member.userName}`}
      icon={<Shield className="w-5 h-5 text-[#7969B5]" />}
      maxWidth="md"
    >
      <form onSubmit={handleSaveRole} className="space-y-4">
        <div className="space-y-2.5">
          {roles.map((r) => {
            const isSelected = selectedRole === r.role;
            return (
              <div
                key={r.role}
                onClick={() => setSelectedRole(r.role)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? `${r.bgClass} shadow-2xs`
                    : 'bg-white border-[#ECEAF5] hover:border-[#D1C6F8]'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-[#ECEAF5] flex-shrink-0 mt-0.5">
                  {r.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-black font-heading text-sm text-[#34354A]">
                      {r.title}
                    </p>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#7969B5] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#575973] mt-1 leading-snug">
                    {r.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

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
            <span>{loading ? 'Saving Role...' : 'Confirm Role Assignment'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

