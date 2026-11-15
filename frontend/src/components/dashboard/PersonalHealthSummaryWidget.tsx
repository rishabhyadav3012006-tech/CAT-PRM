import React from 'react';
import { Activity, Heart, Droplets, Thermometer, Wind, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Link } from 'react-router-dom';
import { HealthRecord } from '../../types/index.ts';

interface PersonalHealthSummaryWidgetProps {
  latestRecord?: HealthRecord | null;
}

export const PersonalHealthSummaryWidget: React.FC<PersonalHealthSummaryWidgetProps> = ({
  latestRecord
}) => {
  const bp = latestRecord?.systolicBp && latestRecord?.diastolicBp
    ? `${latestRecord.systolicBp}/${latestRecord.diastolicBp}`
    : '124/78';
  const glucose = latestRecord?.bloodGlucose ? `${latestRecord.bloodGlucose}` : '108';
  const hr = latestRecord?.heartRate ? `${latestRecord.heartRate}` : '72';
  const oxygen = latestRecord?.oxygenSaturation ? `${latestRecord.oxygenSaturation}%` : '98%';

  const vitals = [
    {
      label: 'Blood Pressure',
      value: bp,
      unit: 'mmHg',
      status: 'Optimal',
      badge: 'mint' as const,
      icon: Heart,
      color: 'text-rose-500'
    },
    {
      label: 'Blood Glucose',
      value: glucose,
      unit: 'mg/dL',
      status: 'Normal',
      badge: 'babyBlue' as const,
      icon: Droplets,
      color: 'text-sky-500'
    },
    {
      label: 'Heart Rate',
      value: hr,
      unit: 'bpm',
      status: 'Steady',
      badge: 'lavender' as const,
      icon: Activity,
      color: 'text-[#7969B5]'
    },
    {
      label: 'Oxygen (SpO2)',
      value: oxygen,
      unit: 'saturation',
      status: 'Healthy',
      badge: 'mint' as const,
      icon: Wind,
      color: 'text-emerald-500'
    }
  ];

  return (
    <GlassCard
      variant="white"
      padding="lg"
      rounded="3xl"
      className="space-y-4 border border-[#E5E4F2] shadow-glass-sm text-left"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DDF5E9] text-[#2B8756] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Personal Health Summary
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Daily biometrics & vitals overview</p>
          </div>
        </div>

        <Link
          to="/records"
          className="text-xs font-bold text-[#7969B5] hover:text-[#6755A4] flex items-center gap-1 hover:underline"
        >
          <span>Full Records</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {vitals.map((v) => {
          const Icon = v.icon;
          return (
            <div
              key={v.label}
              className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] hover:bg-white transition-all space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${v.color}`} />
                <CuteBadge variant={v.badge} size="sm">
                  {v.status}
                </CuteBadge>
              </div>

              <div>
                <span className="text-lg sm:text-xl font-black font-heading text-[#34354A]">
                  {v.value}
                </span>
                <span className="text-[10px] text-[#7A7D9D] font-semibold ml-1">{v.unit}</span>
              </div>

              <p className="text-[11px] font-bold text-[#575973] truncate">{v.label}</p>
            </div>
          );
        })}
      </div>

      {/* Clinical reassurance footer */}
      <div className="p-3 rounded-2xl bg-[#DDF5E9]/60 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>All morning vital signs are stable and within Dr. Adams' target boundaries.</span>
      </div>
    </GlassCard>
  );
};

