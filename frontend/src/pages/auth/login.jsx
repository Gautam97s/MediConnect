import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HeartPulse, KeyRound, ShieldCheck, Stethoscope } from 'lucide-react';
import AuthShell from '../../features/auth/components/AuthShell';
import { useAuth } from '../../features/auth/hooks/useAuth';

function roleLanding(role) {
  return role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard';
}

function normalizeRole(value) {
  const role = (value || '').toString().trim().toUpperCase();
  if (role === 'DOCTOR') return 'DOCTOR';
  if (role === 'PATIENT') return 'PATIENT';
  return '';
}

function getLoginErrorMessage(err) {
  const status = err?.response?.status;
  const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || '';

  if (status === 401) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (status === 403) {
    return message || 'Selected role does not match your account.';
  }

  if (status === 400) {
    return message || 'OTP is invalid or expired. Please try again.';
  }

  if (status >= 500) {
    return 'Server is temporarily unavailable. Please try again in a moment.';
  }

  return message || 'Login failed. Please check credentials.';
}

export default function LoginPage() {
  const router = useRouter();
  const { login, verify2fa, loading, isAuthenticated, isAuthReady, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [error, setError] = useState('');
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  const roleOptions = [
    {
      key: 'PATIENT',
      label: 'Patient',
      description: 'Appointments, records, pharmacy and payments',
      icon: HeartPulse,
      activeClass: 'border-sky-300 bg-sky-50 text-sky-900 shadow-[0_8px_20px_rgba(14,165,233,0.12)]',
      iconClass: 'bg-sky-100 text-sky-700 border-sky-200'
    },
    {
      key: 'DOCTOR',
      label: 'Doctor',
      description: 'Schedule, patients, prescriptions and messages',
      icon: Stethoscope,
      activeClass: 'border-teal-300 bg-teal-50 text-teal-900 shadow-[0_8px_20px_rgba(13,148,136,0.12)]',
      iconClass: 'bg-teal-100 text-teal-700 border-teal-200'
    }
  ];

  const nextPath = useMemo(() => {
    const candidate = router.query.next;
    return typeof candidate === 'string' ? candidate : '';
  }, [router.query.next]);

  const requestedRole = useMemo(() => normalizeRole(router.query.role), [router.query.role]);

  useEffect(() => {
    if (!requestedRole) {
      return;
    }

    setRole(requestedRole);
  }, [requestedRole]);

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) {
      return;
    }

    if (requestedRole && user?.role && requestedRole !== user.role) {
      return;
    }

    const destination = nextPath || roleLanding(user?.role);
    router.replace(destination);
  }, [isAuthReady, isAuthenticated, user, nextPath, requestedRole, router]);

  useEffect(() => {
    if (!twoFactorChallenge) {
      return;
    }

    window.setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 0);
  }, [twoFactorChallenge]);

  const resetTwoFactorStep = () => {
    setTwoFactorChallenge(null);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login({ email: email.trim(), password, role });

      if (result?.requires2fa) {
        setTwoFactorChallenge({
          userId: result.userId,
          twoFactorToken: result.twoFactorToken,
          role
        });
        setOtpDigits(['', '', '', '', '', '']);
        setPassword('');
        return;
      }

      const user = result;
      const destination = nextPath || roleLanding(user?.role);
      await router.push(destination);
    } catch (err) {
      setError(getLoginErrorMessage(err));
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP to continue.');
      return;
    }

    try {
      const verifiedUser = await verify2fa({
        userId: twoFactorChallenge?.userId,
        twoFactorToken: twoFactorChallenge?.twoFactorToken,
        otp,
        role: twoFactorChallenge?.role || role
      });
      const destination = nextPath || roleLanding(verifiedUser?.role);
      await router.push(destination);
    } catch (err) {
      setError(getLoginErrorMessage(err));
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);
    setError('');

    if (digit && index < otpInputRefs.current.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== 'Backspace' || otpDigits[index]) {
      return;
    }

    if (index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    const pastedValue = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedValue) {
      return;
    }

    event.preventDefault();
    const filledDigits = Array.from({ length: 6 }, (_, index) => pastedValue[index] || '');
    setOtpDigits(filledDigits);
    otpInputRefs.current[Math.min(pastedValue.length, 6) - 1]?.focus();
    setError('');
  };

  const isOtpStep = Boolean(twoFactorChallenge);

  return (
    <AuthShell
      title={isOtpStep ? 'Verify OTP' : 'Sign In'}
      subtitle={isOtpStep ? 'Enter the 6-digit code from the login response' : 'Access your secure healthcare workspace'}
      sideTitle="Fast. Secure. Calm."
      sideText="Sign in to manage appointments, prescriptions, messages, and records in one place."
      footer={
        <p>
          New here? <Link href="/auth/signup" className="font-bold text-teal-700 hover:text-teal-800">Create an account</Link>
        </p>
      }
    >
      {!isOtpStep ? (
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Role</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {roleOptions.map((item) => {
              const Icon = item.icon;
              const selected = role === item.key;

              return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setRole(item.key);
                  resetTwoFactorStep();
                }}
                className={`rounded-2xl border px-4 py-3 text-left transition-all ${selected ? item.activeClass : 'border-stone-200 bg-white text-stone-600 hover:border-cyan-300 hover:bg-cyan-50/60'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 grid h-9 w-9 place-items-center rounded-xl border ${selected ? item.iconClass : 'border-stone-200 bg-stone-100 text-stone-500'}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold tracking-wide">{item.label}</p>
                    <p className="mt-1 text-xs font-medium opacity-90">{item.description}</p>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              resetTwoFactorStep();
            }}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link href="/auth/forgot-password" className="font-semibold text-stone-600 hover:text-stone-900">Forgot password?</Link>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-stone-900 px-4 py-3 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      ) : (
      <form onSubmit={onVerifyOtp} className="space-y-5">
        <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-sky-50 p-5 shadow-[0_18px_45px_rgba(15,118,110,0.08)]">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-teal-200 bg-white text-teal-700 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-stone-900">Second step required</p>
              <p className="mt-1 text-sm font-medium leading-6 text-stone-500">
                We generated a short-lived OTP for {email.trim() || 'this account'}. Use the code visible in the login response Network tab.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
            <KeyRound size={16} className="text-teal-700" />
            6-digit OTP
          </label>
          <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={`otp-${index}`}
                ref={(node) => {
                  otpInputRefs.current[index] = node;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                className="h-14 rounded-2xl border border-stone-200 bg-white text-center text-xl font-extrabold text-stone-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>
          <p className="mt-3 text-xs font-medium text-stone-500">
            This code expires in 5 minutes. If it expires, go back and sign in again.
          </p>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[0.7fr_1fr]">
          <button
            type="button"
            onClick={() => {
              resetTwoFactorStep();
              setPassword('');
            }}
            className="rounded-xl border border-stone-200 bg-white px-4 py-3 font-bold text-stone-600 transition hover:bg-stone-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-stone-900 px-4 py-3 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      </form>
      )}
    </AuthShell>
  );
}
