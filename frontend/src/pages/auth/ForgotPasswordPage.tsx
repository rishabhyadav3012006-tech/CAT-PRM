import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, RefreshCw } from 'lucide-react';
import { authApi } from '../../api/client.ts';
import { AuthLayout } from '../../components/auth/AuthLayout.tsx';
import { InputField } from '../../components/ui/InputField.tsx';
import { Button } from '../../components/ui/Button.tsx';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetPayload, setResetPayload] = useState<{
    email: string;
    resetToken?: string;
    previewUrl?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await authApi.forgotPassword(email.trim());
      if (res.success) {
        setResetPayload({
          email: email.trim(),
          resetToken: res.data?.resetToken,
          previewUrl: res.data?.previewUrl
        });
      }
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Unable to find an account with that email.');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your registered CareNest email to receive secure recovery instructions"
      badgeText="Account Security Recovery"
      quote={{
        text: "Healthcare access should always be reliable and stress-free. With CareNest's secure self-service recovery, you're never locked out from managing critical care.",
        author: "CareNest Trust & Safety",
        role: "HIPAA Security Desk"
      }}
    >
      {resetPayload ? (
        /* Success State */
        <div className="space-y-6 text-left animate-fadeIn">
          <div className="p-5 rounded-3xl bg-[#DDF5E9] border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-800">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold font-heading">
                Reset Link Dispatched!
              </h3>
            </div>
            <p className="text-xs font-medium font-body text-emerald-900 leading-relaxed">
              We've sent password reset instructions to{' '}
              <strong className="font-bold underline">{resetPayload.email}</strong>. Please check your inbox or spam folder.
            </p>
          </div>

          {/* Quick-test helper button during development / demonstration */}
          {resetPayload.resetToken && (
            <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E5E4F2] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold font-heading text-[#34354A]">
                <KeyRound className="w-4 h-4 text-[#7969B5]" />
                <span>One-Click Password Reset (Demo Mode)</span>
              </div>
              <p className="text-[11px] text-[#7A7D9D]">
                In this preview environment, you can jump directly to the reset password form with your security token:
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/reset-password?token=${resetPayload.resetToken}`)}
                className="w-full justify-center text-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Proceed to Reset Password Page
              </Button>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                setResetPayload(null);
                setEmail('');
              }}
              className="w-full justify-center"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Send to Another Email Address
            </Button>

            <Link
              to="/login"
              className="block text-center text-xs font-bold text-[#7969B5] hover:text-[#6453A3] hover:underline"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        /* Request Form State */
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <InputField
            label="Registered Email Address"
            type="email"
            placeholder="e.g. sarah.vance@carenest.health"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="We will send a 1-hour secure password reset link to this address."
            autoComplete="email"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isSubmitting ? 'Sending Reset Instructions...' : 'Send Password Reset Link'}
          </Button>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7969B5] hover:text-[#6453A3] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
