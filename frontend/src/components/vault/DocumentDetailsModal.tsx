import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Building2,
  Calendar,
  Lock,
  Tag,
  ShieldCheck,
  Archive,
  RotateCcw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { VaultDocument } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { getCategoryMeta } from './VaultDocumentCard.tsx';
import { vaultApi } from '../../api/client.ts';

interface DocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: VaultDocument | null;
  onRefresh: () => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  isOpen,
  onClose,
  document,
  onRefresh,
  onArchive,
  onRestore
}) => {
  const [signedUrlData, setSignedUrlData] = useState<{
    signedDownloadUrl: string;
    expiresInMinutes: number;
    expiresAt: string;
  } | null>(null);

  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setSignedUrlData(null);
    setCopied(false);
  }, [document, isOpen]);

  if (!document) return null;

  const meta = getCategoryMeta(document.category);

  const issueDateStr = new Date(document.documentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const uploadDateStr = new Date(document.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleGenerateSignedLink = async () => {
    setGenerating(true);
    try {
      const res: any = await vaultApi.getSignedUrl(document.id, 15);
      if (res.success && res.data) {
        setSignedUrlData(res.data);
      }
    } catch (err: any) {
      alert('Failed to generate authorized signed link.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopySignedUrl = () => {
    if (!signedUrlData) return;
    const fullUrl = `${window.location.origin}${signedUrlData.signedDownloadUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medical Vault Record Dossier"
      subtitle="Encrypted clinical document inspection, verification, and authorized short-lived download links"
      icon={<Lock className="w-5 h-5 text-[#7969B5]" />}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Header Hero Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#E9E3FF]/80 via-[#DFEEFF]/80 to-[#DDF5E9]/80 border-2 border-[#D1C6F8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-glass-sm">
          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-2xl ${meta.bgIcon} flex items-center justify-center flex-shrink-0 shadow-sm font-bold`}>
              {meta.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black font-heading text-[#34354A] text-lg sm:text-xl">
                  {document.title}
                </h3>
                <CuteBadge variant={meta.variant} size="sm">
                  {meta.label}
                </CuteBadge>
              </div>
              <p className="text-xs font-bold text-[#7969B5] mt-0.5">
                {document.doctorName || 'Attending Physician'} • {document.facilityName || 'Clinical Facility'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-[#575973] px-2.5 py-1 rounded-xl bg-white border border-[#ECEAF5]">
              {document.fileSize} • {document.fileType.replace('application/', '').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-1.5 text-xs">
            <p className="text-[10px] font-black font-heading uppercase text-[#7A7D9D] tracking-wider">
              Clinical Issuance
            </p>
            <p className="flex items-center gap-2 text-[#34354A] font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#7969B5]" />
              <span>Issue Date: {issueDateStr}</span>
            </p>
            {document.facilityName && (
              <p className="flex items-center gap-2 text-[#575973]">
                <Building2 className="w-3.5 h-3.5 text-[#7A7D9D]" />
                <span>{document.facilityName}</span>
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-1.5 text-xs">
            <p className="text-[10px] font-black font-heading uppercase text-[#7A7D9D] tracking-wider">
              Vault Cryptographic Metadata
            </p>
            <p className="flex items-center gap-2 text-[#34354A] font-medium">
              <Lock className="w-3.5 h-3.5 text-[#2B6EB5]" />
              <span>Uploaded By: <strong>{document.uploadedByName}</strong> ({document.uploadedByRole})</span>
            </p>
            <p className="flex items-center gap-2 text-[#7A7D9D]">
              <Clock className="w-3.5 h-3.5 text-[#7A7D9D]" />
              <span>Timestamp: {uploadDateStr}</span>
            </p>
          </div>
        </div>

        {/* Document Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-bold text-[#7A7D9D] mr-1">Tags:</span>
            {document.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#E9E3FF] text-[#55428F] border border-[#D1C6F8]"
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Clinical Notes / Findings */}
        {document.notes && (
          <div className="p-3.5 rounded-2xl bg-[#FFF9ED] border border-[#F7ECCF] space-y-1">
            <h4 className="text-xs font-black font-heading text-[#8C6D1F]">
              Clinical Summary & Findings:
            </h4>
            <p className="text-xs font-medium text-[#575973] leading-relaxed whitespace-pre-line">
              {document.notes}
            </p>
          </div>
        )}

        {/* Simulated Document / Scan Viewer */}
        <div className="p-3.5 rounded-2xl bg-white border-2 border-[#ECEAF5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-heading text-[#34354A] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#7969B5]" />
              Encrypted Document Preview
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Integrity
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#ECEAF5] bg-slate-900 aspect-[16/9] max-h-60 flex items-center justify-center group">
            <img
              src={document.previewUrl}
              alt={document.title}
              className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
              <p className="text-xs font-bold truncate">{document.fileName}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Private Object Key: {document.storageKey}
              </p>
            </div>
          </div>
        </div>

        {/* Short-Lived Signed Download Link Generator */}
        <div className="p-4 rounded-2xl bg-[#DFEEFF]/40 border-2 border-[#BDDCFF] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-black font-heading text-[#1B5494] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Authorized Short-Lived Signed Download Link
              </h4>
              <p className="text-[11px] font-medium text-[#575973] mt-0.5">
                Generates a temporary HMAC-SHA256 signature URL valid for 15 minutes only.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateSignedLink}
              disabled={generating}
              className="rounded-xl shadow-glow-purple text-xs"
            >
              <span>{generating ? 'Generating HMAC...' : 'Generate 15m Signed Link'}</span>
            </Button>
          </div>

          {signedUrlData && (
            <div className="p-3 rounded-xl bg-white border border-[#BDDCFF] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1D6A48] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Link Active • Expires in 15 Minutes
                </span>
                <button
                  type="button"
                  onClick={handleCopySignedUrl}
                  className="text-xs font-bold text-[#7969B5] hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-[#575973] bg-[#FAF9FF] p-2 rounded-lg break-all select-all border border-[#ECEAF5]">
                {signedUrlData.signedDownloadUrl}
              </div>

              <div className="flex justify-end">
                <a
                  href={signedUrlData.signedDownloadUrl}
                  download={document.fileName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DDF5E9] text-[#1D6A48] border border-[#B7E7CE] text-xs font-bold hover:bg-[#D0F0DF] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Authorized File ({document.fileSize})</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-3 border-t border-[#ECEAF5] flex items-center justify-between gap-2.5">
          <Button variant="ghost" size="md" onClick={onClose} className="rounded-xl">
            <span>Close</span>
          </Button>

          <div className="flex items-center gap-2">
            {document.isArchived ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  onRestore(document.id);
                  onClose();
                }}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                className="rounded-xl text-xs"
              >
                <span>Restore to Active Vault</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  onArchive(document.id);
                  onClose();
                }}
                leftIcon={<Archive className="w-4 h-4" />}
                className="rounded-xl text-xs text-[#7A7D9D] hover:text-[#34354A]"
              >
                <span>Archive Outdated Document</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

