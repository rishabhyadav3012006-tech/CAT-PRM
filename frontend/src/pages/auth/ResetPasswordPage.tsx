import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authApi } from '../../api/client.ts';
import { AuthLayout } from '../../components/auth/AuthLayout.tsx';
import { PasswordInput } from '../../components/auth/PasswordInput.tsx';
import { InputField } from '../../components/ui/InputField.tsx';
import { Button } from '../../components/ui/Button.tsx';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Password reset token is missing. Please click the link from your email or paste your security token.');
      return;
    }

    if (password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await authApi.resetPassword({
        token: token.trim(),
        password
      });

      if (res.success) {
        setIsSuccess(true);
      }
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Failed to reset password. The link may have expired.');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Enter a new secure password for your CareNest account"
      badgeText="Secure Password Reset"
      quote={{
        text: "Your health records and patient communications are protected with end-to-end encryption. A strong password keeps your loved ones safe.",
        author: "CareNest Security",
        role: "Compliance Office"
      }}
    >
      {isSuccess ? (
        <div className="space-y-6 text-left animate-fadeIn">
          <div className="p-5 rounded-3xl bg-[#DDF5E9] border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-800">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold font-heading">
                  Password Reset Successful!
                </h3>
                <p className="text-xs text-emerald-700">
                  Your credentials have been securely updated.
                </p>
              </div>
            </div>
            <p className="text-xs font-medium font-body text-emerald-900 leading-relaxed pt-1">
              You can now sign in with your updated password to resume managing medications, appointments, and care logs.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            onClick={() => navigate('/login', { state: { message: 'Your password was reset successfully. Please sign in now.' } })}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In with New Password
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{error}</span>
                {error.includes('expired') && (
                  <div>
                    <Link to="/forgot-password" className="underline font-bold text-rose-800">
                      Request a new password reset link
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Token input (auto-filled if present in query) */}
          {!tokenParam && (
            <InputField
              label="Reset Security Token"
              type="text"
              placeholder="Paste the reset token from your email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4" />}
              helperText="Find this token in your reset email instructions"
              required
            />
          )}

          <PasswordInput
            label="New Password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showStrengthMeter={true}
            autoComplete="new-password"
            required
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="text-xs font-bold text-[#7969B5] hover:text-[#6453A3] hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;

