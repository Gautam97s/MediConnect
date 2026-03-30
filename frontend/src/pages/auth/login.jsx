import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { HeartPulse, Stethoscope } from 'lucide-react';
import AuthShell from '../../features/auth/components/AuthShell';
import { useAuth } from '../../features/auth/hooks/useAuth';

function roleLanding(role) {
  return role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, isAuthenticated, isAuthReady, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) {
      return;
    }

    const destination = nextPath || roleLanding(user?.role);
    router.replace(destination);
  }, [isAuthReady, isAuthenticated, user, nextPath, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login({ email: email.trim(), password, role });
      const destination = nextPath || roleLanding(user?.role);
      await router.push(destination);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <AuthShell
      title="Sign In"
      subtitle="Access your secure healthcare workspace"
      sideTitle="Fast. Secure. Calm."
      sideText="Sign in to manage appointments, prescriptions, messages, and records in one place."
      footer={
        <p>
          New here? <Link href="/auth/signup" className="font-bold text-teal-700 hover:text-teal-800">Create an account</Link>
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
          <label className="mb-2 block text-sm font-semibold text-stone-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
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
    </AuthShell>
  );
}
