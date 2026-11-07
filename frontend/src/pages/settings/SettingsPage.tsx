import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Settings,
  Database,
  Cpu,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast } = useApp();
  const { theme, setTheme } = useTheme();

  const [metaAppId, setMetaAppId] = useState('1092837465192018');
  const [metaAppSecret, setMetaAppSecret] = useState('••••••••••••••••••••••••••••');
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD-••••••••••••••••••••••••');
  const [supabaseUrl, setSupabaseUrl] = useState('https://demo-socialcraft.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9••••••••');
  const [selectedGeminiModel, setSelectedGeminiModel] = useState('gemini-2.0-flash');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Configuration credentials saved in vault.', 'success');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Developer & API Vault</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Configure Meta App credentials, the AI token, database keys, and UI appearance.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 rounded-xl ig-gradient text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* Appearance Mode */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Appearance Mode</h3>
          <div className="flex gap-3 max-w-md">
            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                addToast('Dark mode enabled.', 'info');
              }}
              className={`flex-1 p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold'
                  : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark Theme</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('light');
                addToast('Bright mode enabled.', 'info');
              }}
              className={`flex-1 p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-rose-500 bg-rose-500/10 text-rose-600 font-bold'
                  : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Bright Mode</span>
            </button>
          </div>
        </div>

        {/* Meta Developer Graph API Credentials */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Official Meta Graph API App Credentials</span>
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>v21.0 Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Meta App ID</label>
              <input
                type="text"
                value={metaAppId}
                onChange={(e) => setMetaAppId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Meta App Secret</label>
              <input
                type="password"
                value={metaAppSecret}
                onChange={(e) => setMetaAppSecret(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Gemini AI API Engine */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-rose-500" />
              <span>AI Caption Engine</span>
            </h3>
            <span className="text-[10px] text-rose-500 font-semibold">Free Tier API Supported</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">AI API Key</label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Model Engine</label>
              <select
                value={selectedGeminiModel}
                onChange={(e) => setSelectedGeminiModel(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
              >
                <option value="gemini-2.0-flash">Fast free model</option>
                <option value="gemini-1.5-pro">Detailed model</option>
              </select>
            </div>
          </div>
        </div>

        {/* Supabase */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Supabase Database & Auth Vault</span>
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">PostgreSQL & Auth</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Project URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Anon Key</label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
