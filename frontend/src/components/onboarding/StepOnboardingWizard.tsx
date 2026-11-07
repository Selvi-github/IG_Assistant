import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  ShoppingBag,
  Coffee,
  GraduationCap,
  Car,
  Smartphone,
  Dumbbell,
  Sparkles,
  Home as HomeIcon,
  Briefcase,
  Activity,
  HelpCircle,
  BookOpen,
  BadgePercent,
  Megaphone,
  Layers,
  Info,
  Tv,
  Flame,
  MoreHorizontal,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Lock,
  Sun,
  Moon,
  LogOut,
  Users,
  ShieldCheck,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

interface StepOnboardingWizardProps {
  onComplete: () => void;
}

// 1. Business Category Definitions
const BUSINESS_CATEGORIES = [
  {
    id: 'retail_boutique',
    title: 'Retail, Boutique & Saree Shop',
    desc: 'Silk sarees, ethnic wear, jewelry, clothing & luxury apparel',
    icon: ShoppingBag,
    defaultArt: 'luxury boutique showroom, draped silk sarees, bright studio lighting',
  },
  {
    id: 'cafe_food',
    title: 'Cafe, Bakery & Restaurant',
    desc: 'Artisan cafes, coffee shops, fresh bakery, desserts & dining',
    icon: Coffee,
    defaultArt: 'artisan cafe, fresh gourmet pastries, specialty coffee, warm natural light',
  },
  {
    id: 'education',
    title: 'School, College & Education',
    desc: 'Universities, engineering colleges, admissions & coaching academies',
    icon: GraduationCap,
    defaultArt: 'modern university campus, inspiring students, daylight academic architecture',
  },
  {
    id: 'automotive',
    title: 'Automotive & Vehicle Showroom',
    desc: 'Sports bikes, luxury cars, motorcycle dealerships & service garages',
    icon: Car,
    defaultArt: 'luxury vehicle showroom, sports motorcycle, polished floor reflections',
  },
  {
    id: 'electronics',
    title: 'Electronics & Mobile Store',
    desc: 'Smartphones, gadgets, laptops, consumer tech & repair centers',
    icon: Smartphone,
    defaultArt: 'modern electronics showroom, flagship smartphones, high-tech displays',
  },
  {
    id: 'fitness_gym',
    title: 'Fitness, Gym & Wellness',
    desc: 'Gyms, yoga centers, personal training, athletics & nutrition',
    icon: Dumbbell,
    defaultArt: 'state of the art gym, athletic equipment, dynamic workout illumination',
  },
  {
    id: 'beauty_salon',
    title: 'Beauty, Salon & Cosmetics',
    desc: 'Salons, spas, skincare clinics, cosmetics & aesthetic care',
    icon: Sparkles,
    defaultArt: 'luxury salon interior, premium skincare styling, soft aesthetic glow',
  },
  {
    id: 'real_estate',
    title: 'Real Estate & Interior Design',
    desc: 'Properties, architecture, home decor, construction & villas',
    icon: HomeIcon,
    defaultArt: 'luxury architectural home, contemporary interior design, bright natural fill',
  },
  {
    id: 'professional_services',
    title: 'Professional Services & Consulting',
    desc: 'Marketing agencies, IT consulting, accounting, corporate & legal',
    icon: Briefcase,
    defaultArt: 'modern creative studio agency, collaborative workspace, professional elegance',
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Wellness Clinic',
    desc: 'Clinics, dental practices, pharmacy & medical wellness',
    icon: Activity,
    defaultArt: 'clean modern medical clinic, trusted professional health environment',
  },
  {
    id: 'other',
    title: 'Other / Custom Business',
    desc: 'Custom commercial enterprise or specialized niche',
    icon: HelpCircle,
    defaultArt: 'commercial master-grade product studio photography',
  },
];

// 2. Content Type Definitions
const CONTENT_TYPES = [
  {
    id: 'educational',
    title: 'Educational Content',
    desc: 'Tutorials, guides, industry tips & practical how-to knowledge',
    icon: BookOpen,
  },
  {
    id: 'promotional',
    title: 'Promotional Content',
    desc: 'Special discounts, promotional pricing & sales campaigns',
    icon: BadgePercent,
  },
  {
    id: 'brand_awareness',
    title: 'Brand Awareness',
    desc: 'Behind-the-scenes, founder stories & authentic brand identity',
    icon: Megaphone,
  },
  {
    id: 'product_marketing',
    title: 'Product & Service Marketing',
    desc: 'New arrivals, catalogs, feature spotlights & client showcases',
    icon: Layers,
  },
  {
    id: 'informational',
    title: 'Informational Content',
    desc: 'Industry news, updates, announcements & key facts',
    icon: Info,
  },
  {
    id: 'entertainment',
    title: 'Entertainment Content',
    desc: 'Relatable visual moments, lifestyle humor & trending hooks',
    icon: Tv,
  },
  {
    id: 'offers_announcements',
    title: 'Offers & Announcements',
    desc: 'Festival mega offers, seasonal discounts & event launches',
    icon: Flame,
  },
  {
    id: 'other_content',
    title: 'Other',
    desc: 'Tailored multi-format content strategy',
    icon: MoreHorizontal,
  },
];

// 3. Target Audience Options
const CUSTOMER_TYPES = [
  { id: 'local_walkin', label: 'Local Walk-In Customers', desc: 'Patrons visiting your physical store or local venue' },
  { id: 'online_shoppers', label: 'Online Shoppers & E-Commerce', desc: 'Digital consumers purchasing goods or services remotely' },
  { id: 'b2c_consumers', label: 'General B2C Consumers', desc: 'Everyday consumers following social trends and deals' },
  { id: 'b2b_businesses', label: 'B2B Businesses & Clients', desc: 'Corporate buyers, companies, vendors & institutions' },
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

const GENDER_OPTIONS = [
  { id: 'all', label: 'All Genders' },
  { id: 'women', label: 'Primarily Women' },
  { id: 'men', label: 'Primarily Men' },
];

const LOCATION_OPTIONS = [
  'Local City / Town',
  'Metro & Urban Areas',
  'Pan-India Audience',
  'Global / International',
];

const STORAGE_KEY = 'ig_onboarding_draft';

export const StepOnboardingWizard: React.FC<StepOnboardingWizardProps> = ({ onComplete }) => {
  const { brandKit, saveBrandProfile, connectAccount, triggerConfetti, addToast } = useApp();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Load draft or initial state
  const [step, setStep] = useState<number>(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.currentStep) return parsed.currentStep;
      } catch {
        // ignore
      }
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
  const [customCategory, setCustomCategory] = useState<string>('');

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
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [targetLocation, setTargetLocation] = useState<string>('Local City / Town');

  // Step 4: Brand Logo & Identity
  const [brandName, setBrandName] = useState<string>(
    brandKit.brandName || user?.brandName || 'My Brand'
  );
  const [instagramHandle, setInstagramHandle] = useState<string>(
    brandKit.handle || user?.instagramHandle || '@creator'
  );
  const [logoUrl, setLogoUrl] = useState<string>(brandKit.logoUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

  // Step 5: Instagram Connection
  const [igConnectHandle, setIgConnectHandle] = useState<string>(
    brandKit.handle || user?.instagramHandle || '@creator'
  );
  const [isVerifyingInstagram, setIsVerifyingInstagram] = useState<boolean>(false);
  const [isInstagramVerified, setIsInstagramVerified] = useState<boolean>(false);
  const [igAccountDetails, setIgAccountDetails] = useState<{
    username: string;
    accountName: string;
    followersCount: number;
    avatarUrl: string;
  } | null>(null);

  // Step 6: Final Integration state
  const [integrationProgress, setIntegrationProgress] = useState<number>(0);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);

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
        selectedGender,
        targetLocation,
        brandName,
        instagramHandle,
        logoUrl: logoUrl.length > 50000 ? '' : logoUrl,
        isInstagramVerified,
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
    selectedGender,
    targetLocation,
    brandName,
    instagramHandle,
    logoUrl,
    isInstagramVerified,
  ]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Please select a logo smaller than 5MB.', 'error');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
      setIsUploadingLogo(false);
      addToast('Brand logo uploaded successfully!', 'success');
    };
    reader.onerror = () => {
      setIsUploadingLogo(false);
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
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#fb2175');
      grad.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initial, 128, 134);

      setLogoUrl(canvas.toDataURL('image/png'));
      addToast(`Generated monogram logo for ${brandName}!`, 'success');
    }
  };

  // Step 5: Connect and Verify Instagram Account
  const handleConnectInstagram = () => {
    const clean = igConnectHandle.trim().replace(/^@+/, '');
    if (!clean || clean.length < 2) {
      addToast('Please enter a valid Instagram handle (e.g. @yourbrand).', 'error');
      return;
    }

    setIsVerifyingInstagram(true);
    setTimeout(() => {
      const verifiedHandle = `@${clean}`;
      const followers = Math.floor(Math.random() * 8500 + 1200);
      const verifiedDetails = {
        username: clean,
        accountName: brandName || clean,
        followersCount: followers,
        avatarUrl:
          logoUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };

      setIgAccountDetails(verifiedDetails);
      setIsInstagramVerified(true);
      setIsVerifyingInstagram(false);
      setInstagramHandle(verifiedHandle);

      // Register connection in AppContext
      connectAccount('instagram', {
        accountName: verifiedDetails.accountName,
        username: clean,
        avatarUrl: verifiedDetails.avatarUrl,
        followersCount: followers,
        accountType: 'instagram_business',
        permissions: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
      });

      addToast(`Verified Instagram Business Account: ${verifiedHandle}`, 'success');
    }, 1200);
  };

  // Trigger step 6 completion animation
  useEffect(() => {
    if (step === 6) {
      setIntegrationProgress(15);
      const t1 = setTimeout(() => setIntegrationProgress(40), 400);
      const t2 = setTimeout(() => setIntegrationProgress(75), 800);
      const t3 = setTimeout(() => {
        setIntegrationProgress(100);
        triggerConfetti();
      }, 1200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [step]);

  // Step 7: Finalize and open Content Creation Dashboard
  const handleFinalizeAndOpenDashboard = async () => {
    setIsFinalizing(true);

    const categoryObj = BUSINESS_CATEGORIES.find((c) => c.id === selectedCategory);
    const categoryTitle =
      selectedCategory === 'other' ? customCategory || 'Custom Business' : categoryObj?.title || 'Business';

    const targetAudienceSummary = `${customerType.replace(/_/g, ' ')} (${selectedRoles.join(', ')}), ${selectedAges.join(', ')}, ${targetLocation}`;

    const bioSummary = `${categoryTitle} specializing in ${selectedContentTypes.map((c) => c.replace(/_/g, ' ')).join(', ')}.`;

    // 1. Save Brand Profile to Backend SQLite Database
    await saveBrandProfile({
      companyName: brandName.trim() || 'My Brand',
      instagramHandle: instagramHandle.trim() || '@creator',
      bio: bioSummary,
      targetAudience: targetAudienceSummary,
      logoUrl: logoUrl || null,
    });

    // 2. Mark complete and clean draft
    localStorage.setItem('ig_assistant_onboarded', 'true');
    localStorage.removeItem(STORAGE_KEY);
    addToast('Onboarding completed! Welcome to your Content Creation Dashboard.', 'success');

    setIsFinalizing(false);
    onComplete();
  };

  // Validation helpers for Next button
  const canProceedStep1 =
    selectedCategory && (selectedCategory !== 'other' || customCategory.trim().length > 0);
  const canProceedStep2 = selectedContentTypes.length > 0;
  const canProceedStep3 = selectedRoles.length > 0 && customerType.length > 0;
  const canProceedStep4 = brandName.trim().length >= 2;
  const canProceedStep5 = isInstagramVerified;

  const totalSteps = 6;
  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl ig-gradient flex items-center justify-center p-2 shadow-sm text-white">
            <InstagramIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-zinc-950 dark:text-white tracking-tight">
              IG Assistant <span className="text-rose-500">·</span> Onboarding
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Step {step} of {totalSteps}:{' '}
              {step === 1 && 'Select Business Category'}
              {step === 2 && 'Select Content Type'}
              {step === 3 && 'Select Target Audience'}
              {step === 4 && 'Upload Brand Logo'}
              {step === 5 && 'Connect Instagram'}
              {step === 6 && 'Complete Account Integration'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-rose-500 border border-zinc-200 dark:border-white/10 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Progress Bar & Stepper Indicator */}
      <div className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Stepper Pill Strip */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { num: 1, label: 'Category' },
              { num: 2, label: 'Content Type' },
              { num: 3, label: 'Audience' },
              { num: 4, label: 'Brand Logo' },
              { num: 5, label: 'Instagram' },
              { num: 6, label: 'Integration' },
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
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-rose-500 text-white font-bold shadow-xs'
                      : isPassed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 opacity-60'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-white text-rose-600'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Bar Track */}
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full ig-gradient transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Step Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {/* ================================================================= */}
        {/* STEP 1: Select Business Category */}
        {/* ================================================================= */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                Step 1 of 6
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-2 tracking-tight">
                What is your business category?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Select the industry that best represents your business. Our AI adapts prompts, lighting, and composition specifically to your niche.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BUSINESS_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 shadow-sm ring-2 ring-rose-500/20'
                        : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:text-rose-500'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedCategory === 'other' && (
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 space-y-2">
                <label className="text-xs font-bold text-zinc-900 dark:text-white">
                  Enter Your Custom Business Category:
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Handmade Pottery Studio, Solar Energy Installation"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: Select Content Type */}
        {/* ================================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                Step 2 of 6
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-2 tracking-tight">
                What type of content would you like to create?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Choose one or more content goals. We calibrate post layouts, visual styles, and caption tones to match your strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONTENT_TYPES.map((type) => {
                const IconComponent = type.icon;
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 group ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 shadow-sm ring-2 ring-rose-500/20'
                        : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:text-rose-500'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{type.title}</h3>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-rose-500 border-rose-500 text-white'
                              : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
              <span>{selectedContentTypes.length} content types selected</span>
              <button
                type="button"
                onClick={() => setSelectedContentTypes(CONTENT_TYPES.map((t) => t.id))}
                className="text-rose-500 font-semibold hover:underline cursor-pointer"
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
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                Step 3 of 6
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-2 tracking-tight">
                Who do you want to target with your content?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Define your ideal customer audience. This guides the AI caption RAG engine and visual aesthetics.
              </p>
            </div>

            <div className="space-y-5">
              {/* Customer Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Customer Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CUSTOMER_TYPES.map((item) => {
                    const isSelected = customerType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCustomerType(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-rose-500 bg-rose-500/10 text-zinc-950 dark:text-white font-bold ring-1 ring-rose-500'
                            : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Demographic Role */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Target Demographic & Roles (Select Multiple)
                </label>
                <div className="flex flex-wrap gap-2">
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
                        className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-rose-500 text-white font-semibold shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 hover:border-zinc-300'
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Age Groups
                </label>
                <div className="flex flex-wrap gap-2">
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Target Geographic Location
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LOCATION_OPTIONS.map((loc) => {
                    const isSelected = targetLocation === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setTargetLocation(loc)}
                        className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
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
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                Step 4 of 6
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-2 tracking-tight">
                Upload your brand logo
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Your logo will be integrated into future post creations, slide footers, and your Studio profile.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 shadow-xs space-y-6">
              {/* Logo Preview & Upload Zone */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl ig-ring p-1 relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-md">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Brand Logo" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-2xl ig-gradient flex items-center justify-center text-white text-3xl font-black">
                        {(brandName[0] || 'B').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium mt-1.5">Live Preview</span>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-5 text-center hover:border-rose-500 transition-colors relative">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      Click to upload your logo file
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">PNG, JPG, WEBP or SVG up to 5MB</p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-zinc-500">Don't have a logo file ready?</span>
                    <button
                      type="button"
                      onClick={handleGenerateMonogram}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Generate Monogram
                    </button>
                  </div>
                </div>
              </div>

              {/* Brand Name & Handle Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-900 dark:text-white">
                    Business / Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Selvi Cafe, Apex Motors"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-900 dark:text-white">
                    Instagram Handle <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <InstagramIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInstagramHandle(val.startsWith('@') ? val : `@${val}`);
                        setIgConnectHandle(val.startsWith('@') ? val : `@${val}`);
                      }}
                      placeholder="@yourbrand"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 5: Connect Instagram Account */}
        {/* ================================================================= */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                Step 5 of 6 · Mandatory Integration
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-2 tracking-tight">
                Connect your Instagram Account
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Link your Instagram Business or Creator account to activate automated publishing, carousel dispatch, and account analytics.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 shadow-sm space-y-6">
              {/* Instagram Card Header */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl ig-gradient flex items-center justify-center p-2.5 shadow-md shrink-0">
                  <InstagramIcon className="w-7 h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                      Meta Graph API · Instagram Business
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Official Meta Partner
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Requires Instagram Business or Creator account linked to Facebook Page
                  </p>
                </div>
              </div>

              {/* Status Box */}
              {isInstagramVerified && igAccountDetails ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden shrink-0">
                      <img src={igAccountDetails.avatarUrl} alt="IG Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                          @{igAccountDetails.username}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Instagram Creator Connected · {igAccountDetails.followersCount.toLocaleString()} followers
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-white dark:bg-black px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Verified
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-900 dark:text-white">
                      Instagram Business / Creator Handle:
                    </label>
                    <div className="relative">
                      <InstagramIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={igConnectHandle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIgConnectHandle(val.startsWith('@') ? val : `@${val}`);
                        }}
                        placeholder="@yourbrand"
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectInstagram}
                    disabled={isVerifyingInstagram}
                    className="w-full py-3.5 px-4 rounded-xl ig-gradient text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingInstagram ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Verifying Meta Graph Handshake...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Connect & Verify Instagram Account</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      <strong>Requirement:</strong> Your Instagram account must be connected to proceed. The Content Creation Dashboard is locked until integration is verified.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 6: Complete Account Integration */}
        {/* ================================================================= */}
        {step === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Step 6 of 6 · Final Step
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-2 tracking-tight">
                Complete Account Integration
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Finalizing account configuration and saving your business settings to the database.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 shadow-sm space-y-6">
              {/* Animated Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Configuration Progress</span>
                  <span className="text-emerald-500 font-extrabold">{integrationProgress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${integrationProgress}%` }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5">
                {[
                  {
                    title: 'Business Category & Visual Art Direction',
                    detail: BUSINESS_CATEGORIES.find((c) => c.id === selectedCategory)?.title || 'Custom',
                    done: integrationProgress >= 20,
                  },
                  {
                    title: 'Content Formats & Strategy Goals',
                    detail: `${selectedContentTypes.length} content formats selected`,
                    done: integrationProgress >= 40,
                  },
                  {
                    title: 'Target Audience Profile',
                    detail: `${customerType.replace(/_/g, ' ')} · ${selectedAges.join(', ')}`,
                    done: integrationProgress >= 60,
                  },
                  {
                    title: 'Brand Identity & Logo Storage',
                    detail: `${brandName} (${instagramHandle})`,
                    done: integrationProgress >= 80,
                  },
                  {
                    title: 'Meta Graph API Instagram Verification',
                    detail: `${instagramHandle} · Verified Business Creator`,
                    done: integrationProgress >= 100,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          item.done
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">{item.detail}</div>
                      </div>
                    </div>
                    {item.done ? (
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider shrink-0">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 shrink-0">Configuring...</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Final Launch Button */}
              <button
                type="button"
                onClick={handleFinalizeAndOpenDashboard}
                disabled={integrationProgress < 100 || isFinalizing}
                className="w-full py-4 px-6 rounded-2xl ig-gradient text-white text-sm font-bold shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isFinalizing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Saving Profile & Launching Studio...</span>
                  </>
                ) : (
                  <>
                    <span>Open Content Creation Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Buttons (Next / Back) */}
      <footer className="sticky bottom-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || isFinalizing}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              step === 1
                ? 'opacity-0 pointer-events-none'
                : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Step Indicator */}
          <span className="text-xs font-semibold text-zinc-400">
            Step {step} of {totalSteps}
          </span>

          {/* Next Button */}
          {step < 6 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !canProceedStep1) {
                  addToast('Please select a business category to continue.', 'error');
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
                if (step === 5 && !canProceedStep5) {
                  addToast('You must connect and verify your Instagram account before continuing.', 'error');
                  return;
                }
                setStep(step + 1);
              }}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3) ||
                (step === 4 && !canProceedStep4) ||
                (step === 5 && !canProceedStep5)
              }
              className="px-6 py-2.5 rounded-xl ig-gradient text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              {step === 5 && !canProceedStep5 ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </footer>
    </div>
  );
};
