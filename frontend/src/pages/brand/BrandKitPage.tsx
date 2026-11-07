import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Palette,
  Type,
  Hash,
  Save,
  X,
} from 'lucide-react';

export const BrandKitPage: React.FC = () => {
  const { brandKit, updateBrandKit } = useApp();
  const [formData, setFormData] = useState(brandKit);
  const [newHashtag, setNewHashtag] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandKit(formData);
  };

  const handleAddHashtag = () => {
    if (!newHashtag.trim()) return;
    const tag = newHashtag.startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
    if (!formData.defaultHashtags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        defaultHashtags: [...prev.defaultHashtags, tag],
      }));
    }
    setNewHashtag('');
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      defaultHashtags: prev.defaultHashtags.filter((t) => t !== tagToRemove),
    }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>AI Personalization Core</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Brand Kit & Creative DNA
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Configure your brand identity once. The studio automatically adapts all scripts, captions, color highlights, and calls-to-action to reflect your aesthetic.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl ig-gradient text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Settings */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Profile Identity</h3>

            <div className="flex items-center gap-4">
              <div className="ig-ring">
                <img
                  src={formData.logoUrl}
                  alt="Brand Logo"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-black"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-white border border-zinc-200 dark:border-white/10 transition-colors"
                >
                  Upload New Avatar
                </button>
                <p className="text-[10px] text-zinc-400 mt-1">Recommended: 400x400 PNG</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Brand Description (AI Context)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Color Palette */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Color System</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-2 py-1.5 text-xs text-zinc-900 dark:text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-2 py-1.5 text-xs text-zinc-900 dark:text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Accent Glow</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-2 py-1.5 text-xs text-zinc-900 dark:text-white uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Tone */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tone & Audience</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Reels Font</label>
                <select
                  value={formData.fontHeading}
                  onChange={(e) => setFormData({ ...formData, fontHeading: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                >
                  <option>Inter</option>
                  <option>Impact</option>
                  <option>Montserrat</option>
                  <option>Space Grotesk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Tone of Voice</label>
                <input
                  type="text"
                  value={formData.toneOfVoice}
                  onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Target Audience</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Default Hashtags & CTA */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Hashtags & Call to Action</h3>

            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  placeholder="e.g. #InstagramGrowth"
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHashtag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-white border border-zinc-200 dark:border-white/10 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {formData.defaultHashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-rose-600 dark:text-rose-400 text-xs font-medium border border-zinc-200 dark:border-white/5"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(tag)}
                      className="text-zinc-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Default Call To Action</label>
              <textarea
                rows={2}
                value={formData.defaultCta}
                onChange={(e) => setFormData({ ...formData, defaultCta: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Identity Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Brand Preview
          </span>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/15 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-5">
              <img
                src={formData.logoUrl}
                alt="Brand logo"
                className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-white/20 shadow-xs"
              />
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">{formData.brandName}</h3>
                <p className="text-xs text-rose-500 font-semibold">{formData.handle}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{formData.tagline}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Palette Swatches
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-md border border-black/10"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                    <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-300">{formData.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-md border border-black/10"
                      style={{ backgroundColor: formData.secondaryColor }}
                    />
                    <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-300">{formData.secondaryColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                  Voice
                </span>
                <p className="text-zinc-700 dark:text-zinc-200 font-medium">{formData.toneOfVoice}</p>
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                  Audience
                </span>
                <p className="text-zinc-600 dark:text-zinc-300">{formData.targetAudience}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
