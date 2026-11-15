import React, { useEffect, useState } from 'react';
import { CheckSquare, Plus, Clock, User, CheckCircle2 } from 'lucide-react';
import { activitiesApi } from '../api/client.ts';
import { CareActivity } from '../types/index.ts';
import { Modal } from '../components/ui/Modal.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { CuteBadge, BadgeVariant } from '../components/ui/CuteBadge.tsx';
import { InputField } from '../components/ui/InputField.tsx';
import { SelectField } from '../components/ui/SelectField.tsx';

export const CareActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<CareActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    title: '',
    category: 'HYGIENE',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    description: '',
    notes: ''
  });

  const fetchActivities = async () => {
    try {
      const res: any = await activitiesApi.getAll('eld-01');
      if (res.success && res.data) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await activitiesApi.updateStatus(id, nextStatus);
      fetchActivities();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Activity title is required');
      return;
    }

    try {
      await activitiesApi.create({
        elderlyId: 'eld-01',
        title: formData.title,
        category: formData.category,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        description: formData.description,
        notes: formData.notes
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'HYGIENE',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        description: '',
        notes: ''
      });
      fetchActivities();
    } catch (err) {
      alert('Failed to create care activity');
    }
  };

  const filtered = activities.filter((a) => {
    if (selectedCategory === 'ALL') return true;
    return a.category === selectedCategory;
  });

  const categoryLabels: Record<string, { label: string; badge: BadgeVariant }> = {
    ALL: { label: 'All Routines', badge: 'purple' },
    HYGIENE: { label: 'Hygiene & Bath', badge: 'babyBlue' },
    MEAL: { label: 'Nutrition & Meal', badge: 'peach' },
    MOBILITY: { label: 'Gentle Mobility', badge: 'mint' },
    EXERCISE: { label: 'Exercise & Walking', badge: 'lavender' },
    MENTAL_HEALTH: { label: 'Mental Wellness', badge: 'pink' },
    CHECKUP: { label: 'Checkup & Vitals', badge: 'cream' },
  };

  if (loading) {
    return <LoadingSpinner message="Loading daily care routines & caregiver checklist..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CuteBadge variant="pink" size="sm" icon={<CheckSquare className="w-3.5 h-3.5" />}>
              Daily Routine Checklist
            </CuteBadge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#34354A] tracking-tight">
            Daily Care Activities & Tasks
          </h1>
          <p className="text-sm font-medium font-body text-[#575973]">
            Assisted living routines, nutrition tracking, mobility exercises, and caregiver delegation
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="rounded-2xl shadow-glow-purple"
        >
          <span>Add Care Routine</span>
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E4F2]">
        {Object.keys(categoryLabels).map((cat) => {
          const item = categoryLabels[cat];
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold font-heading transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#7969B5] text-white shadow-glow-purple'
                  : 'bg-white/80 text-[#575973] border border-[#E5E4F2] hover:bg-white hover:text-[#34354A]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((act) => {
          const isDone = act.status === 'COMPLETED';
          return (
            <GlassCard
              key={act.id}
              variant={isDone ? 'mint' : 'white'}
              padding="lg"
              rounded="3xl"
              className={`space-y-3.5 border-2 transition-all ${
                isDone ? 'border-[#BFE7D2]' : 'hover:border-[#E9E3FF]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggleStatus(act.id, act.status)}
                    className={`mt-1 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                      isDone
                        ? 'bg-[#2B8756] border-[#2B8756] text-white shadow-2xs'
                        : 'border-[#C2B5F0] bg-white hover:border-[#7969B5]'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-5 h-5" />}
                  </button>

                  <div>
                    <h3
                      className={`font-black font-heading text-lg ${
                        isDone ? 'line-through text-[#7A7D9D]' : 'text-[#34354A]'
                      }`}
                    >
                      {act.title}
                    </h3>
                    <p className="text-xs font-semibold font-body text-[#7A7D9D] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#7969B5]" />
                      <span>Scheduled: <strong>{act.scheduledTime}</strong></span>
                    </p>
                  </div>
                </div>

                <CuteBadge
                  variant={
                    act.category === 'HYGIENE'
                      ? 'babyBlue'
                      : act.category === 'MEAL'
                      ? 'peach'
                      : act.category === 'MOBILITY'
                      ? 'mint'
                      : 'lavender'
                  }
                  size="sm"
                >
                  {act.category}
                </CuteBadge>
              </div>

              {act.description && (
                <p className="text-xs font-medium font-body text-[#575973] pl-10 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-white">
                  {act.description}
                </p>
              )}

              <div className="pt-2 border-t border-white/60 pl-10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#7A7D9D] font-medium font-body">
                  <User className="w-3.5 h-3.5 text-[#7969B5]" />
                  <span>Assignee: Marcus Chen (Caregiver)</span>
                </div>

                <CuteBadge variant={isDone ? 'mint' : 'cream'} size="sm">
                  {act.status}
                </CuteBadge>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add Routine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Daily Care Routine"
        subtitle="Create an assistance routine task assigned to caretaker or family member"
        icon={<CheckSquare className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <InputField
            label="Routine Task Title *"
            placeholder="e.g. Morning Bath, Gentle Garden Walk, Video Call"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Care Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'HYGIENE', label: 'Hygiene & Bath' },
                { value: 'MEAL', label: 'Meals & Hydration' },
                { value: 'MOBILITY', label: 'Gentle Mobility' },
                { value: 'EXERCISE', label: 'Exercise & Walking' },
                { value: 'MENTAL_HEALTH', label: 'Mental Wellness' },
                { value: 'CHECKUP', label: 'Checkup & Vitals' },
                { value: 'OTHER', label: 'General Assistance' }
              ]}
            />

            <InputField
              label="Scheduled Time *"
              type="time"
              required
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
              Care Instructions & Safety Guidelines
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Ensure anti-skid floor mats are placed; keep walker nearby."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#E5E4F2] hover:border-[#C2B5F0] focus:border-[#7969B5] focus:ring-4 focus:ring-[#E9E3FF]/80 text-sm font-medium font-body text-[#34354A] bg-white/90 backdrop-blur-sm focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2.5 border-t border-[#E5E4F2]">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
            >
              <span>Schedule Routine</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
