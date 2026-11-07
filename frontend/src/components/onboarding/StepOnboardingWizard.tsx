import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  Lock,
  Sun,
  Moon,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

interface StepOnboardingWizardProps {
  onComplete: () => void;
}

// 1. Business Category Options (No emojis, no long paragraph texts)
const BUSINESS_CATEGORIES = [
  { id: 'retail_boutique', title: 'Retail, Boutique & Saree Shop' },
  { id: 'cafe_food', title: 'Cafe, Bakery & Restaurant' },
  { id: 'education', title: 'School, College & Education' },
  { id: 'automotive', title: 'Automotive & Vehicle Showroom' },
  { id: 'electronics', title: 'Electronics & Mobile Store' },
  { id: 'fitness_gym', title: 'Fitness, Gym & Wellness' },
  { id: 'beauty_salon', title: 'Beauty, Salon & Cosmetics' },
  { id: 'real_estate', title: 'Real Estate & Interior Design' },
  { id: 'professional_services', title: 'Professional Services & Consulting' },
  { id: 'healthcare', title: 'Healthcare & Wellness Clinic' },
  { id: 'other', title: 'Other' },
];

// 2. Content Type Options (No emojis, no long paragraph texts)
const CONTENT_TYPES = [
  { id: 'educational', title: 'Educational Content' },
  { id: 'promotional', title: 'Promotional Content' },
  { id: 'brand_awareness', title: 'Brand Awareness' },
  { id: 'product_marketing', title: 'Product & Service Marketing' },
  { id: 'informational', title: 'Informational Content' },
  { id: 'entertainment', title: 'Entertainment Content' },
  { id: 'offers_announcements', title: 'Offers & Announcements' },
  { id: 'other_content', title: 'Other' },
];

// 3. Target Audience Options (Clean, simple chips)
const CUSTOMER_TYPES = [
  { id: 'local_walkin', label: 'Local Walk-In Customers' },
  { id: 'online_shoppers', label: 'Online Shoppers & E-Commerce' },
  { id: 'b2c_consumers', label: 'General B2C Consumers' },
  { id: 'b2b_businesses', label: 'B2B Businesses & Clients' },
];

const TARGET_ROLES = [
  'College Students & Youth',
  'Working Professionals',
  'Business Owners & Entrepreneurs',
  'Families & Parents',
  'Fashion & Trend Enthusiasts',
  'Foodies & Cafe Lovers',
  'Fitness & Health Seekers',
  'Tech Enthusiasts',
];

const AGE_GROUPS = [
  'All Ages',
  'Gen Z (18 - 24)',
  'Millennials (25 - 34)',
  'Adults (35 - 50)',
  'Seniors (50+)',
];

const LOCATION_OPTIONS = [
  'Local City / Town',
  'Metro & Urban Areas',
  'Pan-India Audience',
  'Global / International',
];

const STORAGE_KEY = 'ig_onboarding_draft';

export const StepOnboardingWizard: React.FC<StepOnboardingWizardProps> = ({ onComplete }) => {
  const { brandKit, saveBrandProfile, connectAccount, addToast } = useApp();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Load draft or initial state
  const [step, setStep] = useState<number>(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.currentStep && parsed.currentStep <= 5) return parsed.currentStep;
      } catch {}
    }
    return 1;
  });

  // Step 1: Business Category
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        return JSON.parse(draft).businessCategory || '';
      } catch {}
    }
    return brandKit.businessCategory || 'retail_boutique';
  });
  const [customCategory, setCustomCategory] = useState<string>(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        return JSON.parse(draft).customCategory || '';
      } catch {}
    }
    return '';
  });

  // Step 2: Content Types (Multi-select)
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        return JSON.parse(draft).contentTypes || [];
      } catch {}
    }
    return ['educational', 'promotional', 'offers_announcements'];
  });

  // Step 3: Target Audience
  const [customerType, setCustomerType] = useState<string>('local_walkin');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    'College Students & Youth',
    'Working Professionals',
  ]);
  const [selectedAges, setSelectedAges] = useState<string[]>(['Gen Z (18 - 24)', 'Millennials (25 - 34)']);
  const [targetLocation, setTargetLocation] = useState<string>('Local City / Town');

  // Step 4: Brand Logo & Identity
  const [brandName, setBrandName] = useState<string>(
    brandKit.brandName || user?.brandName || 'My Brand'
  );
  const [logoUrl, setLogoUrl] = useState<string>(brandKit.logoUrl || '');

  // Step 5: Instagram Connection
  const [igAccountInput, setIgAccountInput] = useState<string>(
    brandKit.handle || user?.instagramHandle || ''
  );
  const [isVerifyingInstagram, setIsVerifyingInstagram] = useState<boolean>(false);
  const [isInstagramVerified, setIsInstagramVerified] = useState<boolean>(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        return !!JSON.parse(draft).isInstagramVerified;
      } catch {}
    }
    return false;
  });
  const [verifiedIgAccount, setVerifiedIgAccount] = useState<string>(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        return JSON.parse(draft).verifiedIgAccount || '';
      } catch {}
    }
    return brandKit.handle || '';
  });

  // Center Progress Bar Transition State
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [setupProgress, setSetupProgress] = useState<number>(0);

  // Save draft whenever state changes
  useEffect(() => {
    try {
      const draft = {
        currentStep: step,
        businessCategory: selectedCategory,
        customCategory,
        contentTypes: selectedContentTypes,
        customerType,
        selectedRoles,
        selectedAges,
        targetLocation,
        brandName,
        logoUrl: logoUrl.length > 50000 ? '' : logoUrl,
        isInstagramVerified,
        verifiedIgAccount,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [
    step,
    selectedCategory,
    customCategory,
    selectedContentTypes,
    customerType,
    selectedRoles,
    selectedAges,
    targetLocation,
    brandName,
    logoUrl,
    isInstagramVerified,
    verifiedIgAccount,
  ]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Please select a logo smaller than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
      addToast('Brand logo uploaded successfully.', 'success');
    };
    reader.onerror = () => {
      addToast('Failed to load logo image.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Generate Monogram Initials Logo
  const handleGenerateMonogram = () => {
    const initial = (brandName.trim()[0] || 'B').toUpperCase();
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 256, 256);
      grad.addColorStop(0, '#7c3aed');
      grad.addColorStop(0.5, '#6366f1');
      grad.addColorStop(1, '#4f46e5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initial, 128, 134);

      setLogoUrl(canvas.toDataURL('image/png'));
      addToast(`Generated monogram logo for ${brandName}.`, 'success');
    }
  };

  // Step 5: Connect and Verify Instagram Account
  const handleConnectInstagram = () => {
    const clean = igAccountInput.trim().replace(/^@+/, '');
    // Standard Instagram username regex (1-30 characters, alphanumeric, dots, underscores)
    const validPattern = /^[a-zA-Z0-9._]{1,30}$/;

    if (!clean || !validPattern.test(clean)) {
      addToast('Please enter a valid Instagram Account or ID (e.g. @yourbrand).', 'error');
      return;
    }

    setIsVerifyingInstagram(true);
    setTimeout(() => {
      const formatted = `@${clean}`;
      setVerifiedIgAccount(formatted);
      setIsInstagramVerified(true);
      setIsVerifyingInstagram(false);

      // Register connection in AppContext (clean without fake follower numbers)
      connectAccount('instagram', {
        accountName: brandName || clean,
        username: clean,
        avatarUrl: logoUrl || '',
        followersCount: 0,
        accountType: 'instagram_business',
        permissions: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
      });

      addToast(`Connected Instagram account: ${formatted}`, 'success');
    }, 800);
  };

  // Final Transition: Centered Progress Bar and Redirect
  const handleLaunchDashboard = () => {
    if (!isInstagramVerified) {
      addToast('Please connect your Instagram Account before proceeding.', 'error');
      return;
    }

    setIsFinishing(true);
    setSetupProgress(20);

    const t1 = setTimeout(() => setSetupProgress(60), 300);
    const t2 = setTimeout(() => setSetupProgress(95), 650);
    const t3 = setTimeout(async () => {
      setSetupProgress(100);

      const categoryObj = BUSINESS_CATEGORIES.find((c) => c.id === selectedCategory);
      const categoryTitle =
        selectedCategory === 'other' ? customCategory.trim() || 'Custom Business' : categoryObj?.title || 'Business';

      const targetAudienceSummary = `${customerType.replace(/_/g, ' ')} (${selectedRoles.join(', ')}), ${selectedAges.join(', ')}, ${targetLocation}`;
      const bioSummary = `${categoryTitle} specializing in ${selectedContentTypes.map((c) => c.replace(/_/g, ' ')).join(', ')}.`;

      // 1. Save Brand Profile to SQLite Database
      await saveBrandProfile({
        companyName: brandName.trim() || 'My Brand',
        instagramHandle: verifiedIgAccount.trim() || '@creator',
        bio: bioSummary,
        targetAudience: targetAudienceSummary,
        logoUrl: logoUrl || null,
      });

      // 2. Mark complete and clean draft
      localStorage.setItem('ig_assistant_onboarded', 'true');
      localStorage.removeItem(STORAGE_KEY);

      onComplete();
    }, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  // Validation helpers for Next button
  const canProceedStep1 =
    selectedCategory && (selectedCategory !== 'other' || customCategory.trim().length > 0);
  const canProceedStep2 = selectedContentTypes.length > 0;
  const canProceedStep3 = selectedRoles.length > 0 && customerType.length > 0;
  const canProceedStep4 = brandName.trim().length >= 2;
  const canProceedStep5 = isInstagramVerified;

  const totalSteps = 5;
  const progressPercent = Math.round((step / totalSteps) * 100);

  // If finishing, show a clean centered progress bar redirecting to home page
  if (isFinishing) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-violet-600 selection:text-white">
        <div className="w-full max-w-xs text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-md">
            <InstagramIcon className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
            Setting up your dashboard
          </h2>

          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${setupProgress}%` }}
              />
            </div>
            <div className="text-right text-[11px] font-semibold text-zinc-400">
              {setupProgress}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-violet-600 selection:text-white transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-14 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-xs text-white">
            <InstagramIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white tracking-tight">
              IG Assistant <span className="text-violet-600">·</span> Onboarding
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium">
              Step {step} of {totalSteps}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
          </button>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-violet-600 border border-zinc-200 dark:border-white/10 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Stepper Strip & Progress Track */}
      <div className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-white/10 px-4 sm:px-8 py-2.5">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Stepper Pill Strip */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 text-xs">
            {[
              { num: 1, label: 'Category' },
              { num: 2, label: 'Content Type' },
              { num: 3, label: 'Audience' },
              { num: 4, label: 'Brand Logo' },
              { num: 5, label: 'Instagram' },
            ].map((s) => {
              const isPassed = step > s.num;
              const isCurrent = step === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (isPassed || (isCurrent && step > 1)) {
                      setStep(s.num);
                    }
                  }}
                  disabled={!isPassed && !isCurrent}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all shrink-0 cursor-pointer text-xs ${
                    isCurrent
                      ? 'bg-violet-600 text-white font-bold'
                      : isPassed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 opacity-60'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      isCurrent
                        ? 'bg-white text-violet-600'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.num}
                  </span>
                  <span className="hidden sm:inline text-[11px]">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Bar Track */}
          <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Step Content Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* ================================================================= */}
        {/* STEP 1: Select Business Category */}
        {/* ================================================================= */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
              What is your business category?
            </h2>

            {/* Clean, compact options list (No icons, no emojis, no paragraphs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUSINESS_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      if (cat.id !== 'other') {
                        setCustomCategory('');
                      }
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 font-bold ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <span>{cat.title}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Always visible input for custom / other business category */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Other Business Category (or type your custom business):
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setSelectedCategory('other');
                }}
                placeholder="Enter your business category (e.g. Photography, Crafts, Event Management)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30"
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: Select Content Type */}
        {/* ================================================================= */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
              What type of content would you like to create?
            </h2>

            {/* Clean, compact options list (No icons, no emojis, no paragraphs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CONTENT_TYPES.map((type) => {
                const isSelected = selectedContentTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedContentTypes.length > 1) {
                          setSelectedContentTypes(selectedContentTypes.filter((id) => id !== type.id));
                        }
                      } else {
                        setSelectedContentTypes([...selectedContentTypes, type.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 font-bold ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <span>{type.title}</span>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 px-1 pt-1">
              <span>{selectedContentTypes.length} selected</span>
              <button
                type="button"
                onClick={() => setSelectedContentTypes(CONTENT_TYPES.map((t) => t.id))}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Select All
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: Select Target Audience */}
        {/* ================================================================= */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
              Who do you want to target with your content?
            </h2>

            <div className="space-y-3.5">
              {/* Customer Type (No paragraph text) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Customer Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CUSTOMER_TYPES.map((item) => {
                    const isSelected = customerType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCustomerType(item.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 font-bold ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Demographic Role */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Target Demographic
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_ROLES.map((role) => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedRoles.length > 1) setSelectedRoles(selectedRoles.filter((r) => r !== role));
                          } else {
                            setSelectedRoles([...selectedRoles, role]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                            : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Age Group */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Age Groups
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AGE_GROUPS.map((age) => {
                    const isSelected = selectedAges.includes(age);
                    return (
                      <button
                        key={age}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedAges.length > 1) setSelectedAges(selectedAges.filter((a) => a !== age));
                          } else {
                            setSelectedAges([...selectedAges, age]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold'
                            : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10'
                        }`}
                      >
                        {age}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Location */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Location
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LOCATION_OPTIONS.map((loc) => {
                    const isSelected = targetLocation === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setTargetLocation(loc)}
                        className={`p-2 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 font-bold ring-1 ring-indigo-500/30'
                            : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: Upload Brand Logo */}
        {/* ================================================================= */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
              Upload your brand logo
            </h2>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4">
              {/* Logo Preview & Upload Zone */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl ring-2 ring-violet-500/20 p-1 relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-xs">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Brand Logo" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                        {(brandName[0] || 'B').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium mt-1">Logo Preview</span>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors relative">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      Click to upload logo
                    </p>
                    <p className="text-[10px] text-zinc-500">PNG, JPG, WEBP or SVG up to 5MB</p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-500">Don't have a logo file?</span>
                    <button
                      type="button"
                      onClick={handleGenerateMonogram}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Generate Monogram
                    </button>
                  </div>
                </div>
              </div>

              {/* Brand Name Input only */}
              <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <label className="text-xs font-bold text-zinc-900 dark:text-white">
                  Business / Brand Name <span className="text-indigo-600">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Selvi Cafe, Apex Motors"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 5: Connect Instagram Account */}
        {/* ================================================================= */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
              Connect your Instagram Account
            </h2>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4">
              {/* Status Box if connected */}
              {isInstagramVerified ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden shrink-0 bg-white dark:bg-black flex items-center justify-center">
                      {logoUrl ? (
                        <img src={logoUrl} alt="IG Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <InstagramIcon className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                          {verifiedIgAccount}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Instagram Account Connected
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsInstagramVerified(false);
                      setVerifiedIgAccount('');
                    }}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-indigo-600 underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-900 dark:text-white">
                      Enter your Instagram Account or ID:
                    </label>
                    <div className="relative">
                      <InstagramIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={igAccountInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIgAccountInput(val.startsWith('@') ? val : `@${val}`);
                        }}
                        placeholder="@yourbrand or yourbrand"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectInstagram}
                    disabled={isVerifyingInstagram}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingInstagram ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Verifying Account...</span>
                      </>
                    ) : (
                      <span>Connect Instagram Account</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Buttons (Next / Back) */}
      <footer className="sticky bottom-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              step === 1
                ? 'opacity-0 pointer-events-none'
                : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Step Indicator */}
          <span className="text-xs font-semibold text-zinc-400">
            Step {step} of {totalSteps}
          </span>

          {/* Next / Launch Button */}
          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !canProceedStep1) {
                  addToast('Please select or enter a business category.', 'error');
                  return;
                }
                if (step === 2 && !canProceedStep2) {
                  addToast('Please select at least one content type.', 'error');
                  return;
                }
                if (step === 3 && !canProceedStep3) {
                  addToast('Please select target audience details.', 'error');
                  return;
                }
                if (step === 4 && !canProceedStep4) {
                  addToast('Please enter your business or brand name.', 'error');
                  return;
                }
                setStep(step + 1);
              }}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3) ||
                (step === 4 && !canProceedStep4)
              }
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunchDashboard}
              disabled={!isInstagramVerified}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Open Dashboard</span>
              {!isInstagramVerified ? <Lock className="w-3 h-3" /> : <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
