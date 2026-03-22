import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError('');
      setIsSubmitting(true);
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1ea] px-4 py-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">ManageX</p>
          <h1 className="font-instrument-serif mt-3 text-4xl text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Login to continue managing your workspace tasks.</p>

          {error ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            No account yet?{' '}
            <Link to="/register" className="font-medium text-slate-900 underline-offset-2 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
