import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { AuthLayout } from '../../components/auth/AuthLayout.tsx';
import { InputField } from '../../components/ui/InputField.tsx';
import { PasswordInput } from '../../components/auth/PasswordInput.tsx';
import { AccountTypeSelector } from '../../components/auth/AccountTypeSelector.tsx';
import { Button } from '../../components/ui/Button.tsx';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<UserRole>('FAMILY_MEMBER');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Field Errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicateUser, setIsDuplicateUser] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Please enter your full legal or preferred name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (phone.trim() && phone.trim().length < 7) {
      errors.phone = 'Please enter a valid phone number (at least 7 digits).';
    }

    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please recheck your entry.';
    }

    if (!agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service & Healthcare Privacy Policy.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setIsDuplicateUser(false);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const createdUser = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        role: accountType
      });

      // Role-based post-registration redirection
      if (accountType === 'ELDERLY') {
        // Elderly patient goes directly to dashboard with their profile auto-created
        navigate('/dashboard', {
          state: { message: `Welcome to CareNest, ${name}! Your healthcare profile has been created.` }
        });
      } else if (accountType === 'FAMILY_MEMBER' || accountType === 'CAREGIVER') {
        // Family members and caregivers are invited to connect to an elderly profile
        navigate('/join-profile', {
          state: {
            message: `Account created for ${name}! Now let's connect to your loved one's Care Circle.`,
            role: accountType
          }
        });
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Registration failed. Please verify your details.');
      setGeneralError(msg);

      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate')) {
        setIsDuplicateUser(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create CareNest Account"
      subtitle="Join the smart healthcare ecosystem connecting seniors, families, and caregivers"
      badgeText="Patient & Family Registration"
      quote={{
        text: "Setting up our account took only two minutes. Having all our mom's prescriptions, doctor visits, and daily activities in one shared place has made caring so much simpler.",
        author: "Marcus Chen",
        role: "Certified Healthcare Aide"
      }}
    >
      {/* General / Duplicate Error Alert */}
      {generalError && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{generalError}</span>
          </div>

          {/* Quick-action button if duplicate user */}
          {isDuplicateUser && (
            <div className="pt-1">
              <Link
                to="/login"
                state={{ email }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                <span>Sign in with this email instead</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <InputField
          label="Full Name"
          type="text"
          placeholder="e.g. Sarah Vance"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
          }}
          leftIcon={<UserIcon className="w-4 h-4" />}
          error={fieldErrors.name}
          autoComplete="name"
          required
        />

        {/* Email & Phone grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Email Address"
            type="email"
            placeholder="e.g. sarah@carenest.health"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
            }}
            leftIcon={<Mail className="w-4 h-4" />}
            error={fieldErrors.email}
            autoComplete="email"
            required
          />

          <InputField
            label="Phone Number"
            type="tel"
            placeholder="e.g. +1 (555) 234-5678"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: '' }));
            }}
            leftIcon={<Phone className="w-4 h-4" />}
            error={fieldErrors.phone}
            autoComplete="tel"
            helperText="Used for urgent SMS & medication alerts"
          />
        </div>

        {/* Account Type Selection */}
        <AccountTypeSelector
          value={accountType}
          onChange={(role) => setAccountType(role)}
          error={fieldErrors.accountType}
        />

        {/* Password & Confirm Password grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PasswordInput
            label="Create Password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
            }}
            showStrengthMeter={true}
            error={fieldErrors.password}
            autoComplete="new-password"
            required
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Re-type password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            required
          />
        </div>

        {/* Terms and Privacy Consent */}
        <div className="pt-1 text-left">
          <label className="flex items-start gap-2.5 text-xs font-semibold text-[#34354A] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (fieldErrors.agreeTerms) setFieldErrors((prev) => ({ ...prev, agreeTerms: '' }));
              }}
              className="mt-0.5 w-4 h-4 rounded-md text-[#7969B5] border-[#D1CEE8] focus:ring-[#7969B5] cursor-pointer shrink-0"
            />
            <span className="leading-relaxed">
              I agree to the CareNest{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()} className="text-[#7969B5] hover:underline font-bold">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#7969B5] hover:underline font-bold">
                Healthcare Privacy Policy
              </a>
              , including HIPAA-compliant communication.
            </span>
          </label>
          {fieldErrors.agreeTerms && (
            <p className="text-xs font-semibold text-rose-600 mt-1 pl-6">
              ⚠️ {fieldErrors.agreeTerms}
            </p>
          )}
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
            {isSubmitting ? 'Creating CareNest Account...' : 'Complete Registration'}
          </Button>
        </div>
      </form>

      {/* Reassurance Footer */}
      <div className="mt-6 text-center text-xs font-medium text-[#7A7D9D]">
        Already have a CareNest account?{' '}
        <Link
          to="/login"
          className="font-black text-[#7969B5] hover:text-[#6453A3] hover:underline"
        >
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;

