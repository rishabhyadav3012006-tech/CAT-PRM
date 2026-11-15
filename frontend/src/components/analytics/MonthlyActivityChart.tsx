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
import { MonthlyActivityItem } from '../../types/index.ts';
import { CheckSquare } from 'lucide-react';

interface MonthlyActivityChartProps {
  data: MonthlyActivityItem[];
}

export const MonthlyActivityChart: React.FC<MonthlyActivityChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as MonthlyActivityItem;
      return (
        <div className="bg-white/95 backdrop-blur-md border border-[#E9E3FF] rounded-2xl p-3 shadow-lg text-xs space-y-1 min-w-[150px]">
          <div className="font-extrabold font-heading text-[#34354A] border-b border-[#FAF9FF] pb-1">
            {label} ({item.completionRate}% Done)
          </div>
          <div className="flex items-center justify-between text-[#2B8756]">
            <span>Completed:</span>
            <span className="font-extrabold">{item.completed}</span>
          </div>
          <div className="flex items-center justify-between text-[#7969B5]">
            <span>Pending:</span>
            <span className="font-bold">{item.pending}</span>
          </div>
          <div className="flex items-center justify-between text-[#7A7D9D] text-[10px] pt-1 border-t border-[#FAF9FF]">
            <span>Total Tasks:</span>
            <span>{item.total}</span>
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
            <div className="w-7 h-7 rounded-xl bg-[#FCE4ED] text-[#B53364] flex items-center justify-center shadow-2xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold font-heading text-[#34354A]">
              Care Activity Completion
            </h3>
          </div>
          <p className="text-xs text-[#7A7D9D] mt-0.5">
            Routine task fulfillment across hygiene, meals, mobility, and checkups
          </p>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EFFB" vertical={false} />
            <XAxis
              dataKey="category"
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
            <Bar dataKey="completed" name="Completed Tasks" fill="#2B8756" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" name="Pending Tasks" fill="#E9E3FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

