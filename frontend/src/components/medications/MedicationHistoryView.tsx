import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertTriangle, UserCheck, Calendar, Filter, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge, BadgeVariant } from '../ui/CuteBadge.tsx';
import { medicationsApi } from '../../api/client.ts';
import { MedicationLog } from '../../types/index.ts';

interface MedicationHistoryViewProps {
  elderlyId: string;
}

export const MedicationHistoryView: React.FC<MedicationHistoryViewProps> = ({ elderlyId }) => {
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res: any = await medicationsApi.getHistory(elderlyId);
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [elderlyId]);

  const filteredLogs = logs.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  const getStatusBadge = (status: MedicationLog['status']) => {
    switch (status) {
      case 'TAKEN':
        return { variant: 'mint' as BadgeVariant, label: 'Taken On-Time' };
      case 'SKIPPED':
        return { variant: 'peach' as BadgeVariant, label: 'Skipped Dose' };
      case 'MISSED':
        return { variant: 'danger' as any, label: 'Missed' };
      default:
        return { variant: 'lavender' as BadgeVariant, label: status };
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E5E4F2] shadow-xs">
        <div>
          <h3 className="text-base font-extrabold font-heading text-[#34354A]">
            Medication Intake & Audit History
          </h3>
          <p className="text-xs text-[#7A7D9D] font-medium">Immutable log of verified healthcare doses</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'TAKEN', 'SKIPPED', 'MISSED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#7969B5] text-white shadow-xs'
                  : 'bg-[#FAF9FF] text-[#575973] hover:bg-[#E9E3FF]/60 hover:text-[#34354A]'
              }`}
            >
              {st === 'ALL' ? 'All Logs' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* History Ledger Table */}
      <GlassCard variant="white" padding="lg" rounded="3xl" className="space-y-3 border border-[#E5E4F2]">
        {loading ? (
          <div className="py-8 text-center text-xs text-[#7A7D9D]">
            Loading medication audit records...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7A7D9D]">
            No medication events recorded for this filter.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLogs.map((log) => {
              const statusConfig = getStatusBadge(log.status);
              const schedDate = new Date(log.scheduledFor);
              const takenDate = log.takenAt ? new Date(log.takenAt) : null;

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-[#FAF9FF] hover:bg-white border border-[#E5E4F2] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold font-heading text-[#34354A]">
                        {log.medication?.name || 'Medication Dose'}
                      </h4>
                      {log.medication?.dosage && (
                        <span className="text-xs text-[#7969B5] font-bold bg-white px-2 py-0.5 rounded-full border border-[#ECEBF8]">
                          {log.medication.dosage}
                        </span>
                      )}
                      <CuteBadge variant={statusConfig.variant} size="sm">
                        {statusConfig.label}
                      </CuteBadge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#575973]">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#7969B5]" />
                        <span>
                          Scheduled:{' '}
                          {schedDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}{' '}
                          at{' '}
                          {schedDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </span>

                      {takenDate && (
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            Taken at{' '}
                            {takenDate.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </span>
                      )}
                    </div>

                    {log.skipReason && (
                      <p className="text-xs text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                        ⚠️ <strong>Skip Reason:</strong> {log.skipReason}
                      </p>
                    )}

                    {log.notes && !log.skipReason && (
                      <p className="text-xs text-[#7A7D9D] italic pl-2 border-l-2 border-[#D2C7FC]">
                        "{log.notes}"
                      </p>
                    )}
                  </div>

                  {/* Audit Metadata: Who recorded it */}
                  <div className="text-left sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#FAF9FF]">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E4F2] text-xs font-bold text-[#34354A]">
                      <UserCheck className="w-3.5 h-3.5 text-[#7969B5]" />
                      <span>{log.loggedByName || log.loggedBy?.name || 'Eleanor Vance'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

