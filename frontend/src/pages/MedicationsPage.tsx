import React, { useEffect, useState } from 'react';
import {
  Pill,
  Plus,
  Clock,
  Calendar,
  History,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Heart,
  ArrowRight
} from 'lucide-react';
import { medicationsApi } from '../api/client.ts';
import { Medication } from '../types/index.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { CuteBadge } from '../components/ui/CuteBadge.tsx';
import { MedicationCard } from '../components/medications/MedicationCard.tsx';
import { MedicationFormModal } from '../components/medications/MedicationFormModal.tsx';
import { MedicationDetailsModal } from '../components/medications/MedicationDetailsModal.tsx';
import { DailyTimelineSchedule } from '../components/medications/DailyTimelineSchedule.tsx';
import { SkipDoseModal } from '../components/medications/SkipDoseModal.tsx';
import { MedicationHistoryView } from '../components/medications/MedicationHistoryView.tsx';
import { MedicationRefillTracker } from '../components/medications/MedicationRefillTracker.tsx';

export const MedicationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'history' | 'refills'>('overview');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [detailsMedication, setDetailsMedication] = useState<Medication | null>(null);
  const [skipMedication, setSkipMedication] = useState<Medication | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const elderlyId = 'eld-01';

  const fetchMedications = async () => {
    try {
      const res: any = await medicationsApi.getAll(elderlyId);
      if (res.success && res.data) {
        setMedications(res.data);
      }
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const showToast = (msg: string, isErr: boolean = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(null), 4000);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleTakeDose = async (medId: string, medName: string) => {
    try {
      const res: any = await medicationsApi.logAdherence({
        medicationId: medId,
        status: 'TAKEN',
        notes: 'Intake confirmed via CareNest Medication Portal'
      });
      if (res.success) {
        showToast(`Dose recorded: ${medName} taken successfully! 🌸`);
        fetchMedications();
      }
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Unable to log dose.');
      showToast(msg, true);
    }
  };

  const handleConfirmSkip = async (reason: string, notes?: string) => {
    if (!skipMedication) return;
    try {
      const res: any = await medicationsApi.logAdherence({
        medicationId: skipMedication.id,
        status: 'SKIPPED',
        skipReason: reason,
        notes: notes || undefined
      });
      if (res.success) {
        showToast(`Skipped dose recorded for ${skipMedication.name}. Reason noted.`);
        fetchMedications();
      }
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Could not record skipped dose.');
      showToast(msg, true);
    }
  };

  const handleRefillStock = async (medId: string, quantity: number = 30) => {
    try {
      const res: any = await medicationsApi.refill(medId, quantity);
      if (res.success) {
        showToast(res.message || 'Prescription refilled successfully!');
        fetchMedications();
      }
    } catch (err: any) {
      showToast('Failed to update refill stock.', true);
    }
  };

  const handleArchiveMedication = async (medId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to archive ${name}? Historical logs will remain preserved.`)) {
      return;
    }
    try {
      const res: any = await medicationsApi.archive(medId);
      if (res.success) {
        showToast(`${name} has been archived. History safely preserved.`);
        fetchMedications();
      }
    } catch (err: any) {
      showToast('Could not archive medication.', true);
    }
  };

  const handleSaveMedication = async (formData: any) => {
    if (editingMedication) {
      await medicationsApi.update(editingMedication.id, formData);
      showToast(`Updated ${formData.name} schedule!`);
    } else {
      await medicationsApi.create(formData);
      showToast(`Prescribed ${formData.name} successfully!`);
    }
    fetchMedications();
  };

  // Filter medications
  const filteredMeds = medications.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || (m.category && m.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'Cardiovascular', 'Diabetes', 'Supplements'];

  const nextUpcomingMed = medications[0];

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Toast Banners */}
      {toastMessage && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-300 text-emerald-900 shadow-glass-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold font-heading">{toastMessage}</span>
        </div>
      )}

      {toastError && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 shadow-glass-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold font-heading">{toastError}</span>
        </div>
      )}

      {/* Hero Header & Next Dose Callout */}
      <GlassCard
        variant="white"
        padding="lg"
        rounded="3xl"
        className="p-6 bg-gradient-to-r from-[#DDF5E9]/80 via-white/85 to-[#E9E3FF]/80 border-2 border-[#D2C7FC] shadow-glass-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <CuteBadge variant="lavender" size="md" icon={<Pill className="w-4 h-4" />}>
              Medication Management
            </CuteBadge>
            <CuteBadge variant="mint" size="md" dot>
              Care Circle Synchronized
            </CuteBadge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#34354A] tracking-tight">
            Prescription Schedule & Adherence
          </h1>

          <p className="text-xs sm:text-sm font-medium font-body text-[#575973] leading-relaxed">
            Manage daily pill routines, track remaining bottle counts, log taken doses, and record clinical skipped reasons for Eleanor Vance.
          </p>
        </div>

        {/* Next Scheduled Dose Highlight Card */}
        {nextUpcomingMed && (
          <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5E4F2] shadow-glass-sm space-y-2 shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold font-title text-[#7A7D9D] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7969B5]" />
                <span>Next Scheduled Dose</span>
              </span>
              <CuteBadge variant="lavender" size="sm">
                {nextUpcomingMed.scheduledTimes[0] || '12:30 PM'}
              </CuteBadge>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-extrabold font-heading text-[#34354A]">
                {nextUpcomingMed.name}
              </h4>
              <p className="text-xs font-bold text-[#7969B5]">{nextUpcomingMed.dosage}</p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleTakeDose(nextUpcomingMed.id, nextUpcomingMed.name)}
              className="w-full justify-center text-xs font-bold"
            >
              <span>Take This Dose</span>
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white/80 border border-[#E5E4F2] shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-heading flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#7969B5] text-white shadow-xs'
                : 'bg-[#FAF9FF] text-[#575973] hover:bg-white hover:text-[#34354A]'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Medication Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-heading flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-[#7969B5] text-white shadow-xs'
                : 'bg-[#FAF9FF] text-[#575973] hover:bg-white hover:text-[#34354A]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Schedule Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-heading flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#7969B5] text-white shadow-xs'
                : 'bg-[#FAF9FF] text-[#575973] hover:bg-white hover:text-[#34354A]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Medication History</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('refills')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-heading flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'refills'
                ? 'bg-[#7969B5] text-white shadow-xs'
                : 'bg-[#FAF9FF] text-[#575973] hover:bg-white hover:text-[#34354A]'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refill Tracking</span>
          </button>
        </div>

        {/* Add Medication Action */}
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingMedication(null);
            setIsFormModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-glow-purple/20 font-heading font-extrabold"
        >
          <span>Add Medication</span>
        </Button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner message="Gathering active prescriptions & schedule..." />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW & CARDS */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#E5E4F2] shadow-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#7A7D9D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine by name or dose..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF9FF] border border-[#E5E4F2] text-xs font-medium text-[#34354A] focus:outline-none focus:ring-2 focus:ring-[#E9E3FF]"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end">
                  <Filter className="w-3.5 h-3.5 text-[#7A7D9D] mr-1 hidden sm:block" />
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#E9E3FF] text-[#7969B5] border border-[#7969B5]'
                          : 'bg-[#FAF9FF] text-[#575973] hover:bg-white'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medication Cards Grid */}
              {filteredMeds.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white border border-[#E5E4F2] space-y-3">
                  <Pill className="w-10 h-10 text-[#7969B5] mx-auto opacity-50" />
                  <h3 className="text-base font-bold text-[#34354A]">No medications found</h3>
                  <p className="text-xs text-[#7A7D9D]">
                    {searchQuery ? `No medications match "${searchQuery}".` : 'No active prescriptions on file.'}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingMedication(null);
                      setIsFormModalOpen(true);
                    }}
                  >
                    Add First Medication
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredMeds.map((med) => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onTakeDose={handleTakeDose}
                      onOpenSkipModal={(m) => setSkipMedication(m)}
                      onOpenDetails={(m) => setDetailsMedication(m)}
                      onOpenEdit={(m) => {
                        setEditingMedication(m);
                        setIsFormModalOpen(true);
                      }}
                      onRefill={(id) => handleRefillStock(id, 30)}
                      onArchive={handleArchiveMedication}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DAILY SCHEDULE TIMELINE */}
          {activeTab === 'schedule' && (
            <DailyTimelineSchedule
              medications={medications}
              onTakeDose={handleTakeDose}
              onOpenSkipModal={(m) => setSkipMedication(m)}
            />
          )}

          {/* TAB 3: MEDICATION HISTORY */}
          {activeTab === 'history' && <MedicationHistoryView elderlyId={elderlyId} />}

          {/* TAB 4: REFILL TRACKING */}
          {activeTab === 'refills' && (
            <MedicationRefillTracker
              medications={medications}
              onRefill={handleRefillStock}
            />
          )}
        </>
      )}

      {/* Add / Edit Medication Form Modal */}
      <MedicationFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMedication(null);
        }}
        elderlyId={elderlyId}
        initialData={editingMedication}
        onSave={handleSaveMedication}
      />

      {/* Medication Details Modal */}
      <MedicationDetailsModal
        isOpen={!!detailsMedication}
        onClose={() => setDetailsMedication(null)}
        medication={detailsMedication}
        onEdit={(m) => {
          setEditingMedication(m);
          setIsFormModalOpen(true);
        }}
        onRefill={(id) => handleRefillStock(id, 30)}
        onArchive={handleArchiveMedication}
      />

      {/* Skip Dose Modal */}
      <SkipDoseModal
        isOpen={!!skipMedication}
        onClose={() => setSkipMedication(null)}
        medicationName={skipMedication?.name || ''}
        dosage={skipMedication?.dosage || ''}
        onConfirmSkip={handleConfirmSkip}
      />
    </div>
  );
};

export default MedicationsPage;
