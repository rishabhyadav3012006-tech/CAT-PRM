import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { StatusDonutSlice } from '../../types/index.ts';
import { PieChart as PieIcon } from 'lucide-react';

interface MedicationStatusDoughnutChartProps {
  data: StatusDonutSlice[];
  adherenceRate: number;
  totalScheduled: number;
}

export const MedicationStatusDoughnutChart: React.FC<MedicationStatusDoughnutChartProps> = ({
  data,
  adherenceRate,
  totalScheduled
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const slice = payload[0].payload as StatusDonutSlice;
      const percentage = totalScheduled > 0 ? Math.round((slice.value / totalScheduled) * 100) : 0;
      return (
        <div className="bg-white/95 backdrop-blur-md border border-[#E9E3FF] rounded-2xl p-3 shadow-lg text-xs space-y-1 min-w-[140px]">
          <div className="font-extrabold font-heading text-[#34354A] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
            <span>{slice.name}</span>
          </div>
          <div className="flex items-center justify-between text-[#575973]">
            <span>Count:</span>
            <span className="font-extrabold text-[#34354A]">{slice.value} doses</span>
          </div>
          <div className="flex items-center justify-between text-[#7A7D9D] text-[11px]">
            <span>Proportion:</span>
            <span className="font-bold">{percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-5 shadow-glass space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#FAF9FF] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FFE9DC] text-[#B85820] flex items-center justify-center shadow-2xs">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold font-heading text-[#34354A]">
              Dose Status Breakdown
            </h3>
          </div>
          <p className="text-xs text-[#7A7D9D] mt-0.5">
            Proportions of taken, skipped, missed, and pending doses
          </p>
        </div>
      </div>

      <div className="relative w-full h-72 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={3}
              dataKey="value"
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-bold text-[#7A7D9D] uppercase tracking-wider">
            Adherence
          </span>
          <span className="text-3xl font-extrabold font-heading text-[#34354A]">
            {adherenceRate}%
          </span>
          <span className="text-[10px] text-[#7A7D9D] font-medium">
            {totalScheduled} Total
          </span>
        </div>
      </div>

      {/* Custom Legend Cards */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#FAF9FF]">
        {data.slice(0, 4).map((slice, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9FF] text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
            <div className="truncate">
              <div className="text-[11px] font-bold text-[#34354A] truncate">{slice.name}</div>
              <div className="text-[10px] text-[#7A7D9D] font-semibold">{slice.value} doses</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

