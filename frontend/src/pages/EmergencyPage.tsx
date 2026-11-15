import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Check,
  Clock,
  Heart,
  Pill,
  Activity,
  UserCheck
} from 'lucide-react';
import { alertsApi } from '../api/client.ts';
import { EmergencyAlert, EmergencyProfileData } from '../types/index.ts';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { CuteBadge } from '../components/ui/CuteBadge.tsx';
import { EmergencyConfirmationModal } from '../components/emergency/EmergencyConfirmationModal.tsx';

export const EmergencyPage: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<EmergencyProfileData | null>(null);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const [alertsRes, profileRes]: any = await Promise.all([
        alertsApi.getActive(),
        alertsApi.getEmergencyProfile('eld-01')
      ]);
      if (alertsRes.success && alertsRes.data) {
        setAlerts(alertsRes.data);
      }
      if (profileRes.success && profileRes.data) {
        setProfileData(profileRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    const notes = window.prompt(
      'Enter resolution summary (e.g. Caregiver on site, vitals checked and stable):'
    );
    if (!notes) return;

    try {
      await alertsApi.resolve(alertId, notes);
      fetchAlerts();
    } catch (err) {
      alert('Failed to resolve alert');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to CareNest Emergency Dispatch Network..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#34354A]">
      {/* Title */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-2 mb-1">
          <CuteBadge variant="pink" size="sm" icon={<ShieldAlert className="w-3.5 h-3.5" />} pulseDot dot>
            24/7 Priority Emergency Monitoring
          </CuteBadge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-[#34354A]">
          Emergency Assistance & Response
        </h1>
        <p className="text-sm font-medium font-body text-[#575973] max-w-lg mx-auto">
          Immediate multi-channel alert dispatch to family members, on-duty caregivers, and physician records
        </p>
      </div>

      {broadcastNotice && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-[#FCE4ED] border-2 border-[#F9BFD4] rounded-3xl text-[#8F1E48] text-sm font-extrabold font-heading flex items-center gap-3 shadow-glass-sm"
        >
          <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0 animate-bounce" />
          <span>{broadcastNotice}</span>
        </motion.div>
      )}

      {/* Massive SOS Button Glass Card */}
      <GlassCard
        variant="pink"
        padding="xl"
        rounded="4xl"
        className="border-3 border-[#F9BFD4] text-center flex flex-col items-center justify-center relative overflow-hidden"
      >
        <p className="text-xs font-black font-title text-[#8F1E48] uppercase tracking-widest mb-6">
          One-Touch Rapid Emergency Trigger
        </p>

        {/* Pulsating Ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-30" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsModalOpen(true)}
            className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-red-500 text-white font-black font-heading text-2xl sm:text-3xl shadow-glow-pink flex flex-col items-center justify-center gap-2 border-8 border-white/80 hover:border-white transition-all cursor-pointer select-none"
            aria-label="Activate Emergency Assistance"
          >
            <ShieldAlert className="w-14 h-14 animate-pulse" />
            <span className="tracking-tight">EMERGENCY</span>
            <span className="text-xs font-bold font-body tracking-wider opacity-90 uppercase">
              Press SOS
            </span>
          </motion.button>
        </div>

        <p className="text-xs sm:text-sm font-medium font-body text-[#575973] mt-7 max-w-md mx-auto">
          Pressing this opens the confirmation screen, notifies Sarah Vance (Family) and Marcus Chen (Caregiver), and shares Eleanor's permitted emergency medical profile.
        </p>
      </GlassCard>

      {/* Verified Integration Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold font-heading">
            Emergency Services (911) Notification Disclaimer:
          </span>
          <p className="text-xs text-amber-800 leading-relaxed">
            CareNest automatically notifies your designated <strong>family members and caregivers</strong>. Local municipal emergency services (911 / EMS) are <strong>NOT</strong> automatically called unless confirmed by a verified emergency dispatch integration. Use the direct 911 button below for acute emergencies.
          </p>
        </div>
      </div>

      {/* Quick Dial Emergency Hotlines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="tel:911"
          className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-200 hover:border-rose-300 transition-all flex items-center gap-4 group"
          title="Call 911 Emergency Services"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold font-heading text-[#7A7D9D]">Emergency Dispatch</p>
            <h4 className="text-lg font-black font-heading text-rose-700">911 / EMS</h4>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
              Call Hotline
            </span>
          </div>
        </a>

        <a
          href="tel:+15554567890"
          className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-300 transition-all flex items-center gap-4 group"
          title="Call Primary Caregiver Marcus Chen"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#2B8756] text-white flex items-center justify-center shadow-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold font-heading text-[#7A7D9D]">Caregiver (Marcus)</p>
            <h4 className="text-sm font-black font-heading text-[#34354A]">+1 (555) 456-7890</h4>
            <span className="text-[10px] font-bold text-[#2B8756] uppercase tracking-wide">
              On Duty Now
            </span>
          </div>
        </a>

        <a
          href="tel:+15553456789"
          className="p-4 rounded-3xl bg-blue-50 border-2 border-blue-200 hover:border-blue-300 transition-all flex items-center gap-4 group"
          title="Call Daughter Sarah Vance"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#2B6EB5] text-white flex items-center justify-center shadow-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold font-heading text-[#7A7D9D]">Daughter (Sarah)</p>
            <h4 className="text-sm font-black font-heading text-[#34354A]">+1 (555) 345-6789</h4>
            <span className="text-[10px] font-bold text-[#2B6EB5] uppercase tracking-wide">
              Family Admin
            </span>
          </div>
        </a>
      </div>

      {/* Permitted Emergency Medical Card */}
      {profileData && (
        <GlassCard variant="white" padding="lg" rounded="3xl" className="border-2 border-purple-100 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7969B5] flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className="text-base font-extrabold font-heading text-[#34354A]">
                Permitted Emergency Medical Profile
              </h3>
            </div>
            <span className="text-xs font-bold text-[#7969B5] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              Eleanor Vance • Blood: {profileData.patient.bloodGroup || 'O+'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-700 font-heading block">
                ⚠️ Known Medical Allergies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profileData.knownAllergies.map((a, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-xl bg-rose-50 text-rose-800 font-bold border border-rose-200"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2B6EB5] font-heading block">
                Relevant Medical Information:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profileData.relevantMedicalInfo.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs rounded-xl bg-blue-50 text-[#2B6EB5] font-semibold border border-blue-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-purple-50">
            <span className="text-xs font-bold text-[#2B8756] font-heading block">
              Current Medications (Authorized):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {profileData.currentMedications.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs flex items-center justify-between"
                >
                  <span className="font-bold text-[#34354A]">{m.name}</span>
                  <span className="text-emerald-700 font-bold">{m.dosage}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Active Incidents Log */}
      <GlassCard variant="white" padding="lg" rounded="3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFE9DC] text-[#B85820] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-extrabold font-heading text-[#34354A]">
              Active Incident Feed
            </h3>
          </div>
          <CuteBadge variant="peach" size="sm">
            {alerts.length} Pending
          </CuteBadge>
        </div>

        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl border-2 border-[#F9BFD4] bg-[#FCE4ED]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CuteBadge variant="pink" size="sm">
                      {alert.type}
                    </CuteBadge>
                    <span className="text-xs font-medium font-body text-[#7A7D9D] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(alert.triggeredAt).toLocaleString()}</span>
                    </span>
                  </div>
                  <p className="text-sm font-bold font-heading text-[#34354A] mt-1.5">
                    {alert.message}
                  </p>
                </div>

                <Button
                  variant="mint"
                  size="sm"
                  onClick={() => handleResolveAlert(alert.id)}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  className="rounded-xl self-start sm:self-center"
                >
                  <span>Resolve Alert</span>
                </Button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#7A7D9D]">
              <CheckCircle2 className="w-10 h-10 text-[#2B8756] mx-auto mb-2" />
              <p className="text-sm font-extrabold font-heading text-[#34354A]">
                No active emergency incidents
              </p>
              <p className="text-xs font-medium font-body text-[#7A7D9D] mt-0.5">
                Eleanor Vance's healthcare system is safe and stable.
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Emergency Confirmation Modal */}
      <EmergencyConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        elderlyId="eld-01"
        onAlertTriggered={fetchAlerts}
      />
    </div>
  );
};
