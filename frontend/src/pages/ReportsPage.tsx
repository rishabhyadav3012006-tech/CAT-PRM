import React, { useEffect, useState, useCallback } from 'react';
import { analyticsApi, elderlyApi } from '../api/client.ts';
import { AnalyticsOverview } from '../types/index.ts';
import { AnalyticsFilterBar, TimePeriod } from '../components/analytics/AnalyticsFilterBar.tsx';
import { MetricCardsGrid } from '../components/analytics/MetricCardsGrid.tsx';
import { AdherenceLineChart } from '../components/analytics/AdherenceLineChart.tsx';
import { WeeklyMedicationBarChart } from '../components/analytics/WeeklyMedicationBarChart.tsx';
import { MedicationStatusDoughnutChart } from '../components/analytics/MedicationStatusDoughnutChart.tsx';
import { MonthlyActivityChart } from '../components/analytics/MonthlyActivityChart.tsx';
import { AppointmentOverviewChart } from '../components/analytics/AppointmentOverviewChart.tsx';
import { CaretakerActivitySummary } from '../components/analytics/CaretakerActivitySummary.tsx';
import { DailyHealthcareActivityReport } from '../components/analytics/DailyHealthcareActivityReport.tsx';
import { MedicalDisclaimerBanner } from '../components/analytics/MedicalDisclaimerBanner.tsx';
import { DownloadReportModal } from '../components/analytics/DownloadReportModal.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { BarChart2, ShieldCheck, Heart, Sparkles, User, CalendarDays } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [elderlyId, setElderlyId] = useState<string>('eld-01');

  // Fetch target elderly profile ID
  useEffect(() => {
    const resolveElderly = async () => {
      try {
        const res: any = await elderlyApi.getAll();
        if (res.success && res.data && res.data.length > 0) {
          setElderlyId(res.data[0].id);
        }
      } catch (err) {
        // Fallback to eld-01
      }
    };
    resolveElderly();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        elderlyId,
        period: selectedPeriod
      };
      if (selectedPeriod === 'custom') {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }

      const res: any = await analyticsApi.getOverview(params);
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (err) {
      console.error('Failed to load healthcare analytics', err);
    } finally {
      setIsLoading(false);
    }
  }, [elderlyId, selectedPeriod, customStartDate, customEndDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const periodLabels: Record<TimePeriod, string> = {
    today: 'Today',
    this_week: 'This Week (Last 7 Days)',
    this_month: 'This Month (Last 30 Days)',
    custom: `Custom (${customStartDate} to ${customEndDate})`
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-6 shadow-glass">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7969B5] to-[#9E8EE4] text-white flex items-center justify-center shadow-md shrink-0">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold font-heading text-[#34354A]">
                Healthcare Analytics & Reports
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 bg-[#E9E3FF] text-[#45347B] rounded-full border border-[#D2C7FC]">
                <Sparkles className="w-3 h-3 text-[#7969B5]" /> Live Telemetry
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#7A7D9D] mt-0.5">
              Longitudinal medication adherence trends, care routines, and clinical summaries for{' '}
              <strong className="text-[#34354A] font-bold">{overview?.patientName || 'Eleanor Vance'}</strong>
            </p>
          </div>
        </div>

        {/* Patient Badge */}
        <div className="flex items-center gap-3 bg-[#FAF9FF] border border-[#E5E4F2] px-3.5 py-2 rounded-2xl self-end md:self-auto shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="text-right">
            <div className="text-xs font-extrabold text-[#34354A]">{overview?.patientName || 'Eleanor Vance'}</div>
            <div className="text-[10px] text-[#7A7D9D] flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-[#7969B5]" />
              <span>{periodLabels[selectedPeriod]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Medical & Clinical Disclaimer */}
      <MedicalDisclaimerBanner />

      {/* 3. Filter Bar (Today, This Week, This Month, Custom Date Range) */}
      <AnalyticsFilterBar
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={(start, end) => {
          setCustomStartDate(start);
          setCustomEndDate(end);
        }}
        onRefresh={fetchAnalytics}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        isLoading={isLoading}
      />

      {/* 4. Loading State or Content */}
      {isLoading && !overview ? (
        <div className="bg-white/80 backdrop-blur-glass border border-white/90 rounded-3xl p-16 shadow-glass flex items-center justify-center">
          <LoadingSpinner message="Calculating clinical adherence statistics and telemetry..." />
        </div>
      ) : overview ? (
        <>
          {/* 5. Dashboard Cards (6 KPIs) */}
          <MetricCardsGrid cards={overview.cards} periodLabel={periodLabels[selectedPeriod]} />

          {/* 6. Adherence Periodic Breakdown Pill Row */}
          <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-4 shadow-glass flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#34354A] font-heading">
                Adherence Benchmark Breakdown:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1.5 rounded-xl bg-[#DDF5E9] border border-[#BFE7D2] text-[#1F6A42] font-bold flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#2B8756]">Today:</span>
                <strong className="text-sm">{overview.adherence.daily}%</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#DFEEFF] border border-[#C4E0FF] text-[#1B5494] font-bold flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#2B6EB5]">Last 7 Days:</span>
                <strong className="text-sm">{overview.adherence.weekly}%</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#E9E3FF] border border-[#D2C7FC] text-[#45347B] font-bold flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#7969B5]">Last 30 Days:</span>
                <strong className="text-sm">{overview.adherence.monthly}%</strong>
              </span>
            </div>
          </div>

          {/* 7. Charts Section — Row 1 (Line Chart & Donut Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdherenceLineChart
                data={overview.charts.adherenceLineTrend}
                periodLabel={periodLabels[selectedPeriod]}
              />
            </div>
            <div className="lg:col-span-1">
              <MedicationStatusDoughnutChart
                data={overview.charts.medicationStatusDonut}
                adherenceRate={overview.cards.adherenceRate}
                totalScheduled={overview.cards.totalScheduledDoses}
              />
            </div>
          </div>

          {/* 8. Charts Section — Row 2 (Weekly Day Bar Chart & Monthly Activity Bar Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyMedicationBarChart data={overview.charts.weeklyDayBreakdown} />
            <MonthlyActivityChart data={overview.charts.monthlyActivityBar} />
          </div>

          {/* 9. Charts Section — Row 3 (Appointments Overview & Caretakers Summary) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AppointmentOverviewChart data={overview.charts.appointmentOverview} />
            <CaretakerActivitySummary caretakers={overview.caretakerSummaries} />
          </div>

          {/* 10. Daily Healthcare Activity Reports Accordion */}
          <DailyHealthcareActivityReport reports={overview.dailyHealthcareReports} />
        </>
      ) : null}

      {/* 11. Downloadable Healthcare Activity Summary Modal */}
      <DownloadReportModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        elderlyId={elderlyId}
        patientName={overview?.patientName || 'Eleanor Vance'}
        selectedPeriod={selectedPeriod}
        customStartDate={selectedPeriod === 'custom' ? customStartDate : undefined}
        customEndDate={selectedPeriod === 'custom' ? customEndDate : undefined}
      />
    </div>
  );
};

export default ReportsPage;

