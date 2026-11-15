import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { DailyTrendPoint } from '../../types/index.ts';
import { TrendingUp, Activity } from 'lucide-react';

interface AdherenceLineChartProps {
  data: DailyTrendPoint[];
  periodLabel: string;
}

export const AdherenceLineChart: React.FC<AdherenceLineChartProps> = ({ data, periodLabel }) => {
  // Custom Glassmorphism Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as DailyTrendPoint;
      return (
        <div className="bg-white/95 backdrop-blur-md border border-[#E9E3FF] rounded-2xl p-3 shadow-lg text-xs space-y-1.5 min-w-[170px]">
          <div className="font-extrabold font-heading text-[#34354A] border-b border-[#FAF9FF] pb-1">
            {point.label} ({point.dayOfWeek})
          </div>
          <div className="flex items-center justify-between text-[#2B8756]">
            <span>Adherence:</span>
            <span className="font-extrabold text-sm">{point.adherenceRate}%</span>
          </div>
          <div className="flex items-center justify-between text-[#575973]">
            <span>Taken Doses:</span>
            <span className="font-bold">{point.taken}</span>
          </div>
          <div className="flex items-center justify-between text-[#B85820]">
            <span>Skipped:</span>
            <span className="font-bold">{point.skipped}</span>
          </div>
          <div className="flex items-center justify-between text-[#B53364]">
            <span>Missed / Pending:</span>
            <span className="font-bold">{point.missed + point.unconfirmed}</span>
          </div>
          <div className="flex items-center justify-between text-[#7A7D9D] pt-1 border-t border-[#FAF9FF] text-[10px]">
            <span>Total Eligible:</span>
            <span>{point.totalEligible}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/85 backdrop-blur-glass border border-white/95 rounded-3xl p-5 shadow-glass space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#FAF9FF] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#E9E3FF] text-[#554391] flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold font-heading text-[#34354A]">
              Medication Adherence Trend
            </h3>
          </div>
          <p className="text-xs text-[#7A7D9D] mt-0.5">
            Daily recorded intake adherence rate (%) across {periodLabel.toLowerCase()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#DDF5E9] text-[#1F6A42] rounded-xl border border-[#BFE7D2] flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Target: &gt;80%</span>
          </span>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7969B5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7969B5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EFFB" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#A4A7C5"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E5E4F2' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#A4A7C5"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
              formatter={(value) => <span className="text-[#575973] font-semibold">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="adherenceRate"
              name="Adherence Rate (%)"
              fill="url(#adherenceGradient)"
              stroke="transparent"
            />
            <Line
              type="monotone"
              dataKey="adherenceRate"
              name="Adherence Rate (%)"
              stroke="#7969B5"
              strokeWidth={3}
              dot={{ r: 3, fill: '#7969B5', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#554391', stroke: '#E9E3FF', strokeWidth: 3 }}
            />
            <Line
              type="monotone"
              dataKey="taken"
              name="Taken Doses"
              stroke="#2B8756"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

