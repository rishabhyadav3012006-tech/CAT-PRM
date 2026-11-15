import React, { useEffect, useState } from 'react';
import { UserCheck, Phone, MapPin, Heart, AlertCircle, Edit3, Shield, Users, Sparkles } from 'lucide-react';
import { elderlyApi } from '../api/client.ts';
import { ElderlyProfile } from '../types/index.ts';
import { Modal } from '../components/ui/Modal.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { CuteBadge } from '../components/ui/CuteBadge.tsx';
import { InputField } from '../components/ui/InputField.tsx';

export const ElderlyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ElderlyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editData, setEditData] = useState({
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    bloodGroup: '',
    mobilityStatus: '',
    address: '',
    notes: ''
  });

  const fetchProfile = async () => {
    try {
      const res: any = await elderlyApi.getById('eld-01');
      if (res.success && res.data) {
        setProfile(res.data);
        setEditData({
          emergencyContactName: res.data.emergencyContactName || '',
          emergencyContactPhone: res.data.emergencyContactPhone || '',
          emergencyContactRelation: res.data.emergencyContactRelation || '',
          bloodGroup: res.data.bloodGroup || '',
          mobilityStatus: res.data.mobilityStatus || '',
          address: res.data.address || '',
          notes: res.data.notes || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await elderlyApi.update('eld-01', editData);
      setIsModalOpen(false);
      fetchProfile();
    } catch (err) {
      alert('Failed to update elderly health profile');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving Eleanor's complete medical & profile records..." />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Hero Card */}
      <GlassCard variant="lavender" padding="lg" rounded="3xl" className="border-2 border-[#D2C7FC]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80"
              alt="Eleanor Vance"
              className="w-22 h-22 sm:w-26 sm:h-26 rounded-3xl object-cover border-4 border-white shadow-glow-purple"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#34354A] tracking-tight">
                  Eleanor Vance
                </h1>
                <CuteBadge variant="mint" size="md" dot>
                  Care Monitored
                </CuteBadge>
              </div>

              <p className="text-xs sm:text-sm font-medium font-body text-[#575973]">
                Born April 12, 1948 • 78 Years Old • Female
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <CuteBadge variant="pink" size="sm" icon={<Heart className="w-3 h-3 text-rose-500" />}>
                  Blood Group: {profile?.bloodGroup || 'O+'}
                </CuteBadge>
                <CuteBadge variant="cream" size="sm">
                  Mobility: {profile?.mobilityStatus || 'Needs Cane'}
                </CuteBadge>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Edit3 className="w-4 h-4 text-[#7969B5]" />}
            className="rounded-2xl"
          >
            <span>Edit Profile</span>
          </Button>
        </div>
      </GlassCard>

      {/* Grid: Health Baseline & Emergency Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medical Baseline */}
        <GlassCard variant="white" padding="lg" rounded="3xl" className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#FAF9FF] pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#E9E3FF] text-[#7969B5] flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-extrabold font-heading text-[#34354A]">
              Chronic Baseline & Allergies
            </h2>
          </div>

          <div>
            <p className="text-xs font-bold font-heading text-[#7A7D9D] mb-2 uppercase tracking-wider">
              Diagnosed Conditions:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis'].map((c, i) => (
                <CuteBadge key={i} variant="peach" size="md">
                  {c}
                </CuteBadge>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold font-heading text-[#7A7D9D] mb-2 uppercase tracking-wider">
              Known Drug Allergies:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Penicillin', 'Sulfa Drugs'].map((a, i) => (
                <CuteBadge key={i} variant="pink" size="md">
                  ⚠️ {a}
                </CuteBadge>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold font-heading text-[#7A7D9D] mb-1 uppercase tracking-wider">
              Dietary & Routine Notes:
            </p>
            <p className="text-xs font-medium font-body text-[#575973] bg-[#FFF9ED] border border-[#F7ECCF] p-3.5 rounded-2xl leading-relaxed">
              {profile?.notes || 'Prefers morning medication with warm oatmeal. Alert family if systolic BP exceeds 140.'}
            </p>
          </div>
        </GlassCard>

        {/* Emergency Contacts & Coordination */}
        <GlassCard variant="white" padding="lg" rounded="3xl" className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#FAF9FF] pb-3">
            <div className="w-9 h-9 rounded-xl bg-[#FCE4ED] text-[#B53364] flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-extrabold font-heading text-[#34354A]">
              Emergency Contacts & Family Link
            </h2>
          </div>

          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FCE4ED]/60 to-white border-2 border-[#F9BFD4] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold font-heading text-[#8F1E48] uppercase tracking-wider">
                Primary Emergency Responder
              </span>
              <CuteBadge variant="pink" size="sm">
                Authorized
              </CuteBadge>
            </div>
            <h4 className="text-base font-black font-heading text-[#34354A]">
              {profile?.emergencyContactName || 'Sarah Vance'}
            </h4>
            <p className="text-xs font-medium font-body text-[#575973]">Relationship: Daughter</p>
            <p className="text-xs font-bold font-body text-[#8F1E48] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{profile?.emergencyContactPhone || '+1 (555) 345-6789'}</span>
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold font-heading text-[#7A7D9D] uppercase tracking-wider">
              Home Address:
            </p>
            <p className="text-xs font-medium font-body text-[#34354A] flex items-center gap-2 bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#E5E4F2]">
              <MapPin className="w-4 h-4 text-[#7969B5] flex-shrink-0" />
              <span>{profile?.address || '742 Evergreen Terrace, Springfield, OR'}</span>
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Eleanor's Health Profile"
        subtitle="Maintain accurate emergency contacts and clinical conditions"
        icon={<UserCheck className="w-5 h-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Emergency Contact Name"
              value={editData.emergencyContactName}
              onChange={(e) => setEditData({ ...editData, emergencyContactName: e.target.value })}
            />
            <InputField
              label="Emergency Contact Phone"
              value={editData.emergencyContactPhone}
              onChange={(e) => setEditData({ ...editData, emergencyContactPhone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Blood Group"
              value={editData.bloodGroup}
              onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })}
            />
            <InputField
              label="Mobility Status"
              value={editData.mobilityStatus}
              onChange={(e) => setEditData({ ...editData, mobilityStatus: e.target.value })}
            />
          </div>

          <InputField
            label="Residential Address"
            value={editData.address}
            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
          />

          <div>
            <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
              Care Instructions & Health Preferences
            </label>
            <textarea
              rows={2}
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
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
              <span>Update Profile</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
