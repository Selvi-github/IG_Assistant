import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  User,
  Building2,
  AtSign,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('971321');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, verifyEmail, resendVerification, login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !fullName) {
      setErrorMessage('Please fill in your name and email address');
      return;
    }

    const res = await register(
      email,
      password,
      fullName,
      brandName || 'My Creator Studio',
      instagramHandle ? (instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`) : '@creator'
    );

    if (res.success) {
      if (res.requiresVerification) {
        setSuccessMessage('Account registered! Please enter the 6-digit confirmation code sent to your email.');
        if (res.devVerification?.otp) {
          setDevOtp(res.devVerification.otp);
          setOtp(res.devVerification.otp);
        }
        setStep('verify');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMessage(res.error || 'Registration failed');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp || otp.trim().length < 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    const res = await verifyEmail({ email, otp });
    if (res.success) {
      setSuccessMessage('Email verified successfully! Logging you in...');
      const loginRes = await login(email, password);
      if (loginRes.success) {
        navigate('/dashboard');
      } else {
        navigate('/auth/login');
      }
    } else {
      setErrorMessage(res.error || 'Invalid verification code.');
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const res = await resendVerification(email);
    if (res.success) {
      if (res.devVerification?.otp) {
        setDevOtp(res.devVerification.otp);
        setOtp(res.devVerification.otp);
      }
      setSuccessMessage('A fresh verification code has been dispatched.');
    } else {
      setErrorMessage(res.error || 'Could not resend verification code.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden text-zinc-900 dark:text-white transition-colors font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl ig-gradient flex items-center justify-center text-white shadow-md mb-3">
            <InstagramIcon className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
            {step === 'form' ? 'Create Your IG Assistant Account' : 'Verify Your Email'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {step === 'form'
              ? 'Start generating AI Reels & Carousels for Instagram'
              : `Enter the 6-digit confirmation code dispatched to ${email}`}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Vance"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#fb2175] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@brand.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#fb2175] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Brand Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Vance Visuals"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#fb2175] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Instagram Handle
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@vancevisuals"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#fb2175] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars, 1 uppercase & 1 number/symbol"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#fb2175] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl ig-gradient text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            {devOtp && (
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-850 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 block tracking-wider">
                    Your Verification Code
                  </span>
                  <span className="font-mono text-base font-black text-zinc-900 dark:text-white tracking-widest">
                    {devOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 font-bold text-[11px] shadow-2xs hover:bg-violet-50 cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#fb2175] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full tracking-widest text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-base font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#fb2175] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-[#fb2175] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend Code</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMessage('');
                }}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
              >
                Back to Registration
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl ig-gradient text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <span>Verifying...</span> : <span>Verify & Continue</span>}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-5">
          Already registered?{' '}
          <Link to="/auth/login" className="text-[#fb2175] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
