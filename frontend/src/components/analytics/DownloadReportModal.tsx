import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Code, X, ShieldCheck, Check } from 'lucide-react';
import { analyticsApi } from '../../api/client.ts';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  elderlyId?: string;
  patientName: string;
  selectedPeriod: string;
  customStartDate?: string;
  customEndDate?: string;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  elderlyId,
  patientName,
  selectedPeriod,
  customStartDate,
  customEndDate
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'html' | 'csv' | 'json'>('html');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const params = {
        elderlyId,
        period: selectedPeriod,
        startDate: customStartDate,
        endDate: customEndDate,
        format: selectedFormat
      };

      const response: any = await analyticsApi.downloadReport(params);

      // Trigger browser download
      const mimeTypes: Record<string, string> = {
        html: 'text/html;charset=utf-8',
        csv: 'text/csv;charset=utf-8',
        json: 'application/json;charset=utf-8'
      };
      const extensions: Record<string, string> = {
        html: 'html',
        csv: 'csv',
        json: 'json'
      };

      const content = selectedFormat === 'json' ? JSON.stringify(response, null, 2) : response;
      const blob = new Blob([content], { type: mimeTypes[selectedFormat] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `carenest-report-${patientName.toLowerCase().replace(/\s+/g, '-')}-${selectedPeriod}.${extensions[selectedFormat]}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to download report', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const formats = [
    {
      id: 'html' as const,
      title: 'Printable Clinical Summary (HTML / PDF)',
      description: 'Styled official report ready for printing, PDF export, or physician review with signature lines.',
      icon: FileText,
      badge: 'Recommended'
    },
    {
      id: 'csv' as const,
      title: 'Spreadsheet Audit Log (CSV)',
      description: 'Tabular intake log suitable for Microsoft Excel, Google Sheets, or clinical data analysis.',
      icon: FileSpreadsheet,
      badge: 'Data Sheet'
    },
    {
      id: 'json' as const,
      title: 'Full Healthcare Ledger (JSON)',
      description: 'Structured machine-readable healthcare data export for health informatics or backup archiving.',
      icon: Code,
      badge: 'Raw Telemetry'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34354A]/30 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-white space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#FAF9FF] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9E3FF] text-[#554391] flex items-center justify-center shadow-2xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-heading text-[#34354A]">
                Download Healthcare Summary
              </h3>
              <p className="text-xs text-[#7A7D9D]">
                Export authorized patient report for {patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#FAF9FF] text-[#7A7D9D] hover:text-[#34354A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection Cards */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-[#7A7D9D] uppercase tracking-wider block">
            Select Export Format
          </label>

          {formats.map((f) => {
            const Icon = f.icon;
            const isSelected = selectedFormat === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFormat(f.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#E9E3FF]/70 border-[#7969B5] shadow-xs'
                    : 'bg-[#FAF9FF] hover:bg-white border-[#E5E4F2]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-white text-[#7969B5] shadow-2xs' : 'bg-white text-[#7A7D9D]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold font-heading text-[#34354A]">
                      {f.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#554391] border border-[#E9E3FF]">
                      {f.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7D9D] mt-0.5 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Security & HIPAA Notice */}
        <div className="p-3 bg-[#DDF5E9]/60 border border-[#BFE7D2] rounded-2xl flex items-center gap-2.5 text-xs text-[#1F6A42]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="text-[11px] leading-tight">
            This export contains protected patient healthcare telemetry. All download actions are recorded in the HIPAA compliance audit log.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold font-heading text-[#7A7D9D] hover:bg-[#FAF9FF] transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7969B5] to-[#554391] hover:from-[#6B5BA7] hover:to-[#4A3882] text-white text-xs font-bold font-heading shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isDownloading ? (
              <span>Preparing Report...</span>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

