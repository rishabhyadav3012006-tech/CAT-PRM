import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { authApi } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { AuthLayout } from '../../components/auth/AuthLayout.tsx';
import { InputField } from '../../components/ui/InputField.tsx';
import { CodeInput } from '../../components/auth/CodeInput.tsx';
import { Button } from '../../components/ui/Button.tsx';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const emailParam = searchParams.get('email') || user?.email || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!code || code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await authApi.verifyEmail({
        email: email.trim(),
        code: code.trim()
      });

      if (res.success) {
        setIsVerified(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2200);
      }
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Invalid verification code. Please check your inbox.');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setIsResending(true);
    try {
      const res: any = await authApi.resendVerificationCode(email.trim());
      if (res.success) {
        setSuccessNotice('A new 6-digit code has been dispatched to your email.');
        setCooldown(30);
      }
    } catch (err: any) {
      setError('Unable to resend verification code right now.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Enter the 6-digit verification code sent to your inbox"
      badgeText="Identity & Security Verification"
      quote={{
        text: "Verifying your contact information guarantees that critical medical reminders and emergency alerts reach your device without delay.",
        author: "CareNest Alert Network",
        role: "Real-Time Emergency Dispatch"
      }}
    >
      {isVerified ? (
        <div className="space-y-6 text-left animate-fadeIn">
          <div className="p-6 rounded-3xl bg-[#DDF5E9] border border-emerald-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-glow-purple/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold font-heading text-emerald-900">
              Email Verified Successfully!
            </h3>
            <p className="text-xs font-medium font-body text-emerald-800 max-w-sm mx-auto">
              Your CareNest account is now fully active. Redirecting you to your healthcare dashboard...
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
            Go to Dashboard Now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5 text-left">
          {successNotice && (
            <div className="p-3.5 rounded-2xl bg-[#DDF5E9] border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email input field */}
          <InputField
            label="Verification Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          {/* 6-digit Code input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-bold font-heading text-[#34354A]">
                6-Digit Security Code
              </label>
              {/* One-click quick fill for testing demo */}
              <button
                type="button"
                onClick={() => setCode('123456')}
                className="text-[11px] font-bold text-[#7969B5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#7969B5]" />
                <span>Auto-fill Demo Code (123456)</span>
              </button>
            </div>

            <CodeInput value={code} onChange={(val) => setCode(val)} length={6} disabled={isSubmitting} />

            <p className="text-[11px] text-[#7A7D9D] text-center">
              Enter the numbers sent to <strong className="text-[#34354A]">{email || 'your email'}</strong>
            </p>
          </div>

          {/* Verify button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Verifying Code...' : 'Confirm Verification Code'}
            </Button>
          </div>

          {/* Resend button & cooldown */}
          <div className="flex items-center justify-between pt-2 text-xs font-semibold">
            <span className="text-[#7A7D9D]">Didn't receive the email?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className={`flex items-center gap-1 font-bold ${
                cooldown > 0
                  ? 'text-[#A0A3BD] cursor-not-allowed'
                  : 'text-[#7969B5] hover:text-[#6453A3] cursor-pointer hover:underline'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/dashboard"
              className="text-xs text-[#7A7D9D] hover:text-[#34354A] underline font-medium"
            >
              Skip verification for now
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;

