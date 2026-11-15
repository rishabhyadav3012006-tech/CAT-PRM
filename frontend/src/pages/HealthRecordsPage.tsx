import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Plus, Heart, Droplet, Thermometer, Wind, Scale, AlertTriangle, CheckCircle2, FolderLock } from 'lucide-react';
import { recordsApi } from '../api/client.ts';
import { HealthRecord } from '../types/index.ts';
import { Modal } from '../components/ui/Modal.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { GlassCard } from '../components/ui/GlassCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { CuteBadge } from '../components/ui/CuteBadge.tsx';
import { InputField } from '../components/ui/InputField.tsx';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const HealthRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    systolicBp: '122',
    diastolicBp: '78',
    bloodGlucose: '105',
    heartRate: '72',
    oxygenSaturation: '98',
    bodyTemperature: '98.4',
    weight: '64.5',
    notes: ''
  });

  const fetchRecords = async () => {
    try {
      const res: any = await recordsApi.getAll('eld-01', 25);
      if (res.success && res.data) {
        setRecords(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        elderlyId: 'eld-01',
        notes: formData.notes
      };

      if (formData.systolicBp) payload.systolicBp = Number(formData.systolicBp);
      if (formData.diastolicBp) payload.diastolicBp = Number(formData.diastolicBp);
      if (formData.bloodGlucose) payload.bloodGlucose = Number(formData.bloodGlucose);
      if (formData.heartRate) payload.heartRate = Number(formData.heartRate);
      if (formData.oxygenSaturation) payload.oxygenSaturation = Number(formData.oxygenSaturation);
      if (formData.bodyTemperature) payload.bodyTemperature = Number(formData.bodyTemperature);
      if (formData.weight) payload.weight = Number(formData.weight);

      const res: any = await recordsApi.create(payload);
      setIsModalOpen(false);
      setSuccessMsg(
        res.data?.isAlert
          ? 'Vital logged! Note: Values are outside target clinical threshold.'
          : 'Vital successfully recorded in Eleanor’s health journal.'
      );
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchRecords();
    } catch (err) {
      alert('Failed to record vitals');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Eleanor's clinical vitals & health trends..." />;
  }

  const latest = records[0];

  const chartData = [...records].reverse().map((r) => ({
    time: new Date(r.recordedAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    systolic: r.systolicBp,
    diastolic: r.diastolicBp,
    glucose: r.bloodGlucose,
    heartRate: r.heartRate
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CuteBadge variant="peach" size="sm" icon={<Activity className="w-3.5 h-3.5" />}>
              Biometric Telehealth
            </CuteBadge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#34354A] tracking-tight">
            Health Records & Clinical Vitals
          </h1>
          <p className="text-sm font-medium font-body text-[#575973]">
            Real-time biometric monitoring, threshold alerts, and longitudinal wellness trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/vault"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E9E3FF] text-[#45347B] border border-[#D2C7FC] text-sm font-extrabold font-heading hover:bg-[#DED5FF] transition-all shadow-glass-sm"
          >
            <FolderLock className="w-4 h-4 text-[#7969B5]" />
            <span>Prescription & Records Vault</span>
          </Link>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="rounded-2xl shadow-glow-purple"
          >
            <span>Record New Vitals</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-[#DDF5E9] border-2 border-[#BFE7D2] rounded-3xl text-[#1F6A42] text-sm font-bold font-heading flex items-center gap-2 shadow-glass-sm">
          <CheckCircle2 className="w-5 h-5 text-[#2B8756]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Latest Vitals Snapshot Cards in Soft Pastels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <GlassCard variant="pink" padding="sm" rounded="2xl" className="border-2 text-center">
          <div className="w-9 h-9 rounded-xl bg-white text-[#B53364] mx-auto flex items-center justify-center mb-1.5 shadow-2xs">
            <Heart className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold font-heading text-[#7A7D9D]">Blood Pressure</p>
          <h4 className="text-xl font-black font-heading text-[#34354A] mt-0.5">
            {latest?.systolicBp ? `${latest.systolicBp}/${latest.diastolicBp}` : '124/78'}
          </h4>
          <span className="text-[10px] text-[#7A7D9D] font-medium">mmHg (&lt;130)</span>
        </GlassCard>

        <GlassCard variant="peach" padding="sm" rounded="2xl" className="border-2 text-center">
          <div className="w-9 h-9 rounded-xl bg-white text-[#B85820] mx-auto flex items-center justify-center mb-1.5 shadow-2xs">
            <Droplet className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold font-heading text-[#7A7D9D]">Blood Glucose</p>
          <h4 className="text-xl font-black font-heading text-[#34354A] mt-0.5">
            {latest?.bloodGlucose ? `${latest.bloodGlucose}` : '108'}
          </h4>
          <span className="text-[10px] text-[#7A7D9D] font-medium">mg/dL</span>
        </GlassCard>

        <GlassCard variant="babyBlue" padding="sm" rounded="2xl" className="border-2 text-center">
          <div className="w-9 h-9 rounded-xl bg-white text-[#2B6EB5] mx-auto flex items-center justify-center mb-1.5 shadow-2xs">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold font-heading text-[#7A7D9D]">Heart Rate</p>
          <h4 className="text-xl font-black font-heading text-[#34354A] mt-0.5">
            {latest?.heartRate ? `${latest.heartRate}` : '72'}
          </h4>
          <span className="text-[10px] text-[#7A7D9D] font-medium">bpm (Resting)</span>
        </GlassCard>

        <GlassCard variant="mint" padding="sm" rounded="2xl" className="border-2 text-center">
          <div className="w-9 h-9 rounded-xl bg-white text-[#2B8756] mx-auto flex items-center justify-center mb-1.5 shadow-2xs">
            <Wind className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold font-heading text-[#7A7D9D]">Oxygen SpO₂</p>
          <h4 className="text-xl font-black font-heading text-[#34354A] mt-0.5">
            {latest?.oxygenSaturation ? `${latest.oxygenSaturation}%` : '98%'}
          </h4>
          <CuteBadge variant="mint" size="sm">Optimal</CuteBadge>
        </GlassCard>

        <GlassCard variant="lavender" padding="sm" rounded="2xl" className="border-2 text-center">
          <div className="w-9 h-9 rounded-xl bg-white text-[#7969B5] mx-auto flex items-center justify-center mb-1.5 shadow-2xs">
            <Thermometer className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold font-heading text-[#7A7D9D]">Temperature</p>
          <h4 className="text-xl font-black font-heading text-[#34354A] mt-0.5">
            {latest?.bodyTemperature ? `${latest.bodyTemperature}°` : '98.4°'}
          </h4>
          <span className="text-[10px] text-[#7A7D9D] font-medium">°F Oral</span>
        </GlassCard>

        <GlassCard variant="cream" padding="sm" rounded="2xl" className="border-2 text-center">
          <div className="w-9 h-9 rounded-xl bg-white text-[#997321] mx-auto flex items-center justify-center mb-1.5 shadow-2xs">
            <Scale className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold font-heading text-[#7A7D9D]">Weight</p>
          <h4 className="text-xl font-black font-heading text-[#34354A] mt-0.5">
            {latest?.weight ? `${latest.weight}` : '64.5'}
          </h4>
          <span className="text-[10px] text-[#7A7D9D] font-medium">kg (Stable)</span>
        </GlassCard>
      </div>

      {/* Longitudinal Vitals Trend Graph */}
      <GlassCard variant="white" padding="lg" rounded="3xl">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold font-heading text-[#34354A]">
            Longitudinal Vitals Trends
          </h2>
          <p className="text-xs sm:text-sm font-medium font-body text-[#7A7D9D]">
            Systolic & Diastolic Blood Pressure (mmHg) vs Blood Glucose (mg/dL)
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FAF9FF" />
              <XAxis dataKey="time" stroke="#9497B5" fontSize={11} />
              <YAxis stroke="#9497B5" fontSize={11} domain={[50, 180]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  border: '1px solid #E9E3FF',
                  boxShadow: '0 8px 32px 0 rgba(121, 105, 181, 0.1)',
                  fontSize: '12px',
                  fontFamily: 'Inter'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontFamily: 'Nunito', fontWeight: 'bold' }} />
              <Line
                type="monotone"
                dataKey="systolic"
                name="Systolic BP"
                stroke="#7969B5"
                strokeWidth={3}
                dot={{ r: 5, fill: '#7969B5' }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastolic BP"
                stroke="#2B6EB5"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2B6EB5' }}
              />
              <Line
                type="monotone"
                dataKey="glucose"
                name="Blood Glucose"
                stroke="#B85820"
                strokeWidth={2}
                dot={{ r: 4, fill: '#B85820' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Historical Table */}
      <GlassCard variant="white" padding="none" rounded="3xl" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-[#FAF9FF] bg-[#FAF9FF]/60">
          <h3 className="text-base font-extrabold font-heading text-[#34354A]">
            Biometric Telehealth Log History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FF] text-[#575973] font-extrabold font-heading border-b border-[#E5E4F2]">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Blood Pressure</th>
                <th className="px-5 py-3.5">Glucose</th>
                <th className="px-5 py-3.5">Heart Rate</th>
                <th className="px-5 py-3.5">SpO₂</th>
                <th className="px-5 py-3.5">Recorded By</th>
                <th className="px-5 py-3.5">Clinical State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF9FF] text-[#34354A]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF9FF]/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold font-heading">
                    {new Date(r.recordedAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 font-extrabold">
                    {r.systolicBp && r.diastolicBp ? `${r.systolicBp}/${r.diastolicBp} mmHg` : '—'}
                  </td>
                  <td className="px-5 py-3.5 font-semibold">{r.bloodGlucose ? `${r.bloodGlucose} mg/dL` : '—'}</td>
                  <td className="px-5 py-3.5">{r.heartRate ? `${r.heartRate} bpm` : '—'}</td>
                  <td className="px-5 py-3.5">{r.oxygenSaturation ? `${r.oxygenSaturation}%` : '—'}</td>
                  <td className="px-5 py-3.5 text-[#7A7D9D]">{r.recordedBy?.name || 'Self / Caregiver'}</td>
                  <td className="px-5 py-3.5">
                    {r.isAlert ? (
                      <CuteBadge variant="pink" size="sm" dot pulseDot icon={<AlertTriangle className="w-3 h-3" />}>
                        Abnormal
                      </CuteBadge>
                    ) : (
                      <CuteBadge variant="mint" size="sm" dot>
                        Optimal
                      </CuteBadge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Record Vitals Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Clinical Biometrics"
        subtitle="Automatic threshold verification will alert caregivers if values are out-of-range"
        icon={<Activity className="w-5 h-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Systolic BP (mmHg)"
              type="number"
              placeholder="120"
              value={formData.systolicBp}
              onChange={(e) => setFormData({ ...formData, systolicBp: e.target.value })}
            />
            <InputField
              label="Diastolic BP (mmHg)"
              type="number"
              placeholder="80"
              value={formData.diastolicBp}
              onChange={(e) => setFormData({ ...formData, diastolicBp: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Blood Glucose (mg/dL)"
              type="number"
              placeholder="100"
              value={formData.bloodGlucose}
              onChange={(e) => setFormData({ ...formData, bloodGlucose: e.target.value })}
            />
            <InputField
              label="Heart Rate (bpm)"
              type="number"
              placeholder="72"
              value={formData.heartRate}
              onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <InputField
              label="SpO₂ (%)"
              type="number"
              placeholder="98"
              value={formData.oxygenSaturation}
              onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
            />
            <InputField
              label="Temp (°F)"
              type="number"
              step="0.1"
              placeholder="98.6"
              value={formData.bodyTemperature}
              onChange={(e) => setFormData({ ...formData, bodyTemperature: e.target.value })}
            />
            <InputField
              label="Weight (kg)"
              type="number"
              step="0.1"
              placeholder="64.5"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A] mb-1.5">
              Clinical Symptoms / Subjective Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Eleanor felt energized after morning walk, denies dizziness or shortness of breath."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              <span>Save Biometrics</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
