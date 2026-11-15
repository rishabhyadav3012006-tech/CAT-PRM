import React, { useState } from 'react';
import {
  FileText,
  Pill,
  Droplet,
  History,
  Activity,
  FileCheck,
  FolderLock,
  Download,
  Eye,
  Archive,
  RotateCcw,
  Building2,
  Calendar,
  Lock,
  Tag,
  Check
} from 'lucide-react';
import { VaultDocument, VaultCategory } from '../../types/index.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { vaultApi } from '../../api/client.ts';

interface VaultDocumentCardProps {
  document: VaultDocument;
  onViewDetails: (doc: VaultDocument) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

export const getCategoryMeta = (cat: VaultCategory) => {
  switch (cat) {
    case 'PRESCRIPTION':
      return {
        label: 'Prescription',
        variant: 'mint' as const,
        icon: <Pill className="w-3.5 h-3.5 text-[#1D6A48]" />,
        bgIcon: 'bg-[#DDF5E9] text-[#1D6A48]'
      };
    case 'BLOOD_REPORT':
      return {
        label: 'Blood Report',
        variant: 'pink' as const,
        icon: <Droplet className="w-3.5 h-3.5 text-[#A62650]" />,
        bgIcon: 'bg-[#FCE4ED] text-[#A62650]'
      };
    case 'MEDICAL_HISTORY':
      return {
        label: 'Medical History',
        variant: 'lavender' as const,
        icon: <History className="w-3.5 h-3.5 text-[#55428F]" />,
        bgIcon: 'bg-[#E9E3FF] text-[#55428F]'
      };
    case 'DIAGNOSTIC_REPORT':
      return {
        label: 'Diagnostic Report',
        variant: 'babyBlue' as const,
        icon: <Activity className="w-3.5 h-3.5 text-[#1B5494]" />,
        bgIcon: 'bg-[#DFEEFF] text-[#1B5494]'
      };
    case 'DISCHARGE_SUMMARY':
      return {
        label: 'Discharge Summary',
        variant: 'peach' as const,
        icon: <FileCheck className="w-3.5 h-3.5 text-[#B85820]" />,
        bgIcon: 'bg-[#FFE9DC] text-[#B85820]'
      };
    case 'OTHER':
    default:
      return {
        label: 'Other Document',
        variant: 'cream' as const,
        icon: <FileText className="w-3.5 h-3.5 text-[#8C6D1F]" />,
        bgIcon: 'bg-[#FFF9ED] text-[#8C6D1F]'
      };
  }
};

export const VaultDocumentCard: React.FC<VaultDocumentCardProps> = ({
  document,
  onViewDetails,
  onArchive,
  onRestore
}) => {
  const meta = getCategoryMeta(document.category);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const dateStr = new Date(document.documentDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res: any = await vaultApi.getSignedUrl(document.id, 15);
      if (res.success && res.data) {
        // Trigger simulated secure download
        const signedUrl = res.data.signedDownloadUrl;
        const link = window.document.createElement('a');
        link.href = signedUrl;
        link.setAttribute('download', document.fileName);
        window.document.body.appendChild(link);
        link.click();
        link.remove();

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err: any) {
      alert('Failed to generate authorized signed link.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <GlassCard
      variant={document.isArchived ? 'cream' : 'white'}
      padding="lg"
      rounded="3xl"
      className={`border-2 transition-all flex flex-col justify-between ${
        document.isArchived
          ? 'border-[#F7ECCF] opacity-80'
          : 'hover:border-[#C2B5F0] hover:shadow-glass'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <CuteBadge variant={meta.variant} size="sm" icon={meta.icon}>
            {meta.label}
          </CuteBadge>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#7A7D9D] px-2 py-0.5 rounded-lg bg-[#FAF9FF] border border-[#ECEAF5]">
              {document.fileSize}
            </span>
            {document.isArchived && (
              <span className="text-[11px] font-bold text-[#8C6D1F] px-2 py-0.5 rounded-lg bg-[#FFF9ED] border border-[#F7ECCF]">
                Archived
              </span>
            )}
          </div>
        </div>

        {/* Title & Icon Header */}
        <div className="flex items-start gap-3.5 mb-3">
          <div
            className={`w-12 h-12 rounded-2xl ${meta.bgIcon} flex items-center justify-center flex-shrink-0 shadow-2xs font-bold`}
          >
            {meta.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-black font-heading text-[#34354A] text-base leading-snug line-clamp-2">
              {document.title}
            </h3>

            {document.doctorName && (
              <p className="text-xs font-bold text-[#7969B5] mt-0.5 truncate">
                {document.doctorName}
              </p>
            )}

            {document.facilityName && (
              <p className="text-[11px] font-medium text-[#575973] flex items-center gap-1 mt-0.5 truncate">
                <Building2 className="w-3 h-3 text-[#7A7D9D] flex-shrink-0" />
                <span className="truncate">{document.facilityName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Metadata Details Box */}
        <div className="p-2.5 rounded-2xl bg-[#FAF9FF] border border-[#ECEAF5] space-y-1 text-xs mb-3">
          <div className="flex items-center justify-between text-[#575973]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7969B5]" />
              Issue Date:
            </span>
            <span className="font-bold text-[#34354A]">{dateStr}</span>
          </div>

          <div className="flex items-center justify-between text-[#575973]">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#2B6EB5]" />
              Uploaded By:
            </span>
            <span className="font-medium text-[#34354A] truncate max-w-[150px]">
              {document.uploadedByName}
            </span>
          </div>
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {document.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white border border-[#ECEAF5] text-[#575973]"
              >
                <Tag className="w-2.5 h-2.5 text-[#7969B5]" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Clinical Notes Excerpt */}
        {document.notes && (
          <p className="text-[11px] font-medium text-[#575973] bg-[#FFF9ED] border border-[#F7ECCF] p-2 rounded-xl mb-3 line-clamp-2 leading-relaxed">
            {document.notes}
          </p>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="pt-3 border-t border-[#ECEAF5] flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails(document)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          className="rounded-xl text-xs py-1 px-2.5"
        >
          <span>View Details</span>
        </Button>

        <div className="flex items-center gap-1.5">
          <Button
            variant="mint"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            leftIcon={
              downloadSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )
            }
            className="rounded-xl text-xs py-1 px-2.5"
            title="Download via 15-minute cryptographically signed link"
          >
            <span>{downloadSuccess ? 'Downloaded!' : downloading ? 'Signing...' : 'Download'}</span>
          </Button>

          {document.isArchived ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(document.id)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="rounded-xl text-xs py-1 px-2 text-[#7969B5]"
              title="Restore to active vault"
            >
              <span>Restore</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(document.id)}
              leftIcon={<Archive className="w-3.5 h-3.5" />}
              className="rounded-xl text-xs py-1 px-2 text-[#7A7D9D] hover:text-[#34354A]"
              title="Archive outdated document"
            >
              <span>Archive</span>
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

