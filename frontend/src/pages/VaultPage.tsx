import React, { useEffect, useState } from 'react';
import {
  FolderLock,
  Upload,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  Pill,
  Droplet,
  History,
  Activity,
  FileCheck,
  Archive,
  Lock,
  Plus
} from 'lucide-react';
import { vaultApi } from '../api/client.ts';
import { VaultDocument, VaultCategory } from '../types/index.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { CuteBadge } from '../components/ui/CuteBadge.tsx';

// Components
import { VaultDocumentCard } from '../components/vault/VaultDocumentCard.tsx';
import { UploadDocumentModal } from '../components/vault/UploadDocumentModal.tsx';
import { DocumentDetailsModal } from '../components/vault/DocumentDetailsModal.tsx';
import { VaultAuditTrailModal } from '../components/vault/VaultAuditTrailModal.tsx';

export const VaultPage: React.FC = () => {
  const [activeDocuments, setActiveDocuments] = useState<VaultDocument[]>([]);
  const [archivedDocuments, setArchivedDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [currentTab, setCurrentTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<VaultDocument | null>(null);

  const fetchVaultData = async () => {
    try {
      const [activeRes, archivedRes]: any = await Promise.all([
        vaultApi.getAll('eld-01', undefined, false),
        vaultApi.getAll('eld-01', undefined, true)
      ]);

      if (activeRes.success && activeRes.data) {
        setActiveDocuments(activeRes.data);
      }
      if (archivedRes.success && archivedRes.data) {
        setArchivedDocuments(archivedRes.data);
      }
    } catch (err) {
      console.error('Failed to load vault records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  const handleArchive = async (id: string) => {
    try {
      await vaultApi.archive(id);
      fetchVaultData();
    } catch (err) {
      alert('Failed to archive document');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await vaultApi.restore(id);
      fetchVaultData();
    } catch (err) {
      alert('Failed to restore document');
    }
  };

  const currentList = currentTab === 'ACTIVE' ? activeDocuments : archivedDocuments;

  // Filtered list
  const filteredDocuments = currentList.filter((doc) => {
    if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      (doc.doctorName && doc.doctorName.toLowerCase().includes(q)) ||
      (doc.facilityName && doc.facilityName.toLowerCase().includes(q)) ||
      (doc.notes && doc.notes.toLowerCase().includes(q)) ||
      doc.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Category counts
  const totalPrescriptions = activeDocuments.filter((d) => d.category === 'PRESCRIPTION').length;
  const totalLabReports = activeDocuments.filter(
    (d) => d.category === 'BLOOD_REPORT' || d.category === 'DIAGNOSTIC_REPORT'
  ).length;

  const categories = [
    { key: 'ALL', label: 'All Records', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'PRESCRIPTION', label: 'Prescriptions', icon: <Pill className="w-3.5 h-3.5 text-[#2B8756]" /> },
    { key: 'BLOOD_REPORT', label: 'Blood Reports', icon: <Droplet className="w-3.5 h-3.5 text-[#A62650]" /> },
    { key: 'DIAGNOSTIC_REPORT', label: 'Diagnostic Reports', icon: <Activity className="w-3.5 h-3.5 text-[#1B5494]" /> },
    { key: 'MEDICAL_HISTORY', label: 'Medical History', icon: <History className="w-3.5 h-3.5 text-[#55428F]" /> },
    { key: 'DISCHARGE_SUMMARY', label: 'Discharge Summaries', icon: <FileCheck className="w-3.5 h-3.5 text-[#B85820]" /> },
    { key: 'OTHER', label: 'Other', icon: <FileText className="w-3.5 h-3.5 text-[#8C6D1F]" /> }
  ];

  if (loading) {
    return <LoadingSpinner message="Retrieving encrypted medical records & prescription vault..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CuteBadge variant="babyBlue" size="sm" icon={<FolderLock className="w-3.5 h-3.5" />}>
              Encrypted Medical Vault
            </CuteBadge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#34354A] tracking-tight">
            Medical Records & Prescription Vault
          </h1>
          <p className="text-sm font-medium font-body text-[#575973]">
            Encrypted clinical storage with short-lived signed download links, category filters, and HIPAA audit trails
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsAuditTrailOpen(true)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-[#7969B5]" />}
            className="rounded-2xl"
          >
            <span>Security Audit Trail</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="rounded-2xl shadow-glow-purple"
          >
            <span>Upload Document</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="lavender" padding="md" rounded="2xl" className="border-2 border-[#D1C6F8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#55428F]">
              Active Vault Records
            </span>
            <FolderLock className="w-4 h-4 text-[#7969B5]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {activeDocuments.length}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Encrypted in private object storage
          </p>
        </GlassCard>

        <GlassCard variant="mint" padding="md" rounded="2xl" className="border-2 border-[#B7E7CE]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#1D6A48]">
              Active Prescriptions
            </span>
            <Pill className="w-4 h-4 text-[#1D6A48]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {totalPrescriptions}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Verified physician Rx orders
          </p>
        </GlassCard>

        <GlassCard variant="babyBlue" padding="md" rounded="2xl" className="border-2 border-[#BDDCFF]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#1B5494]">
              Lab & Diagnostic Scans
            </span>
            <Activity className="w-4 h-4 text-[#1B5494]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {totalLabReports}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Lipids, ECGs, & metabolic panels
          </p>
        </GlassCard>

        <GlassCard variant="cream" padding="md" rounded="2xl" className="border-2 border-[#F7ECCF]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black font-heading uppercase tracking-wider text-[#8C6D1F]">
              Archived Vault
            </span>
            <Archive className="w-4 h-4 text-[#8C6D1F]" />
          </div>
          <p className="font-black font-heading text-2xl text-[#34354A]">
            {archivedDocuments.length}
          </p>
          <p className="text-xs font-medium text-[#575973] mt-1">
            Outdated & superseded clinical files
          </p>
        </GlassCard>
      </div>

      {/* Tabs Switcher: Active Vault vs Archived */}
      <div className="flex items-center gap-2 border-b border-[#ECEAF5] pb-2">
        <button
          onClick={() => setCurrentTab('ACTIVE')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold font-heading rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'ACTIVE'
              ? 'bg-[#DFEEFF] text-[#1B5494] shadow-glass-sm'
              : 'text-[#7A7D9D] hover:bg-white hover:text-[#34354A]'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span>Active Vault ({activeDocuments.length})</span>
        </button>

        <button
          onClick={() => setCurrentTab('ARCHIVED')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold font-heading rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'ARCHIVED'
              ? 'bg-[#FFF9ED] text-[#8C6D1F] shadow-glass-sm'
              : 'text-[#7A7D9D] hover:bg-white hover:text-[#34354A]'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Archived Records ({archivedDocuments.length})</span>
        </button>
      </div>

      {/* Search Bar & Category Filter Bar */}
      <GlassCard
        variant="white"
        padding="md"
        rounded="2xl"
        className="flex flex-col gap-3 border"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#7A7D9D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document title, doctor, lab, or diagnostic tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ECEAF5] bg-[#FAF9FF] font-medium text-[#34354A] focus:outline-none focus:border-[#7969B5]"
            />
          </div>

          <div className="text-xs font-bold text-[#7A7D9D] self-start sm:self-center">
            Showing {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black font-heading transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#E9E3FF] text-[#55428F] shadow-2xs border border-[#D1C6F8]'
                    : 'bg-[#FAF9FF] text-[#575973] hover:bg-white border border-[#ECEAF5]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <VaultDocumentCard
              key={doc.id}
              document={doc}
              onViewDetails={(d) => setSelectedDocument(d)}
              onArchive={handleArchive}
              onRestore={handleRestore}
            />
          ))}
        </div>
      ) : (
        <GlassCard variant="cream" padding="xl" rounded="3xl" className="text-center py-10">
          <FolderLock className="w-12 h-12 text-[#B85820] mx-auto mb-3 opacity-60" />
          <p className="font-extrabold font-heading text-[#34354A] text-base">
            No matching medical records found
          </p>
          <p className="text-xs font-medium font-body text-[#7A7D9D] mt-1">
            Clear search filters or upload a new prescription/medical report.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<Upload className="w-4 h-4" />}
            className="mt-4 rounded-xl shadow-glow-purple mx-auto"
          >
            <span>Upload Document</span>
          </Button>
        </GlassCard>
      )}

      {/* 1. Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchVaultData}
      />

      {/* 2. Document Details & Signed Link Modal */}
      <DocumentDetailsModal
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        document={selectedDocument}
        onRefresh={fetchVaultData}
        onArchive={handleArchive}
        onRestore={handleRestore}
      />

      {/* 3. Vault Security Audit Trail Modal */}
      <VaultAuditTrailModal
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
      />
    </div>
  );
};

export default VaultPage;

