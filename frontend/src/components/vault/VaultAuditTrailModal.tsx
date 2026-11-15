import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Download,
  Eye,
  Upload,
  Archive,
  RotateCcw,
  Clock,
  Lock,
  FileText
} from 'lucide-react';
import { VaultAccessLog } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { vaultApi } from '../../api/client.ts';

interface VaultAuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaultAuditTrailModal: React.FC<VaultAuditTrailModalProps> = ({
  isOpen,
  onClose
}) => {
  const [logs, setLogs] = useState<VaultAccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchLogs = async () => {
        try {
          const res: any = await vaultApi.getAuditLogs('eld-01');
          if (res.success && res.data) {
            setLogs(res.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }
  }, [isOpen]);

  const getActionBadge = (action: VaultAccessLog['action']) => {
    switch (action) {
      case 'UPLOADED':
        return {
          label: 'Uploaded to Vault',
          variant: 'babyBlue' as const,
          icon: <Upload className="w-3.5 h-3.5 text-[#1B5494]" />
        };
      case 'VIEWED':
        return {
          label: 'Inspected Metadata',
          variant: 'lavender' as const,
          icon: <Eye className="w-3.5 h-3.5 text-[#55428F]" />
        };
      case 'DOWNLOADED':
        return {
          label: 'Signed Download',
          variant: 'mint' as const,
          icon: <Download className="w-3.5 h-3.5 text-[#1D6A48]" />
        };
      case 'ARCHIVED':
        return {
          label: 'Archived Record',
          variant: 'peach' as const,
          icon: <Archive className="w-3.5 h-3.5 text-[#B85820]" />
        };
      case 'RESTORED':
        return {
          label: 'Restored Record',
          variant: 'mint' as const,
          icon: <RotateCcw className="w-3.5 h-3.5 text-[#1D6A48]" />
        };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medical Vault Access & Modification Audit Ledger"
      subtitle="Complete chronological audit trail recorded for clinical security & HIPAA compliance"
      icon={<ShieldCheck className="w-5 h-5 text-[#7969B5]" />}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Compliance Callout */}
        <div className="p-3.5 rounded-2xl bg-[#DDF5E9]/60 border border-[#B7E7CE] flex items-start gap-2.5 text-xs text-[#1D6A48]">
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="font-medium">
            <strong>Immutable Security Audit Trail:</strong> Every document upload, metadata view, signed download, and archival event is cryptographically recorded with actor ID, timestamp, and verification tokens.
          </p>
        </div>

        {/* Logs List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {logs.map((log) => {
            const badge = getActionBadge(log.action);
            const timeStr = new Date(log.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] hover:border-[#D1C6F8] transition-all space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <CuteBadge variant={badge.variant} size="sm" icon={badge.icon}>
                      {badge.label}
                    </CuteBadge>
                    <span className="text-xs font-black font-heading text-[#34354A]">
                      {log.actorName}
                    </span>
                    <span className="text-[10px] font-bold text-[#7969B5] px-1.5 py-0.5 rounded bg-white border border-[#ECEAF5]">
                      {log.actorRole}
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-[#7A7D9D] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#A2A1B8]" />
                    {timeStr}
                  </span>
                </div>

                <div className="text-xs font-bold text-[#34354A] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#7969B5] flex-shrink-0" />
                  <span className="truncate">{log.documentTitle}</span>
                </div>

                {log.details && (
                  <p className="text-[11px] font-medium text-[#575973] bg-white p-2 rounded-xl border border-[#ECEAF5]">
                    {log.details}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[#ECEAF5] flex justify-end">
          <Button variant="ghost" size="md" onClick={onClose} className="rounded-xl">
            <span>Close</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

