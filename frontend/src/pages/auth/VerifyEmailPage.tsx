import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleVerify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing or invalid verification token.');
        return;
      }

      const res = await verifyEmail({ token });
      if (res.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage(res.error || 'Verification failed. The link may have expired.');
      }
    };

    handleVerify();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden text-zinc-900 dark:text-white transition-colors font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        <div className="w-12 h-12 rounded-2xl ig-gradient flex items-center justify-center text-white shadow-md mx-auto mb-4">
          <InstagramIcon className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-black mb-2">Email Verification</h1>

        {status === 'verifying' && (
          <div className="py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#fb2175] animate-spin" />
            <p className="text-xs text-zinc-500">Verifying your account credentials...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-6">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="w-full py-2.5 px-4 rounded-xl ig-gradient text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-6">{message}</p>
            <Link
              to="/auth/login"
              className="inline-block text-xs font-semibold text-[#fb2175] hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

