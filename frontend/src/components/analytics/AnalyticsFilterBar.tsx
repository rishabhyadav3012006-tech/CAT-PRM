import React, { useState } from 'react';
import { Calendar, Download, RefreshCw, Filter, Sparkles } from 'lucide-react';

export type TimePeriod = 'today' | 'this_week' | 'this_month' | 'custom';

interface AnalyticsFilterBarProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomDateChange: (start: string, end: string) => void;
  onRefresh: () => void;
  onOpenDownloadModal: () => void;
  isLoading?: boolean;
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  selectedPeriod,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  onRefresh,
  onOpenDownloadModal,
  isLoading = false
}) => {
  const [showCustomInputs, setShowCustomInputs] = useState(selectedPeriod === 'custom');

  const handlePeriodClick = (period: TimePeriod) => {
    onPeriodChange(period);
    setShowCustomInputs(period === 'custom');
  };

  const periods: { id: TimePeriod; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-4 shadow-glass space-y-3">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Left: Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9FF] border border-[#E5E4F2] rounded-2xl text-xs font-bold text-[#7A7D9D] mr-1">
            <Filter className="w-3.5 h-3.5 text-[#7969B5]" />
            <span>Timeframe:</span>
          </div>

          {periods.map((p) => {
            const isActive = selectedPeriod === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePeriodClick(p.id)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold font-heading transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-[#E9E3FF] text-[#45347B] border border-[#D2C7FC] shadow-2xs'
                    : 'bg-[#FAF9FF] text-[#575973] hover:bg-white hover:text-[#34354A] border border-[#E5E4F2]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Right: Actions (Download & Refresh) */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-2xl bg-[#FAF9FF] hover:bg-white border border-[#E5E4F2] text-[#575973] hover:text-[#7969B5] transition-all disabled:opacity-50 shadow-2xs"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#7969B5]' : ''}`} />
          </button>

          <button
            onClick={onOpenDownloadModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7969B5] to-[#554391] hover:from-[#6B5BA7] hover:to-[#4A3882] text-white rounded-2xl text-xs font-bold font-heading shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Summary</span>
          </button>
        </div>
      </div>

      {/* Expandable Custom Date Range Selector */}
      {showCustomInputs && (
        <div className="pt-3 border-t border-[#FAF9FF] flex flex-wrap items-center gap-3 text-xs text-[#575973]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#7A7D9D]">From:</span>
            <div className="relative">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
                className="px-3 py-1.5 bg-[#FAF9FF] border border-[#E5E4F2] rounded-xl text-xs font-semibold text-[#34354A] focus:outline-none focus:border-[#7969B5]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#7A7D9D]">To:</span>
            <div className="relative">
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
                className="px-3 py-1.5 bg-[#FAF9FF] border border-[#E5E4F2] rounded-xl text-xs font-semibold text-[#34354A] focus:outline-none focus:border-[#7969B5]"
              />
            </div>
          </div>

          <div className="text-[11px] text-[#7A7D9D] italic flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#7969B5]" />
            <span>Telemetry will recompute for selected period</span>
          </div>
        </div>
      )}
    </div>
  );
};

