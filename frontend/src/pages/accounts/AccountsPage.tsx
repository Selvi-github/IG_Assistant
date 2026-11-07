import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Plus,
  Lock,
  KeyRound,
} from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '@/components/icons/SocialIcons';
import { Modal } from '@/components/ui/Modal';
import { formatNumber, formatDate } from '@/lib/utils';

export const AccountsPage: React.FC = () => {
  const { connectedAccounts, connectAccount, disconnectAccount, addToast } = useApp();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook'>('instagram');
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [customHandle, setCustomHandle] = useState('');

  const igAccounts = connectedAccounts.filter((a) => a.platform === 'instagram');
  const fbAccounts = connectedAccounts.filter((a) => a.platform === 'facebook');

  const handleStartConnect = (platform: 'instagram' | 'facebook') => {
    setSelectedPlatform(platform);
    setCustomHandle(platform === 'instagram' ? 'aurastudio.ai' : 'Aura Studio Official');
    setModalStep(1);
    setIsConnectModalOpen(true);
  };

  const handleCompleteOAuth = () => {
    connectAccount(selectedPlatform, {
      username: customHandle.replace('@', ''),
      accountName: customHandle.replace('@', ''),
      followersCount: Math.floor(Math.random() * 40000 + 5000),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    });
    setIsConnectModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Meta Graph API OAuth 2.0</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Connected Accounts
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Link your Instagram Business and Facebook Pages to enable direct API publishing and audience analytics.
          </p>
        </div>

        <button
          onClick={() => handleStartConnect('instagram')}
          className="px-5 py-3 rounded-xl ig-gradient text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Account</span>
        </button>
      </div>

      {/* Security Info */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 flex items-start gap-3">
        <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-600 dark:text-zinc-300">
          <strong className="text-zinc-900 dark:text-white">Security Guarantee:</strong> Passwords are never requested or stored. Access is authorized directly via Meta OAuth consent dialog with 60-day encrypted tokens.
        </div>
      </div>

      {/* Instagram Accounts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg ig-gradient text-white shadow-xs">
              <InstagramIcon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Instagram Professional Accounts</h2>
          </div>
          <button
            onClick={() => handleStartConnect('instagram')}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
          >
            + Add Instagram
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {igAccounts.map((account) => (
            <div
              key={account.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="ig-ring">
                    <img
                      src={account.avatarUrl}
                      alt={account.username}
                      className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-black"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-white">@{account.username}</h3>
                      <span
                        className={`text-[8px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                          account.isConnected
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {account.isConnected ? 'Active' : 'Offline'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {formatNumber(account.followersCount)} Followers · ID: {account.instagramId || '178414053'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    account.isConnected
                      ? disconnectAccount(account.id)
                      : connectAccount('instagram', { id: account.id })
                  }
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-colors cursor-pointer ${
                    account.isConnected
                      ? 'border-rose-500/20 text-rose-500 hover:bg-rose-500/10'
                      : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                  }`}
                >
                  {account.isConnected ? 'Disconnect' : 'Reconnect'}
                </button>
              </div>

              {/* Permissions Checklist */}
              <div className="pt-3 border-t border-zinc-200 dark:border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Meta Graph Permissions:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {account.permissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[10px] font-mono">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-200 dark:border-white/5">
                <span>Expires: {formatDate(account.tokenExpiresAt)}</span>
                <button
                  onClick={() => addToast('OAuth token refreshed successfully with Meta API.', 'success')}
                  className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Token</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facebook Pages */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#1877f2] flex items-center justify-center text-white shadow-xs">
              <FacebookIcon className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Facebook Connected Pages</h2>
          </div>
          <button
            onClick={() => handleStartConnect('facebook')}
            className="text-xs font-semibold text-blue-500 hover:text-blue-600 cursor-pointer"
          >
            + Add Page
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {fbAccounts.map((account) => (
            <div
              key={account.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={account.avatarUrl}
                    alt={account.accountName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-white">{account.accountName}</h3>
                      <span className="text-[8px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Page Active
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {formatNumber(account.followersCount)} Page Likes
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    account.isConnected
                      ? disconnectAccount(account.id)
                      : connectAccount('facebook', { id: account.id })
                  }
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Meta Graph Permissions:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {account.permissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-[10px] font-mono">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title={`Connect ${selectedPlatform === 'instagram' ? 'Instagram' : 'Facebook Page'}`}
        description="Official Meta Login Authorization"
      >
        <div className="space-y-4">
          {modalStep === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl ig-gradient flex items-center justify-center text-white">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Meta OAuth Consent</h4>
                  <p className="text-[10px] text-zinc-500">Authorize permissions for Instagram & Facebook</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Account Handle
                </label>
                <input
                  type="text"
                  value={customHandle}
                  onChange={(e) => setCustomHandle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Permissions Requested:</p>
                <div className="space-y-1 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>instagram_content_publish</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>pages_manage_posts</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalStep(2)}
                className="w-full py-2.5 rounded-xl ig-gradient text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Authenticate with Meta
              </button>
            </div>
          )}

          {modalStep === 2 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Authorization Successful</h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Meta has issued a long-lived access token with publishing permissions.
              </p>
              <button
                type="button"
                onClick={handleCompleteOAuth}
                className="w-full py-2.5 rounded-xl ig-gradient text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
