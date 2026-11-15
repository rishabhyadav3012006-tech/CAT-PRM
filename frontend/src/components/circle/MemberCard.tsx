import React from 'react';
import {
  Shield,
  ShieldCheck,
  Eye,
  HeartHandshake,
  Pill,
  Calendar,
  Activity,
  CheckSquare,
  Bell,
  Sliders,
  UserX,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { CareCircleMember, CircleRole } from '../../types/index.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';

interface MemberCardProps {
  member: CareCircleMember;
  onOpenPermissions: (member: CareCircleMember) => void;
  onOpenChangeRole: (member: CareCircleMember) => void;
  onRevokeAccess: (member: CareCircleMember) => void;
  onApprove: (memberId: string) => void;
  onReject: (memberId: string) => void;
  currentUserRole?: CircleRole;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onOpenPermissions,
  onOpenChangeRole,
  onRevokeAccess,
  onApprove,
  onReject,
  currentUserRole = 'FAMILY_ADMIN'
}) => {
  const isOwner = member.circleRole === 'ELDERLY_OWNER';
  const isPending = member.status === 'PENDING_APPROVAL';

  // Role visual configuration
  const getRoleBadge = (role: CircleRole) => {
    switch (role) {
      case 'ELDERLY_OWNER':
        return {
          label: 'Profile Owner',
          variant: 'lavender' as const,
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#55428F]" />,
          desc: 'Primary control over profile & sharing'
        };
      case 'FAMILY_ADMIN':
        return {
          label: 'Family Administrator',
          variant: 'babyBlue' as const,
          icon: <Shield className="w-3.5 h-3.5 text-[#1B5494]" />,
          desc: 'Manages permitted health info & invites'
        };
      case 'FAMILY_VIEWER':
        return {
          label: 'Family Viewer',
          variant: 'cream' as const,
          icon: <Eye className="w-3.5 h-3.5 text-[#8C6D1F]" />,
          desc: 'Views permitted health telemetry'
        };
      case 'CARETAKER':
        return {
          label: 'Caretaker',
          variant: 'mint' as const,
          icon: <HeartHandshake className="w-3.5 h-3.5 text-[#1D6A48]" />,
          desc: 'Records daily tasks & medication events'
        };
    }
  };

  const roleInfo = getRoleBadge(member.circleRole);

  // Initials for avatar fallback
  const initials = member.userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <GlassCard
      variant={isPending ? 'peach' : 'white'}
      padding="lg"
      rounded="3xl"
      className={`border-2 transition-all flex flex-col justify-between ${
        isPending
          ? 'border-[#FBD2BA] shadow-glass-sm'
          : isOwner
          ? 'border-[#D1C6F8] shadow-sm'
          : 'hover:border-[#C2B5F0] hover:shadow-glass'
      }`}
    >
      <div>
        {/* Top Header: Role & Status */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <CuteBadge variant={roleInfo.variant} size="sm" icon={roleInfo.icon}>
            {roleInfo.label}
          </CuteBadge>

          {isPending ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-[#FFE9DC] text-[#B85820] border border-[#FBD2BA] animate-pulse">
              <Clock className="w-3 h-3" />
              Pending Approval
            </span>
          ) : (
            <CuteBadge variant="mint" size="sm" dot>
              Active
            </CuteBadge>
          )}
        </div>

        {/* Member Avatar & Basic Info */}
        <div className="flex items-start gap-3.5 mb-3.5">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.userName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-2xs flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#E9E3FF] text-[#7969B5] font-black font-heading text-lg flex items-center justify-center flex-shrink-0 shadow-2xs">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-black font-heading text-[#34354A] text-lg leading-tight truncate">
              {member.userName}
            </h3>
            <p className="text-xs font-bold text-[#7969B5] mt-0.5 truncate">
              {member.relationship}
            </p>

            <div className="space-y-0.5 mt-1.5 text-[11px] font-medium text-[#575973]">
              <p className="flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 text-[#7A7D9D] flex-shrink-0" />
                <span className="truncate">{member.userEmail}</span>
              </p>
              {member.userPhone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#7A7D9D] flex-shrink-0" />
                  <span>{member.userPhone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Caretaker Shift Info */}
        {member.shiftInfo && (
          <div className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#ECEAF5] text-xs text-[#34354A] mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#2B8756] flex-shrink-0" />
            <span>
              <strong>Shift:</strong> {member.shiftInfo}
            </span>
          </div>
        )}

        {/* Role Description Note */}
        <p className="text-[11px] font-medium text-[#7A7D9D] italic mb-3">
          {roleInfo.desc}
        </p>

        {/* Active Permission Badges */}
        <div className="space-y-1.5 pt-2 border-t border-[#ECEAF5] mb-3">
          <p className="text-[10px] font-black font-heading uppercase text-[#7A7D9D] tracking-wider">
            Enabled Permissions
          </p>

          <div className="flex flex-wrap gap-1.5">
            {member.permissions.canManageMedications && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#DDF5E9] text-[#1D6A48]">
                <Pill className="w-3 h-3" />
                Medications
              </span>
            )}
            {member.permissions.canManageAppointments && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#DFEEFF] text-[#1B5494]">
                <Calendar className="w-3 h-3" />
                Appointments
              </span>
            )}
            {member.permissions.canViewVitals && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#E9E3FF] text-[#55428F]">
                <Activity className="w-3 h-3" />
                View Vitals
              </span>
            )}
            {member.permissions.canRecordVitals && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FFE9DC] text-[#B85820]">
                <Activity className="w-3 h-3" />
                Record Vitals
              </span>
            )}
            {member.permissions.canManageActivities && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FCE4ED] text-[#A62650]">
                <CheckSquare className="w-3 h-3" />
                Care Tasks
              </span>
            )}
            {member.permissions.receivesAlerts && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FCE4ED] text-[#A62650]">
                <Bell className="w-3 h-3" />
                SOS Alerts
              </span>
            )}
          </div>
        </div>

        {/* Candidate Notes if pending */}
        {isPending && member.notes && (
          <p className="text-xs font-medium text-[#B85820] bg-white p-2 rounded-xl border border-[#FBD2BA] mb-3 leading-relaxed">
            <strong>Join Note:</strong> {member.notes}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#ECEAF5] mt-auto">
        {isPending ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReject(member.id)}
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
              className="rounded-xl text-rose-600 hover:bg-[#FCE4ED]/60 text-xs"
            >
              <span>Decline</span>
            </Button>
            <Button
              variant="mint"
              size="sm"
              onClick={() => onApprove(member.id)}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              className="rounded-xl font-black text-xs"
            >
              <span>Approve Member</span>
            </Button>
          </div>
        ) : isOwner ? (
          <div className="text-right">
            <span className="text-[11px] font-bold text-[#7969B5] italic">
              Primary Profile Owner
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpenPermissions(member)}
                leftIcon={<Sliders className="w-3 h-3" />}
                className="rounded-xl text-xs py-1 px-2.5"
                title="Configure Granular Permissions"
              >
                <span>Permissions</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChangeRole(member)}
                leftIcon={<Shield className="w-3 h-3" />}
                className="rounded-xl text-xs py-1 px-2 text-[#575973] hover:text-[#34354A]"
                title="Change Member Role"
              >
                <span>Role</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRevokeAccess(member)}
              leftIcon={<UserX className="w-3 h-3" />}
              className="rounded-xl text-rose-600 hover:bg-[#FCE4ED]/60 text-xs py-1 px-2"
              title="Revoke Circle Access"
            >
              <span>Revoke</span>
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

