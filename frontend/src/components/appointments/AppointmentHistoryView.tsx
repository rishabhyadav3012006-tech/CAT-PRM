import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  MapPin,
  Eye,
  Filter,
  FileCheck
} from 'lucide-react';
import { Appointment } from '../../types/index.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { Button } from '../ui/Button.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface AppointmentHistoryViewProps {
  appointments: Appointment[];
  onViewDetails: (apt: Appointment) => void;
}

export const AppointmentHistoryView: React.FC<AppointmentHistoryViewProps> = ({
  appointments,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Filter only past visits, completed, or cancelled appointments
  const historyList = appointments.filter((apt) => {
    const isPast =
      apt.status === 'COMPLETED' ||
      apt.status === 'CANCELLED' ||
      new Date(apt.appointmentDate).getTime() < Date.now();
    return isPast;
  });

  const filteredHistory = historyList.filter((apt) => {
    if (statusFilter === 'COMPLETED' && apt.status !== 'COMPLETED') return false;
    if (statusFilter === 'CANCELLED' && apt.status !== 'CANCELLED') return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      apt.doctorName.toLowerCase().includes(q) ||
      apt.specialty.toLowerCase().includes(q) ||
      (apt.hospitalName && apt.hospitalName.toLowerCase().includes(q)) ||
      (apt.location && apt.location.toLowerCase().includes(q)) ||
      (apt.consultationNotes && apt.consultationNotes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <GlassCard
        variant="white"
        padding="md"
        rounded="2xl"
        className="flex flex-col sm:flex-row items-center justify-between gap-3 border"
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#7A7D9D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search doctor, specialty, diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ECEAF5] bg-[#FAF9FF] font-medium text-[#34354A] focus:outline-none focus:border-[#7969B5]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-4 h-4 text-[#7A7D9D]" />
          {(['ALL', 'COMPLETED', 'CANCELLED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-black font-heading rounded-xl transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-[#E9E3FF] text-[#55428F] shadow-2xs'
                  : 'text-[#7A7D9D] hover:bg-[#FAF9FF]'
              }`}
            >
              {filter === 'ALL'
                ? 'All Past Visits'
                : filter === 'COMPLETED'
                ? 'Completed Checkups'
                : 'Cancelled Visits'}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* History Cards / Table */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((apt) => {
            const dateStr = new Date(apt.appointmentDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <GlassCard
                key={apt.id}
                variant="white"
                padding="md"
                rounded="2xl"
                className="border-2 hover:border-[#D1C6F8] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold shadow-2xs ${
                      apt.status === 'COMPLETED'
                        ? 'bg-[#DDF5E9] text-[#1D6A48]'
                        : apt.status === 'CANCELLED'
                        ? 'bg-[#FCE4ED] text-[#A62650]'
                        : 'bg-[#FAF9FF] text-[#7969B5]'
                    }`}
                  >
                    {apt.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : apt.status === 'CANCELLED' ? (
                      <XCircle className="w-6 h-6" />
                    ) : (
                      <Calendar className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black font-heading text-base text-[#34354A]">
                        {apt.doctorName}
                      </h3>
                      <CuteBadge variant="babyBlue" size="sm">
                        {apt.specialty}
                      </CuteBadge>
                      <CuteBadge
                        variant={apt.status === 'COMPLETED' ? 'mint' : 'pink'}
                        size="sm"
                      >
                        {apt.status}
                      </CuteBadge>
                    </div>

                    <p className="text-xs font-semibold text-[#575973] flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#7969B5]" />
                      <span>{dateStr}</span>
                      <span>•</span>
                      <Building2 className="w-3.5 h-3.5 text-[#7A7D9D]" />
                      <span>{apt.hospitalName || apt.location}</span>
                    </p>

                    {/* Consultation Notes Summary if available */}
                    {apt.consultationNotes && (
                      <p className="text-xs font-medium text-[#34354A] bg-[#FAF9FF] border border-[#ECEAF5] p-2 rounded-xl mt-1.5 flex items-start gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-[#1D6A48] flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <strong>Consultation Findings:</strong> {apt.consultationNotes}
                        </span>
                      </p>
                    )}

                    {/* Cancellation reason if available */}
                    {apt.cancelReason && (
                      <p className="text-xs font-medium text-[#A62650] bg-[#FCE4ED]/50 border border-[#F7C6D7] p-2 rounded-xl mt-1.5">
                        <strong>Reason:</strong> {apt.cancelReason}
                      </p>
                    )}

                    {/* Documents tag */}
                    {apt.documents && apt.documents.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#7969B5] pt-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>
                          {apt.documents.length} Medical Document
                          {apt.documents.length > 1 ? 's' : ''} on Record
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="self-end md:self-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onViewDetails(apt)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    className="rounded-xl"
                  >
                    <span>View Dossier</span>
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard variant="cream" padding="xl" rounded="3xl" className="text-center">
          <Calendar className="w-12 h-12 text-[#B85820] mx-auto mb-3 opacity-60" />
          <p className="font-extrabold font-heading text-[#34354A] text-base">
            No Past Appointment Records Found
          </p>
          <p className="text-xs font-medium font-body text-[#7A7D9D] mt-1">
            Completed consultations and cancelled appointments will be archived here for Eleanor's
            healthcare record.
          </p>
        </GlassCard>
      )}
    </div>
  );
};

