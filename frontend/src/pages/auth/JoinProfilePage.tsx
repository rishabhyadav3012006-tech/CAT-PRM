import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Users, Heart, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { AuthLayout } from '../../components/auth/AuthLayout.tsx';
import { InputField } from '../../components/ui/InputField.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { CuteBadge } from '../../components/ui/CuteBadge.tsx';

export const JoinProfilePage: React.FC = () => {
  const { user, isAuthenticated, setSelectedElderlyId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Form State
  const [profileCode, setProfileCode] = useState('ELD-VANCE-78');
  const [relationship, setRelationship] = useState('Daughter');
  const [notes, setNotes] = useState('Supporting daily medication schedules and doctor appointments.');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<any>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  // Incoming notice from registration
  const [incomingNotice, setIncomingNotice] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setIncomingNotice(state.message);
    }
    // Auto-lookup default demo profile code
    handleLookup('ELD-VANCE-78');
  }, [location.state]);

  const handleLookup = async (codeToLookup: string) => {
    const code = codeToLookup.trim();
    if (!code) return;

    setIsLookingUp(true);
    setLookupError(null);
    try {
      const res: any = await authApi.lookupProfileInvite(code);
      if (res.success && res.data) {
        setPreviewProfile(res.data);
      }
    } catch (err: any) {
      setPreviewProfile(null);
      setLookupError(err?.message || `No profile found matching code "${code}".`);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!profileCode.trim()) {
      setSubmitError('Please enter a healthcare profile invitation code.');
      return;
    }

    if (!relationship.trim()) {
      setSubmitError('Please select or specify your relationship.');
      return;
    }

    // If user is not authenticated, prompt to sign in or register first
    if (!isAuthenticated) {
      setSubmitError('Please sign in to your CareNest account before joining a healthcare circle.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await authApi.joinProfile({
        profileCode: profileCode.trim(),
        relationship,
        notes: notes.trim()
      });

      if (res.success) {
        if (res.data?.elderlyProfileId) {
          setSelectedElderlyId(res.data.elderlyProfileId);
        }
        setIsJoined(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Unable to join healthcare profile circle.');
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const relationshipOptions = [
    { value: 'Daughter', label: 'Daughter' },
    { value: 'Son', label: 'Son' },
    { value: 'Spouse', label: 'Spouse / Partner' },
    { value: 'Grandchild', label: 'Granddaughter / Grandson' },
    { value: 'Sister/Brother', label: 'Sister / Brother' },
    { value: 'Primary Caregiver', label: 'Primary Caregiver / Healthcare Aide' },
    { value: 'Visiting Nurse', label: 'Visiting Nurse' },
    { value: 'Physician', label: 'Attending Doctor' },
    { value: 'Friend / Neighbor', label: 'Family Friend / Trusted Neighbor' }
  ];

  return (
    <AuthLayout
      title="Join Healthcare Circle"
      subtitle="Connect with an elderly family member using their unique Care Circle code"
      badgeText="Family & Caregiver Connection"
      quote={{
        text: "Coordinating mom's healthcare between my brother, her visiting nurse, and myself used to be stressful. Joining her CareNest profile connected all of us in under a minute.",
        author: "Sarah Vance",
        role: "Primary Care Coordinator"
      }}
    >
      {/* Registration notice banner */}
      {incomingNotice && (
        <div className="mb-5 p-3.5 rounded-2xl bg-[#DDF5E9] border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{incomingNotice}</span>
        </div>
      )}

      {/* Success banner */}
      {isJoined ? (
        <div className="space-y-6 text-left animate-fadeIn">
          <div className="p-6 rounded-3xl bg-[#DDF5E9] border border-emerald-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-glow-purple/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold font-heading text-emerald-900">
              Connected to Care Circle!
            </h3>
            <p className="text-xs font-medium font-body text-emerald-800 max-w-sm mx-auto">
              You are now linked with <strong>{previewProfile?.name || 'Eleanor Vance'}</strong>'s profile. You can view medications, appointments, and daily vitals.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Patient Dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleJoin} className="space-y-4 text-left">
          {submitError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{submitError}</span>
                {!isAuthenticated && (
                  <div>
                    <Link to="/login" className="underline font-bold text-rose-800">
                      Sign in here first
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invitation Code Input & Quick Lookup */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]">
                Healthcare Profile Invitation Code <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setProfileCode('ELD-VANCE-78');
                  handleLookup('ELD-VANCE-78');
                }}
                className="text-[11px] font-bold text-[#7969B5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#7969B5]" />
                <span>Fill Demo (ELD-VANCE-78)</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={profileCode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setProfileCode(val);
                }}
                placeholder="e.g. ELD-VANCE-78 or eld-01"
                className="flex-1 min-h-[46px] px-4 py-2.5 bg-white/85 border-2 border-[#E5E4F2] focus:border-[#7969B5] focus:ring-4 focus:ring-[#E9E3FF] rounded-2xl text-sm font-bold tracking-wider uppercase text-[#34354A] shadow-glass-sm focus:outline-none"
                required
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => handleLookup(profileCode)}
                isLoading={isLookingUp}
              >
                Lookup
              </Button>
            </div>
          </div>

          {/* Live Preview Card of Elderly Individual */}
          {lookupError ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              ⚠️ {lookupError}
            </div>
          ) : previewProfile ? (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FAF9FF] to-[#F3F0FF] border border-[#E5E4F2] shadow-glass-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={previewProfile.avatarUrl}
                    alt={previewProfile.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-black font-heading text-[#34354A] flex items-center gap-1.5">
                      <span>{previewProfile.name}</span>
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                    </h4>
                    <p className="text-[11px] text-[#7A7D9D] font-medium">
                      Blood Group: <strong className="text-[#34354A]">{previewProfile.bloodGroup}</strong> • {previewProfile.address}
                    </p>
                  </div>
                </div>
                <CuteBadge variant="mint" size="sm">Verified Patient</CuteBadge>
              </div>

              {/* Conditions & Emergency Contact Badges */}
              <div className="pt-2 border-t border-[#E5E4F2]/60 flex flex-wrap gap-1.5 text-[10px]">
                {previewProfile.chronicConditions?.map((c: string) => (
                  <span key={c} className="px-2 py-0.5 rounded-full bg-white border border-[#E5E4F2] text-[#34354A] font-bold">
                    🩺 {c}
                  </span>
                ))}
                <span className="px-2 py-0.5 rounded-full bg-[#FFE9DC] text-[#DD6B20] font-bold">
                  ⚠️ Primary Contact: {previewProfile.emergencyContactName}
                </span>
              </div>
            </div>
          ) : null}

          {/* Relationship Selection */}
          <SelectField
            label="Your Relationship to Patient"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            options={relationshipOptions}
            helperText="Defines your access permissions and emergency dispatch order"
            required
          />

          {/* Notes / Special Care Focus */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]">
              Care Coordination Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Overseeing morning medication schedule and weekly doctor visits"
              className="w-full px-4 py-2.5 bg-white/85 border-2 border-[#E5E4F2] focus:border-[#7969B5] focus:ring-4 focus:ring-[#E9E3FF] rounded-2xl text-xs sm:text-sm font-medium text-[#34354A] shadow-glass-sm focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Joining Care Circle...' : 'Connect to Care Circle'}
            </Button>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/dashboard"
              className="text-xs text-[#7A7D9D] hover:text-[#34354A] underline font-medium"
            >
              Skip and go to dashboard
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default JoinProfilePage;

