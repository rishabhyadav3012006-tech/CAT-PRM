import React from 'react';
import { Clock, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { CareCircleMember } from '../../types/index.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { Button } from '../ui/Button.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface PendingRequestsCardProps {
  requests: CareCircleMember[];
  onApprove: (memberId: string) => void;
  onReject: (memberId: string) => void;
}

export const PendingRequestsCard: React.FC<PendingRequestsCardProps> = ({
  requests,
  onApprove,
  onReject
}) => {
  if (requests.length === 0) return null;

  return (
    <GlassCard
      variant="peach"
      padding="lg"
      rounded="3xl"
      className="border-2 border-[#FBD2BA] shadow-glass-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#B85820] animate-pulse" />
          <h3 className="font-black font-heading text-[#34354A] text-base">
            Care Circle Membership Requests ({requests.length})
          </h3>
        </div>
        <CuteBadge variant="peach" size="sm">
          Action Required
        </CuteBadge>
      </div>

      <p className="text-xs font-medium text-[#575973]">
        The following individuals have submitted an invitation code to join Eleanor's healthcare
        circle. Review and approve their access.
      </p>

      <div className="space-y-2.5 pt-1">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-3.5 rounded-2xl bg-white border border-[#FBD2BA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-start gap-3">
              {req.avatarUrl ? (
                <img
                  src={req.avatarUrl}
                  alt={req.userName}
                  className="w-11 h-11 rounded-2xl object-cover border"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-[#FFE9DC] text-[#B85820] font-black flex items-center justify-center flex-shrink-0">
                  {req.userName.substring(0, 2).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black font-heading text-sm text-[#34354A]">
                    {req.userName}
                  </h4>
                  <CuteBadge variant="babyBlue" size="sm">
                    {req.circleRole.replace('_', ' ')}
                  </CuteBadge>
                </div>
                <p className="text-xs font-bold text-[#7969B5]">{req.relationship}</p>
                {req.notes && (
                  <p className="text-[11px] font-medium text-[#7A7D9D] mt-0.5 italic">
                    "{req.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReject(req.id)}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                className="rounded-xl text-rose-600 hover:bg-[#FCE4ED]/60 text-xs"
              >
                <span>Decline</span>
              </Button>
              <Button
                variant="mint"
                size="sm"
                onClick={() => onApprove(req.id)}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="rounded-xl font-bold text-xs shadow-2xs"
              >
                <span>Approve Membership</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

