import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { WeeklyDayPoint } from '../../types/index.ts';
import { BarChart3 } from 'lucide-react';

interface WeeklyMedicationBarChartProps {
  data: WeeklyDayPoint[];
}

export const WeeklyMedicationBarChart: React.FC<WeeklyMedicationBarChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as WeeklyDayPoint;
      return (
        <div className="bg-white/95 backdrop-blur-md border border-[#E9E3FF] rounded-2xl p-3 shadow-lg text-xs space-y-1 min-w-[150px]">
          <div className="font-extrabold font-heading text-[#34354A] border-b border-[#FAF9FF] pb-1">
            {label} Average: {point.rate}% Adherence
          </div>
          <div className="flex items-center justify-between text-[#2B8756]">
            <span>Taken:</span>
            <span className="font-extrabold">{point.taken}</span>
          </div>
          <div className="flex items-center justify-between text-[#B85820]">
            <span>Skipped:</span>
            <span className="font-bold">{point.skipped}</span>
          </div>
          <div className="flex items-center justify-between text-[#B53364]">
            <span>Missed:</span>
            <span className="font-bold">{point.missed}</span>
          </div>
          <div className="flex items-center justify-between text-[#7969B5]">
            <span>Unconfirmed:</span>
            <span className="font-bold">{point.unconfirmed}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-5 shadow-glass space-y-4">
      <div className="flex items-center justify-between border-b border-[#FAF9FF] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#DDF5E9] text-[#1F6A42] flex items-center justify-center shadow-2xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold font-heading text-[#34354A]">
              Weekly Day-of-Week Intake
            </h3>
          </div>
          <p className="text-xs text-[#7A7D9D] mt-0.5">
            Dose outcomes distribution across Monday through Sunday
          </p>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EFFB" vertical={false} />
            <XAxis
              dataKey="day"
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
              formatter={(value) => <span className="text-[#575973] font-semibold">{value}</span>}
            />
            <Bar dataKey="taken" name="Taken" fill="#2B8756" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="skipped" name="Skipped" fill="#B85820" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="missed" name="Missed" fill="#B53364" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="unconfirmed" name="Unconfirmed" fill="#7969B5" stackId="a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

