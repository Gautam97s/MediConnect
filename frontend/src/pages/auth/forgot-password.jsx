import Link from 'next/link';
import { useState } from 'react';
import AuthShell from '../../features/auth/components/AuthShell';
import { useAuth } from '../../features/auth/hooks/useAuth';

function getForgotPasswordErrorMessage(err) {
  const status = err?.response?.status;

  if (status >= 500) {
    return 'Server is temporarily unavailable. Please try again in a moment.';
  }

  return err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Could not process request. Please try again.';
}

export default function ForgotPasswordPage() {
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await forgotPassword({ email: email.trim() });
      setSuccess('If this email exists, reset instructions were sent.');
    } catch (err) {
      setError(getForgotPasswordErrorMessage(err));
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Recover your account securely"
      sideTitle="Reset In A Few Steps"
      sideText="Enter your account email to receive reset instructions."
      footer={<p>Back to <Link href="/auth/login" className="font-bold text-teal-700 hover:text-teal-800">Sign in</Link></p>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthShell>
  );
}
