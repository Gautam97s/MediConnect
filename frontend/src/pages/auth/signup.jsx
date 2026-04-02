import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { HeartPulse, Stethoscope } from 'lucide-react';
import AuthShell from '../../features/auth/components/AuthShell';
import { useAuth } from '../../features/auth/hooks/useAuth';

function getSignupErrorMessage(err) {
  const status = err?.response?.status;
  const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || '';

  if (status === 409) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  return message || 'Registration failed.';
}

export default function SignupPage() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roleOptions = [
    {
      key: 'PATIENT',
      label: 'Patient',
      description: 'Book visits, records and pharmacy access',
      icon: HeartPulse,
      activeClass: 'border-sky-300 bg-sky-50 text-sky-900 shadow-[0_8px_20px_rgba(14,165,233,0.12)]',
      iconClass: 'bg-sky-100 text-sky-700 border-sky-200'
    },
    {
      key: 'DOCTOR',
      label: 'Doctor',
      description: 'Manage schedule, patients and consultations',
      icon: Stethoscope,
      activeClass: 'border-teal-300 bg-teal-50 text-teal-900 shadow-[0_8px_20px_rgba(13,148,136,0.12)]',
      iconClass: 'bg-teal-100 text-teal-700 border-teal-200'
    }
  ];

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'DOCTOR' && !licenseNumber.trim()) {
      setError('Doctor license number is required.');
      return;
    }

    try {
      const data = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        licenseNumber: role === 'DOCTOR' ? licenseNumber.trim() : ''
      });

      if (data?.token || data?.accessToken || data?.jwt || data?.data?.token) {
        await router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
        return;
      }

      setSuccess('Account created. Please sign in.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1000);
    } catch (err) {
      setError(getSignupErrorMessage(err));
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Start your MediConnect journey"
      sideTitle="Built For Patients And Doctors"
      sideText="Choose your role and set up your secure account in less than a minute."
      accent="indigo"
      footer={
        <p>
          Already have an account? <Link href="/auth/login" className="font-bold text-indigo-700 hover:text-indigo-800">Sign in</Link>
        </p>
      }
    >
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
                onClick={() => setRole(item.key)}
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
          <label className="mb-2 block text-sm font-semibold text-stone-700">Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="you@example.com"
          />
        </div>

        {role === 'DOCTOR' ? (
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Medical license number</label>
            <input
              type="text"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Enter your license number"
            />
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Confirm password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="Re-enter password"
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>
        ) : null}

        {success ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{success}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthShell>
  );
}
