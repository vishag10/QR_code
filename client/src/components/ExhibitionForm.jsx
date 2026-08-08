import { useState } from 'react';
import api from '../api/axios.js';
import logo from '../assets/icon.png';
import logo2 from '../assets/logo.png';

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

const ShieldIcon = () => (
  <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
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
      {/* Pulsing ring + check icon in TradEarn Lime Green & Gradient */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full animate-pulse-ring bg-[#3CD500]/20" />
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[linear-gradient(135deg,#2632F2_0%,#5D25E1_40%,#3CD500_100%)] text-[#FAF7FD] shadow-xl shadow-[#3CD500]/25 animate-bounce-in">
          <CheckCircleIcon />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[#FAF7FD] mb-2 animate-slide-up">
        Thank You, {name.split(' ')[0]}!
      </h2>

      <p className="text-[#FAF7FD]/70 text-base leading-relaxed mb-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        Your details have been successfully submitted.
      </p>
      <p className="text-[#FAF7FD]/50 text-sm mb-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        We look forward to connecting with you after the event.
      </p>

      {/* Decorative divider */}
      <div className="w-20 h-0.5 bg-[linear-gradient(90deg,transparent_0%,#3CD500_50%,transparent_100%)] mb-8 animate-fade-in" />

      <div className="glass-card p-4 w-full text-left mb-8 animate-slide-up border border-[#5D25E1]/30" style={{ animationDelay: '0.2s' }}>
        <p className="text-xs text-[#3CD500] uppercase tracking-widest mb-1 font-semibold">Registered as</p>
        <p className="text-[#FAF7FD] font-semibold text-lg">{name}</p>
      </div>

      <button
        onClick={onReset}
        className="text-[#3CD500] text-sm font-semibold hover:underline underline-offset-4 transition-all"
      >
        Submit another response
      </button>
    </div>
  );
}

// ── Main Form Component ────────────────────────────────────────────────────────
export default function ExhibitionForm() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

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
    <div className="animated-bg min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden bg-[#080818]">
      {/* Hero Radial Glow Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] hero-glow-bg pointer-events-none" />

      {/* Blurred Gradient Orbs for Depth */}
      <div className="orb w-96 h-96 bg-[#2632F2] top-[-100px] left-[-80px]" />
      <div className="orb w-80 h-80 bg-[#A216CB] bottom-[-80px] right-[-60px]" />
      <div className="orb w-56 h-56 bg-[#DC08B9] top-[35%] right-[-30px]" />

      {/* Card container */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up">

        {/* Logo / Event branding */}
        <div className="flex flex-row items-center justify-center gap-3.5 sm:gap-6 mb-6 sm:mb-8 max-w-full overflow-hidden">
          <div className="h-14 sm:h-20 w-auto flex items-center justify-center shrink-0">
            <img src={logo} alt="Icon Logo" className="h-full w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(38,50,242,0.5)] scale-110 sm:scale-110" />
          </div>
          <div className="h-10 sm:h-14 w-px bg-[#FAF7FD]/25 shrink-0" />
          <div className="h-14 sm:h-20 w-auto max-w-[220px] sm:max-w-[320px] flex items-center justify-center shrink-0">
            <img src={logo2} alt="TradeEarn Logo" className="h-full w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(162,22,203,0.5)] scale-125 sm:scale-135" />
          </div>
        </div>

        {/* Main Glassmorphism Card */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl border border-[#FAF7FD]/12 shadow-[0_10px_50px_rgba(38,50,242,0.2)] relative overflow-hidden">
          {submitted ? (
            <SuccessScreen name={fullName} onReset={handleReset} />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Circular User Avatar Badge with Lime Green Accent */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#15103D]/80 border border-[#3CD500]/40 flex items-center justify-center text-[#3CD500] shadow-[0_0_25px_rgba(60,213,0,0.2)]">
                  <UserIcon />
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl font-bold text-[#FAF7FD] text-center tracking-tight mb-1">
                Registration
              </h2>
              <p className="text-[#FAF7FD]/70 text-sm text-center mb-6">
                Let's get you registered for the event
              </p>

              {/* Server-level error banner */}
              {serverError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-in">
                  {serverError}
                </div>
              )}

              {/* Full Name Field */}
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium text-[#FAF7FD]/80 mb-1.5">
                  Full Name <span className="text-[#3CD500] font-bold">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF7FD]/40">
                    <UserIcon />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={handleNameChange}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#080818]/60 border ${errors.fullName ? 'border-red-500/60 focus:ring-red-500' : 'border-[#5D25E1]/40 focus:border-[#3CD500] focus:ring-[#3CD500]/30'
                      } text-[#FAF7FD] placeholder-[#FAF7FD]/35 text-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                    disabled={submitting}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-400 animate-fade-in">{errors.fullName}</p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#FAF7FD]/80 mb-1.5">
                  Phone Number <span className="text-[#3CD500] font-bold">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF7FD]/40">
                    <PhoneIcon />
                  </div>
                  {/* Country code badge */}
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[#FAF7FD]/70 text-sm font-medium pr-3 border-r border-[#FAF7FD]/10">
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
                    className={`w-full pl-24 pr-4 py-3.5 rounded-xl bg-[#080818]/60 border ${errors.phoneNumber ? 'border-red-500/60 focus:ring-red-500' : 'border-[#5D25E1]/40 focus:border-[#3CD500] focus:ring-[#3CD500]/30'
                      } text-[#FAF7FD] placeholder-[#FAF7FD]/35 text-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                    disabled={submitting}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1.5 text-xs text-red-400 animate-fade-in">{errors.phoneNumber}</p>
                )}
              </div>

              {/* TradEarn Gradient Primary Button */}
              <button
                type="submit"
                id="submit-btn"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-[#FAF7FD] text-base bg-[linear-gradient(135deg,#2632F2_0%,#5D25E1_40%,#A216CB_70%,#DC08B9_100%)] hover:shadow-[0_0_35px_rgba(220,8,185,0.45)] hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#2632F2]/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <SpinnerIcon />
                    <span>Submitting…</span>
                  </>
                ) : (
                  <>
                    <span>Register My Visit</span>
                    <svg className="w-5 h-5 text-[#FAF7FD]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>

              {/* Security Banner with Lines & Lime Shield */}
              <div className="flex items-center justify-center gap-3 mt-6 pt-2">
                <div className="h-px bg-[#FAF7FD]/10 flex-1" />
                <div className="flex items-center gap-1.5 shrink-0">
                  <ShieldIcon />
                  <span className="text-[#FAF7FD]/60 text-xs font-medium">Your data is safe and secure</span>
                </div>
                <div className="h-px bg-[#FAF7FD]/10 flex-1" />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[#FAF7FD]/50 text-xs mt-6 font-normal">
          Powered by <span className="text-[#3CD500] font-semibold">TradeEarn</span>
        </p>
      </div>
    </div>
  );
}
