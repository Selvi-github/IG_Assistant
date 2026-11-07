import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import {
  Camera,
  Check,
  ArrowRight,
  ShieldCheck,
  Target,
  FileText,
  Calendar,
  X,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

interface BrandOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=200&q=80',
];

export const BrandOnboardingModal: React.FC<BrandOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { brandKit, updateBrandKit, addToast } = useApp();
  const { user, updateProfile } = useAuth();

  const [brandName, setBrandName] = useState(brandKit.brandName || user?.brandName || '');
  const [handle, setHandle] = useState(brandKit.handle || user?.instagramHandle || '@');
  const [description, setDescription] = useState(brandKit.description || '');
  const [targetAudience, setTargetAudience] = useState(brandKit.targetAudience || 'Creators & Brand Followers');
  const [selectedLogo, setSelectedLogo] = useState(brandKit.logoUrl || PRESET_LOGOS[0]);
  const [dailyGoal, setDailyGoal] = useState('1 Reel + 1 Carousel / day');
  const [tone, setTone] = useState(brandKit.toneOfVoice || 'Inspirational & Professional');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;

    updateBrandKit({
      brandName,
      handle: formattedHandle,
      description,
      targetAudience,
      logoUrl: selectedLogo,
      toneOfVoice: tone,
    });

    updateProfile({
      brandName,
      instagramHandle: formattedHandle,
      avatarUrl: selectedLogo,
    });

    addToast('Brand profile configured. Ready for daily automated posting.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl z-10 text-zinc-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl ig-gradient flex items-center justify-center text-white shadow-md ig-glow-sm">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                Set Up Your Brand Profile
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Provide your details once so the studio can craft your daily social posts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Select or Upload Brand Avatar
            </label>
            <div className="flex items-center gap-3">
              <div className="ig-ring">
                <img
                  src={selectedLogo}
                  alt="Selected avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-black"
                />
              </div>
              <div className="flex items-center gap-2">
                {PRESET_LOGOS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedLogo(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform cursor-pointer ${
                      selectedLogo === url ? 'border-rose-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Brand / Creator Name
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Aura Studio"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@aurastudio.ai"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              What does your brand do? (Niche & Context)
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Modern lifestyle and design studio sharing productivity hacks and aesthetic visuals."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors leading-relaxed"
            />
          </div>

          {/* Target Audience & Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Founders, Creators & Designers"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Content Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
              >
                <option>Inspirational & Professional</option>
                <option>High Energy & Dynamic</option>
                <option>Witty & Engaging</option>
                <option>Aesthetic & Minimalist</option>
                <option>Direct & Educational</option>
              </select>
            </div>
          </div>

          {/* Daily Posting Schedule Preference */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Daily Automation Goal
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                '1 Reel / day',
                '1 Carousel / day',
                '1 Reel + 1 Carousel / day',
                'Custom on Demand',
              ].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setDailyGoal(goal)}
                  className={`p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                    dailyGoal === goal
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                      : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl ig-gradient text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Save Profile & Start Creating</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
