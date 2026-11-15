import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { AuthLayout } from '../../components/auth/AuthLayout.tsx';
import { InputField } from '../../components/ui/InputField.tsx';
import { PasswordInput } from '../../components/auth/PasswordInput.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { CuteBadge, BadgeVariant } from '../../components/ui/CuteBadge.tsx';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for redirected email or notices (e.g. from password reset)
  useEffect(() => {
    const state = location.state as { email?: string; message?: string } | null;
    if (state?.email) {
      setEmail(state.email);
    }
    if (state?.message) {
      setSuccessNotice(state.message);
    }

    const savedEmail = localStorage.getItem('carenest_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    // Validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email.trim(), password);

      if (rememberMe) {
        localStorage.setItem('carenest_remember_email', email.trim());
      } else {
        localStorage.removeItem('carenest_remember_email');
      }

      // Role-based navigation
      if (loggedUser?.role === 'ELDERLY') {
        navigate('/dashboard');
      } else if (loggedUser?.role === 'FAMILY_MEMBER') {
        navigate('/dashboard');
      } else if (loggedUser?.role === 'CAREGIVER') {
        navigate('/activities');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errMsg = err?.message || (typeof err === 'string' ? err : 'Invalid email or password.');
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async (role: UserRole) => {
    setError(null);
    setSuccessNotice(null);
    setIsSubmitting(true);
    try {
      await switchDemoRole(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Unable to sign in with demo profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoRoles: { role: UserRole; name: string; title: string; badge: BadgeVariant }[] = [
    { role: 'ELDERLY', name: 'Eleanor Vance', title: 'Elderly Patient (78y)', badge: 'mint' },
    { role: 'FAMILY_MEMBER', name: 'Sarah Vance', title: 'Daughter / Family', badge: 'babyBlue' },
    { role: 'CAREGIVER', name: 'Marcus Chen', title: 'Primary Caregiver', badge: 'lavender' },
    { role: 'DOCTOR', name: 'Dr. Adams', title: 'Cardiologist', badge: 'peach' },
  ];

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your CareNest account to manage daily care and appointments"
      badgeText="Secure Portal Sign-In"
      quote={{
        text: "Signing in every morning gives me instant peace of mind. I can see my father's morning medication has already been logged by his nurse.",
        author: "David Miller",
        role: "Family Circle Member"
      }}
    >
      {/* Success banner if redirected from reset password or verification */}
      {successNotice && (
        <div className="mb-5 p-3.5 rounded-2xl bg-[#DDF5E9] border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <InputField
          label="Email Address"
          type="email"
          placeholder="e.g. sarah.vance@carenest.health"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        {/* Password */}
        <div className="space-y-1">
          <PasswordInput
            label="Password"
            placeholder="Enter your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <div className="flex items-center justify-between pt-1">
            {/* Remember Me Checkbox */}
            <label className="flex items-center gap-2 text-xs font-semibold text-[#34354A] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md text-[#7969B5] border-[#D1CEE8] focus:ring-[#7969B5] cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            {/* Forgot Password Link */}
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-[#7969B5] hover:text-[#6453A3] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit Login Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In to CareNest'}
          </Button>
        </div>
      </form>

      {/* 1-Click Instant Demo Persona Access */}
      <div className="mt-7 pt-6 border-t border-[#E5E4F2] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold font-title text-[#7A7D9D] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7969B5]" />
            <span>Instant Demo Logins (No Typing)</span>
          </span>
          <CuteBadge variant="lavender" size="sm">Quick Access</CuteBadge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {demoRoles.map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => handleDemoSignIn(item.role)}
              disabled={isSubmitting}
              className="p-2.5 rounded-2xl bg-white border border-[#E5E4F2] hover:border-[#7969B5] hover:bg-[#FAF9FF] text-left transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#E9E3FF]"
            >
              <p className="font-extrabold font-heading text-xs text-[#34354A] truncate">
                {item.name}
              </p>
              <CuteBadge variant={item.badge} size="sm" className="mt-1 text-[10px]">
                {item.title}
              </CuteBadge>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Switch to Register Link */}
      <div className="mt-6 text-center text-xs font-medium text-[#7A7D9D]">
        Don't have a CareNest account?{' '}
        <Link
          to="/register"
          className="font-black text-[#7969B5] hover:text-[#6453A3] hover:underline"
        >
          Create an Account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

