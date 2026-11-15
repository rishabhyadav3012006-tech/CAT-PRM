import React, { useState } from 'react';
import { CheckSquare, Clock, CheckCircle2, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';
import { Button } from '../ui/Button.tsx';
import { CareActivity } from '../../types/index.ts';

interface TodayCareTasksWidgetProps {
  tasks: CareActivity[];
  onCompleteTask: (id: string, currentStatus: string) => Promise<void>;
}

export const TodayCareTasksWidget: React.FC<TodayCareTasksWidgetProps> = ({
  tasks,
  onCompleteTask
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'PENDING') return t.status === 'PENDING';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <GlassCard
      variant="white"
      padding="lg"
      rounded="3xl"
      className="space-y-4 border border-[#E5E4F2] shadow-glass-sm text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E9E3FF] text-[#7969B5] flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-[#34354A]">
              Today's Care Tasks
            </h3>
            <p className="text-xs text-[#7A7D9D] font-medium">Caretaker duty roster & scheduled care</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#FAF9FF] p-1 rounded-xl border border-[#E5E4F2]">
          {(['ALL', 'PENDING', 'COMPLETED'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                filter === mode
                  ? 'bg-white text-[#7969B5] shadow-xs'
                  : 'text-[#7A7D9D] hover:text-[#34354A]'
              }`}
            >
              {mode.charAt(0) + mode.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#7A7D9D] bg-[#FAF9FF] rounded-2xl">
            No care tasks found for this view filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-[#DDF5E9]/40 border-emerald-200'
                    : 'bg-[#FAF9FF] border-[#E5E4F2] hover:bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-xs sm:text-sm font-extrabold font-heading ${
                        isCompleted ? 'line-through text-[#7A7D9D]' : 'text-[#34354A]'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <CuteBadge variant="lavender" size="sm">
                      {task.category}
                    </CuteBadge>
                  </div>

                  <p className="text-[11px] text-[#575973] font-medium">
                    {task.description || 'Routine elder care task'}
                  </p>

                  <p className="text-[10px] text-[#7A7D9D] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#7969B5]" />
                    <span>Scheduled for: {task.scheduledTime}</span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    variant={isCompleted ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => onCompleteTask(task.id, task.status)}
                    className="text-xs px-3"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>{isCompleted ? 'Completed ✓' : 'Mark Done'}</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
};

