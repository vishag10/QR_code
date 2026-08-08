import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import logo from '../assets/icon.png';
import logo2 from '../assets/logo.png';

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // Already authenticated → go straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        username: username.trim(),
        password,
      });
      const { token, username: adminName } = res.data;
      login(token, adminName);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animated-bg min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#080818]">
      {/* Hero Radial Glow Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] hero-glow-bg pointer-events-none" />

      {/* Blurred Gradient Orbs */}
      <div className="orb w-96 h-96 bg-[#2632F2] top-[-100px] right-[-80px]" />
      <div className="orb w-80 h-80 bg-[#A216CB] bottom-[-60px] left-[-50px]" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">

        {/* Header Branding */}
        <div className="flex flex-row items-center justify-center gap-3.5 sm:gap-6 mb-6 sm:mb-8 max-w-full overflow-hidden">
          <div className="h-14 sm:h-20 w-auto flex items-center justify-center shrink-0">
            <img src={logo} alt="Icon Logo" className="h-full w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(38,50,242,0.5)] scale-110 sm:scale-110" />
          </div>
          <div className="h-10 sm:h-14 w-px bg-[#FAF7FD]/25 shrink-0" />
          <div className="h-14 sm:h-20 w-auto max-w-[220px] sm:max-w-[320px] flex items-center justify-center shrink-0">
            <img src={logo2} alt="TradeEarn Logo" className="h-full w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(162,22,203,0.5)] scale-125 sm:scale-135" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#FAF7FD] tracking-tight">Admin Portal</h1>
          <p className="text-[#FAF7FD]/60 mt-1 text-sm">Exhibition QR System — Secure Access</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-7 rounded-3xl border border-[#FAF7FD]/12 shadow-[0_10px_50px_rgba(38,50,242,0.2)]">
          <h2 className="text-lg font-semibold text-[#FAF7FD] mb-6 flex items-center gap-2">
            <LockIcon className="text-[#3CD500]" />
            Sign In
          </h2>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-in flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="mb-4">
              <label htmlFor="admin-username" className="block text-sm font-medium text-white/60 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                  <UserIcon />
                </div>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  className="form-input pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-7">
              <label htmlFor="admin-password" className="block text-sm font-medium text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                  <LockIcon />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="form-input pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="admin-login-btn"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  <span>Signing in…</span>
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a href="/q/exhibition" className="text-[#FAF7FD]/40 text-xs hover:text-[#3CD500] transition-colors">
            ← Back to Visitor Registration
          </a>
        </div>
      </div>
    </div>
  );
}
