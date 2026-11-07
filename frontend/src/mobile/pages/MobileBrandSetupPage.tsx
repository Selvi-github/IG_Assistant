import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import {
  Upload,
  ArrowRight,
  User,
  Building2,
  FileText,
  AtSign,
  Users,
  Image,
  X,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

interface MobileBrandSetupPageProps {
  onComplete?: () => void;
}

export const MobileBrandSetupPage: React.FC<MobileBrandSetupPageProps> = ({ onComplete }) => {
  const { brandKit, saveBrandProfile, connectAccount, addToast } = useApp();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [creatorName, setCreatorName] = useState(user?.fullName || '');
  const [companyName, setCompanyName] = useState(brandKit.brandName || user?.brandName || '');
  const [instaHandle, setInstaHandle] = useState(brandKit.handle || user?.instagramHandle || '');
  const [productDescription, setProductDescription] = useState(brandKit.description || '');
  const [targetAudience, setTargetAudience] = useState(brandKit.targetAudience || 'Followers & Customers');
  const [customLogo, setCustomLogo] = useState<string | null>(brandKit.logoUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute first letter fallback
  const firstLetter = (companyName.trim() || creatorName.trim() || user?.fullName || 'C')[0].toUpperCase();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        if (!rawUrl) return;

        // Downscale image to a crisp 256x256 avatar using HTML5 Canvas
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.85);
            setCustomLogo(optimized);
            addToast('Brand logo uploaded and optimized.', 'success');
          }
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndGoHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      addToast('Please enter your company or brand name', 'warning');
      return;
    }
    if (!instaHandle.trim()) {
      addToast('Please enter your Instagram Account or ID', 'warning');
      return;
    }

    setIsSubmitting(true);

    const rawHandle = instaHandle.trim().replace(/^@+/, '');
    const formatted = rawHandle ? `@${rawHandle}` : '@creator';

    // 1. Save in SQLite brand_profiles datatable via backend API
    const res = await saveBrandProfile({
      companyName: companyName.trim(),
      instagramHandle: formatted,
      bio: productDescription.trim() || 'AI Social Media Content Studio',
      targetAudience: targetAudience.trim(),
      logoUrl: customLogo,
    });

    if (!res.success) {
      addToast(res.error || 'Failed to save brand profile', 'error');
      setIsSubmitting(false);
      return;
    }

    // 2. Update Auth user profile
    await updateProfile({
      fullName: creatorName.trim() || user?.fullName || 'Creator',
      brandName: companyName.trim(),
      instagramHandle: formatted,
      avatarUrl: customLogo || undefined,
    });

    // 3. Connect Instagram account state
    connectAccount('instagram', {
      username: rawHandle || 'creator',
      accountName: companyName.trim(),
      avatarUrl: customLogo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      followersCount: 0,
    });

    localStorage.setItem('ig_assistant_onboarded', 'true');
    setIsSubmitting(false);

    if (onComplete) {
      onComplete();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto animate-in fade-in duration-300">
      <div className="text-center pb-1">
        <h2 className="text-base font-black text-zinc-900 dark:text-white">
          Brand & Company Setup
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Fill in your details to set up your personal studio
        </p>
      </div>

      <form onSubmit={handleSaveAndGoHome} className="space-y-3.5">
        {/* Brand Logo Upload & First Letter Fallback */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-center">
          <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2.5">
            Brand Logo
          </label>

          <div className="flex flex-col items-center justify-center gap-3">
            {/* Visual Logo Preview */}
            <div className="relative group">
              {customLogo ? (
                <div className="relative">
                  <img
                    src={customLogo}
                    alt="Brand logo"
                    className="w-18 h-18 rounded-full object-cover border-3 border-pink-400 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomLogo(null)}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-500 text-white shadow hover:bg-rose-600 transition-colors"
                    title="Remove custom logo (use first letter)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-18 h-18 rounded-full ig-gradient flex items-center justify-center text-white text-3xl font-black shadow-md border-3 border-white dark:border-zinc-900">
                  {firstLetter}
                </div>
              )}
            </div>

            <p className="text-[11px] text-zinc-500">
              {customLogo
                ? 'Custom logo uploaded'
                : `No logo uploaded yet. First letter "${firstLetter}" will be used automatically.`}
            </p>

            {/* Upload Button */}
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-dashed border-pink-400 hover:border-[#fb2175] bg-pink-50/50 dark:bg-pink-950/20 text-[#fb2175] text-xs font-bold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{customLogo ? 'Change Logo Image' : 'Upload Brand Logo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Creator Name */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10">
          <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            Creator Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#fb2175] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-pink-400 focus:border-[#fb2175] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Company / Brand Name */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10">
          <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            Company / Brand Name
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-[#fb2175] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Aura Studio, Vance Apparel"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-pink-400 focus:border-[#fb2175] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Instagram Account or ID */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10">
          <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            Instagram Account or ID
          </label>
          <div className="relative">
            <InstagramIcon className="w-4 h-4 text-[#fb2175] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={instaHandle}
              onChange={(e) => setInstaHandle(e.target.value)}
              placeholder="@aurastudio.ai"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-pink-400 focus:border-[#fb2175] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Brand Bio / Product Description */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10">
          <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            Brand Bio & Products
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-[#fb2175] absolute left-3 top-2.5" />
            <textarea
              rows={2}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="What does your company or brand do?"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-pink-400 focus:border-[#fb2175] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-zinc-900 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Target Audience */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10">
          <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            Target Audience
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-[#fb2175] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Gen-Z, Small business owners, Designers"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-pink-400 focus:border-[#fb2175] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Save & Continue Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl ig-gradient text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {isSubmitting ? (
            <span>Saving Brand Details...</span>
          ) : (
            <>
              <span>Save & Open Studio</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
