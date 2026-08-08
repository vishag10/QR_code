import { useState } from 'react';
import api from '../api/axios.js';

// ── Icon components (inline SVG, zero extra dependencies) ──────────────────────
const CheckCircleIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ── Phone validation: 10-digit Indian mobile starting with 6-9 ─────────────────
function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

// ── Success Screen ─────────────────────────────────────────────────────────────
function SuccessScreen({ name, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in px-2">
      {/* Pulsing ring + check icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full animate-pulse-ring bg-green-500/20" />
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-xl shadow-green-900/30 animate-bounce-in">
          <CheckCircleIcon />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 animate-slide-up">
        Thank You, {name.split(' ')[0]}!
      </h2>

      <p className="text-white/70 text-base leading-relaxed mb-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        Your details have been successfully submitted.
      </p>
      <p className="text-white/50 text-sm mb-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        We look forward to connecting with you after the event.
      </p>

      {/* Decorative divider */}
      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent mb-8 animate-fade-in" />

      <div className="glass-card p-4 w-full text-left mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1 font-medium">Registered as</p>
        <p className="text-white font-semibold">{name}</p>
      </div>

      <button
        onClick={onReset}
        className="text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors underline underline-offset-2"
      >
        Submit another response
      </button>
    </div>
  );
}

// ── Main Form Component ────────────────────────────────────────────────────────
export default function ExhibitionForm() {
  const [fullName, setFullName]         = useState('');
  const [phoneNumber, setPhoneNumber]   = useState('');
  const [errors, setErrors]             = useState({});
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [serverError, setServerError]   = useState('');

  // ── Validate form fields ─────────────────────────────────────────────────────
  function validate() {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (!validatePhone(phoneNumber)) {
      newErrors.phoneNumber = 'Enter a valid 10-digit mobile number (starting with 6-9).';
    }
    return newErrors;
  }

  // ── Handle form submit ───────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      await api.post('/api/submissions', {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Something went wrong. Please check your connection and try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Field change handlers with real-time error clearing ─────────────────────
  function handleNameChange(e) {
    setFullName(e.target.value);
    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
  }

  function handlePhoneChange(e) {
    // Allow only digits
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(digits);
    if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
  }

  function handleReset() {
    setFullName('');
    setPhoneNumber('');
    setErrors({});
    setServerError('');
    setSubmitted(false);
  }

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="animated-bg min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb w-72 h-72 bg-brand-600 top-[-80px] left-[-60px]" />
      <div className="orb w-64 h-64 bg-purple-700 bottom-[-60px] right-[-40px]" />
      <div className="orb w-40 h-40 bg-indigo-500 top-[40%] right-[-20px]" />

      {/* Card container */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up">

        {/* Logo / Event branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-4 shadow-xl shadow-brand-900/40">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 18.75h.75v.75h-.75v-.75zM18.75 13.5h.75v.75h-.75v-.75zM18.75 18.75h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Exhibition 2024</h1>
          <p className="text-white/50 text-sm mt-1 text-center">
            Register your visit in seconds
          </p>
        </div>

        {/* Main card */}
        <div className="glass-card p-6">
          {submitted ? (
            <SuccessScreen name={fullName} onReset={handleReset} />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="text-lg font-semibold text-white mb-5">Visitor Registration</h2>

              {/* Server-level error banner */}
              {serverError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-in">
                  {serverError}
                </div>
              )}

              {/* Full Name Field */}
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium text-white/70 mb-1.5">
                  Full Name <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                    <UserIcon />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={handleNameChange}
                    className={`form-input pl-10 ${errors.fullName ? 'border-red-500/60 focus:ring-red-500' : ''}`}
                    disabled={submitting}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-400 animate-fade-in">{errors.fullName}</p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-white/70 mb-1.5">
                  Phone Number <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                    <PhoneIcon />
                  </div>
                  {/* Country code badge */}
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium pr-2 border-r border-white/10">
                    +91
                  </span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    className={`form-input pl-24 ${errors.phoneNumber ? 'border-red-500/60 focus:ring-red-500' : ''}`}
                    disabled={submitting}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1.5 text-xs text-red-400 animate-fade-in">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-btn"
                disabled={submitting}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <SpinnerIcon />
                    <span>Submitting…</span>
                  </>
                ) : (
                  'Register My Visit'
                )}
              </button>

              <p className="text-center text-white/30 text-xs mt-4 leading-relaxed">
                Your information is collected for event records only
                and will not be shared with third parties.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6">
          Powered by Exhibition QR System
        </p>
      </div>
    </div>
  );
}
