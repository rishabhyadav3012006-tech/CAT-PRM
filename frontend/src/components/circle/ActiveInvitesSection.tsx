import React, { useState } from 'react';
import { KeyRound, Clock, Copy, Check, XCircle, ShieldAlert, AlertCircle } from 'lucide-react';
import { CareCircleInvite } from '../../types/index.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { Button } from '../ui/Button.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface ActiveInvitesSectionProps {
  invites: CareCircleInvite[];
  onRevoke: (inviteId: string) => void;
  onOpenInviteModal: () => void;
}

export const ActiveInvitesSection: React.FC<ActiveInvitesSectionProps> = ({
  invites,
  onRevoke,
  onOpenInviteModal
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black font-heading text-[#34354A]">
            Active & Expiring Invitation Credentials
          </h3>
          <p className="text-xs font-medium text-[#575973]">
            Single-use cryptographic invitation tokens with automatic expiry
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenInviteModal}
          leftIcon={<KeyRound className="w-3.5 h-3.5" />}
          className="rounded-xl text-xs"
        >
          <span>Generate New Code</span>
        </Button>
      </div>

      {invites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {invites.map((inv) => {
            const isExpired = new Date() > new Date(inv.expiresAt);
            const expDateStr = new Date(inv.expiresAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <GlassCard
                key={inv.id}
                variant="white"
                padding="md"
                rounded="2xl"
                className={`border-2 transition-all flex flex-col justify-between ${
                  inv.isRevoked
                    ? 'border-[#F7C6D7] opacity-60 bg-[#FAF9FF]'
                    : isExpired
                    ? 'border-[#ECEAF5] opacity-75'
                    : 'border-[#BDDCFF] hover:border-[#7969B5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold font-mono tracking-wider px-2.5 py-1 rounded-xl bg-[#FAF9FF] border border-[#ECEAF5] text-[#34354A]">
                      {inv.code}
                    </span>

                    <CuteBadge
                      variant={
                        inv.isRevoked
                          ? 'pink'
                          : inv.isUsed
                          ? 'mint'
                          : isExpired
                          ? 'cream'
                          : 'babyBlue'
                      }
                      size="sm"
                    >
                      {inv.isRevoked
                        ? 'Revoked'
                        : inv.isUsed
                        ? 'Redeemed'
                        : isExpired
                        ? 'Expired'
                        : 'Active Code'}
                    </CuteBadge>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-black text-[#34354A]">
                      {inv.targetRelationship}{' '}
                      <span className="text-[#7969B5] font-semibold">
                        ({inv.targetRole.replace('_', ' ')})
                      </span>
                    </p>

                    <p className="text-[#575973] flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[#B85820]" />
                      <span>
                        Expires: <strong>{expDateStr}</strong>
                      </span>
                    </p>

                    <p className="text-[11px] font-medium text-[#7A7D9D]">
                      Created by {inv.createdByName}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ECEAF5] flex items-center justify-between gap-2 mt-3">
                  {!inv.isRevoked && !inv.isUsed && !isExpired ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyCode(inv.id, inv.code)}
                        leftIcon={
                          copiedId === inv.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                        className="rounded-xl text-xs py-1"
                      >
                        <span>{copiedId === inv.id ? 'Copied!' : 'Copy Code'}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRevoke(inv.id)}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        className="rounded-xl text-xs text-rose-600 hover:bg-[#FCE4ED]/60 py-1"
                      >
                        <span>Revoke</span>
                      </Button>
                    </>
                  ) : (
                    <span className="text-[11px] font-bold text-[#7A7D9D] italic">
                      {inv.isRevoked
                        ? 'Code cancelled'
                        : inv.isUsed
                        ? 'Single-use code redeemed'
                        : 'Code expired'}
                    </span>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard variant="cream" padding="md" rounded="2xl" className="text-center py-6">
          <KeyRound className="w-8 h-8 text-[#B85820] mx-auto mb-1.5 opacity-60" />
          <p className="text-xs font-bold text-[#34354A]">No Active Invitation Codes</p>
          <p className="text-[11px] font-medium text-[#7A7D9D]">
            Click 'Generate New Code' to securely invite a family member or caretaker.
          </p>
        </GlassCard>
      )}
    </div>
  );
};

