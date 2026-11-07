import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { StudioPage } from '@/pages/studio/StudioPage';
import { EditorPage } from '@/pages/editor/EditorPage';
import { PublisherPage } from '@/pages/publisher/PublisherPage';
import { AccountsPage } from '@/pages/accounts/AccountsPage';
import { BrandKitPage } from '@/pages/brand/BrandKitPage';
import { HistoryPage } from '@/pages/history/HistoryPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Routes>
              {/* Public Landing & Auth Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Responsive Unified Application Shell */}
              {/* Automatically renders Mobile Layout on mobile screens (< 768px) and Web Studio on desktop (>= 768px) */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/studio" element={<StudioPage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/publisher" element={<PublisherPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/brand-kit" element={<BrandKitPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Direct alias redirects for mobile paths */}
                <Route path="/mobile" element={<Navigate to="/dashboard" replace />} />
                <Route path="/mobile/create" element={<Navigate to="/studio" replace />} />
                <Route path="/mobile/queue" element={<Navigate to="/publisher" replace />} />
                <Route path="/mobile/brand" element={<Navigate to="/brand-kit" replace />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
