import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

interface MobileAuthPageProps {
  onSuccess: () => void;
}

export const MobileAuthPage: React.FC<MobileAuthPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify' | 'forgot'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('971321');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    loginWithGoogle,
    isLoading,
  } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'verify') {
      if (!otp || otp.trim().length < 6) {
        setErrorMessage('Please enter the 6-digit verification code sent to your email.');
        return;
      }
      const res = await verifyEmail({ email, otp });
      if (res.success) {
        setSuccessMessage('Email verified successfully! Signing you in...');
        setTimeout(() => {
          login(email, password).then((loginRes) => {
            if (loginRes.success) {
              onSuccess();
            } else {
              setMode('signin');
            }
          });
        }, 800);
      } else {
        setErrorMessage(res.error || 'Invalid verification code.');
      }
      return;
    }

    if (mode === 'forgot') {
      if (!email) {
        setErrorMessage('Please enter your email address.');
        return;
      }
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccessMessage(res.message || 'Password reset instructions have been sent to your email.');
      } else {
        setErrorMessage(res.error || 'Failed to request password reset.');
      }
      return;
    }

    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (mode === 'signup') {
      if (!fullName) {
        setErrorMessage('Please enter your name');
        return;
      }
      const res = await register(email, password, fullName);
      if (res.success) {
        if (res.requiresVerification) {
          setSuccessMessage('Account created! Please enter the 6-digit code sent to your email.');
          // Auto-fill OTP in development if provided
          if (res.devVerification?.otp) {
            setDevOtp(res.devVerification.otp);
            setOtp(res.devVerification.otp);
          }
          setMode('verify');
        } else {
          onSuccess();
        }
      } else {
        setErrorMessage(res.error || 'Registration failed');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        onSuccess();
      } else {
        if (res.unverified) {
          setErrorMessage('Your email is not verified yet. Please enter the verification code.');
          setMode('verify');
        } else {
          setErrorMessage(res.error || 'Sign in failed. Please check credentials.');
        }
      }
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
      setSuccessMessage('A fresh verification code has been dispatched to your email.');
    } else {
      setErrorMessage(res.error || 'Could not resend code.');
    }
  };

  const handleGoogle = async () => {
    setErrorMessage('');
    const res = await loginWithGoogle();
    if (!res.success) {
      setErrorMessage(res.error || 'Google Sign-In failed');
    }
  };

  return (
    /* Clean Pure White Background for this page as requested */
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white selection:bg-[#fb2175] selection:text-white px-5 py-6 font-sans">
      <div className="max-w-sm mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Top Header: Instagram Gradient Logo & Visible Dark Title */}
        <div className="flex flex-col items-center justify-center text-center mb-5 shrink-0">
          {/* Logo with sampled Instagram Gradient colors */}
          <div className="w-14 h-14 rounded-2xl ig-gradient flex items-center justify-center p-2.5 shadow-lg relative mb-2 group">
            <InstagramIcon className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
            IG Assistant
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
            {mode === 'signin' && 'Sign In to IG Assistant'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'verify' && 'Verify Your Email'}
            {mode === 'forgot' && 'Reset Your Password'}
          </p>
        </div>

        {/* Sign In / Sign Up Form Card */}
        <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-white/10 p-5 shadow-xs">
          {/* Mode Switcher Tabs (Only when in signin or signup mode) */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl mb-3.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white border-2 border-pink-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white border-2 border-pink-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Inputs with Pink Border for crisp visibility */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-zinc-900 dark:text-white mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#fb2175] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Vance"
                    className="w-full bg-white dark:bg-zinc-950 border-2 border-pink-400 focus:border-[#fb2175] focus:ring-2 focus:ring-pink-200/50 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                  />
                </div>
              </div>
            )}

            {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
              <div>
                <label className="block text-xs font-bold text-zinc-900 dark:text-white mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#fb2175] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@brand.com"
                    className="w-full bg-white dark:bg-zinc-950 border-2 border-pink-400 focus:border-[#fb2175] focus:ring-2 focus:ring-pink-200/50 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                  />
                </div>
              </div>
            )}

            {(mode === 'signin' || mode === 'signup') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-[11px] font-semibold text-[#fb2175] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#fb2175] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-white dark:bg-zinc-950 border-2 border-pink-400 focus:border-[#fb2175] focus:ring-2 focus:ring-pink-200/50 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium transition-all"
                  />
                </div>
              </div>
            )}

            {mode === 'verify' && (
              <div>
                {/* Visual OTP banner for instant local testing */}
                {devOtp && (
                  <div className="mb-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-850 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 block tracking-wider">
                        Your Verification Code
                      </span>
                      <span className="font-mono text-base font-black text-zinc-900 dark:text-white tracking-widest">
                        {devOtp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtp(devOtp)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-pink-300 dark:border-pink-700 text-[#fb2175] font-bold text-[11px] shadow-2xs hover:bg-pink-50 cursor-pointer"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                  We sent a 6-digit confirmation code to{' '}
                  <span className="font-bold text-zinc-900 dark:text-white">{email}</span>.
                </p>
                <label className="block text-xs font-bold text-zinc-900 dark:text-white mb-1">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#fb2175] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full tracking-widest text-center bg-white dark:bg-zinc-950 border-2 border-pink-400 focus:border-[#fb2175] focus:ring-2 focus:ring-pink-200/50 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 transition-all"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[11px] font-semibold text-[#fb2175] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    Back to Log In
                  </button>
                </div>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Back to Log In
                </button>
              </div>
            )}

            {/* Submit Button (Gradient button preserved as requested) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl ig-gradient text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Log In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'verify' && 'Verify & Continue'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Alternatives (Only on signin/signup) */}
          {(mode === 'signin' || mode === 'signup') && (
            <>
              <div className="my-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Or</span>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
              </div>

              {/* Full-Width Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-300 dark:border-white/15 text-zinc-800 dark:text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
