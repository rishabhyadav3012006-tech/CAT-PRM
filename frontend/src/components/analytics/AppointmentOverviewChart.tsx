import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { AppointmentOverviewData } from '../../types/index.ts';
import { Calendar, Stethoscope, Clock, MapPin } from 'lucide-react';

interface AppointmentOverviewChartProps {
  data: AppointmentOverviewData;
}

export const AppointmentOverviewChart: React.FC<AppointmentOverviewChartProps> = ({ data }) => {
  const statusBars = [
    { name: 'Upcoming', count: data.upcomingCount, fill: '#2B6EB5' },
    { name: 'Completed', count: data.completedCount, fill: '#2B8756' },
    { name: 'Rescheduled', count: data.rescheduledCount, fill: '#B85820' },
    { name: 'Cancelled', count: data.cancelledCount, fill: '#B53364' }
  ];

  const nextAppt = data.nextAppointment;

  return (
    <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-5 shadow-glass space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#FAF9FF] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#DFEEFF] text-[#2B6EB5] flex items-center justify-center shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold font-heading text-[#34354A]">
              Doctor Appointments Overview
            </h3>
          </div>
          <p className="text-xs text-[#7A7D9D] mt-0.5">
            Clinical visits distribution and upcoming consultation spotlight
          </p>
        </div>
      </div>

      {/* Next Appointment Spotlight Card */}
      {nextAppt ? (
        <div className="p-3.5 bg-gradient-to-r from-[#DFEEFF]/80 via-white/85 to-[#E9E3FF]/80 border border-[#DFEEFF] rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white text-[#2B6EB5] flex items-center justify-center shadow-sm shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#2B6EB5] uppercase tracking-wider">
                Next Upcoming Consultation
              </div>
              <div className="text-sm font-extrabold font-heading text-[#34354A]">
                {nextAppt.doctorName}
              </div>
              <div className="text-xs text-[#575973] font-medium flex items-center gap-2 mt-0.5">
                <span>{nextAppt.specialty}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px] text-[#7A7D9D]">
                  <Clock className="w-3 h-3 text-[#2B6EB5]" />
                  {new Date(nextAppt.appointmentDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })} {nextAppt.appointmentTime || ''}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="px-2.5 py-1 bg-[#DDF5E9] text-[#1F6A42] font-extrabold text-[10px] rounded-full border border-[#BFE7D2]">
              Confirmed
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#FAF9FF] border border-[#E5E4F2] rounded-2xl text-center text-xs text-[#7A7D9D]">
          No upcoming doctor appointments scheduled in this period.
        </div>
      )}

      {/* Status Breakdown Bar Chart */}
      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusBars} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EFFB" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#A4A7C5"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E5E4F2' }}
            />
            <YAxis
              stroke="#A4A7C5"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(val) => [`${val} Appointments`, 'Count']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                border: '1px solid #E9E3FF',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Specialties Tags */}
      {data.bySpecialty && data.bySpecialty.length > 0 && (
        <div className="pt-2 border-t border-[#FAF9FF] flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-bold text-[#7A7D9D] mr-1">Specialties:</span>
          {data.bySpecialty.map((s, i) => (
            <span
              key={i}
              className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF9FF] text-[#554391] border border-[#E9E3FF] rounded-lg"
            >
              {s.specialty} ({s.count})
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

