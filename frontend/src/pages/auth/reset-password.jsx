import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import AuthShell from '../../features/auth/components/AuthShell';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = typeof router.query.token === 'string' ? router.query.token : '';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing in URL.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({ token, password });
      setSuccess('Password updated. Redirecting to sign in...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Reset failed.');
    }
  };

  return (
    <AuthShell
      title="Set New Password"
      subtitle="Choose a strong password"
      sideTitle="Your Account, Re-secured"
      sideText="Use a password you do not reuse elsewhere for better security."
      footer={<p>Back to <Link href="/auth/login" className="font-bold text-teal-700 hover:text-teal-800">Sign in</Link></p>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">New password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Confirm new password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
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
          className="w-full rounded-xl bg-stone-900 px-4 py-3 font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthShell>
  );
}
