import React, { useEffect, useState } from 'react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, durationMs = 1500 }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs - 300);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-slate-50 dark:bg-black text-zinc-900 dark:text-white transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer */}
      <div className="w-full h-8" />

      {/* Centered Brand Presentation */}
      <div className="flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-700">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl ig-gradient flex items-center justify-center text-white shadow-2xl ig-glow-lg">
            <InstagramIcon className="w-11 h-11" />
          </div>
          {/* Subtle glowing ring */}
          <div className="absolute -inset-1 rounded-3xl ig-gradient opacity-30 blur-md -z-10 animate-pulse" />
        </div>

        {/* Title strictly requested: IG Assistant */}
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mt-5">
          IG <span className="ig-gradient-text">Assistant</span>
        </h1>

        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1.5 tracking-wide">
          AI-Powered Social Media Assistant
        </p>

        {/* Animated Loading Bar */}
        <div className="w-24 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-6">
          <div className="w-full h-full ig-gradient rounded-full animate-pulse" />
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center pb-4">
        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-600">
          Official Meta API Integration
        </p>
      </div>
    </div>
  );
};

