import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '@/types';

interface RegisterResponse {
  success: boolean;
  requiresVerification?: boolean;
  message?: string;
  error?: string;
  devVerification?: {
    otp: string;
    token: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; unverified?: boolean; error?: string }>;
  register: (
    email: string,
    password?: string,
    fullName?: string,
    brandName?: string,
    instagramHandle?: string
  ) => Promise<RegisterResponse>;
  verifyEmail: (params: { token?: string; email?: string; otp?: string }) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string; error?: string; devVerification?: { otp: string; token: string } }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'usr_socialcraft_demo_101',
  email: 'alex.creator@socialcraft.ai',
  fullName: 'Alex Vance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  brandName: 'Aura Studio',
  instagramHandle: '@aurastudio.ai',
  facebookPageName: 'Aura Studio Page',
  createdAt: '2026-10-01T10:00:00.000Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('socialcraft_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to get auth headers with stored token
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('ig_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Check existing session on load from backend /api/auth/me
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Handle Google OAuth callback redirect parameter
        if (typeof window !== 'undefined' && window.location.search) {
          const urlParams = new URLSearchParams(window.location.search);
          const queryToken = urlParams.get('token');
          if (queryToken) {
            localStorage.setItem('ig_token', queryToken);
            sessionStorage.setItem('ig_session_active', 'true');
            // Clean up query string from address bar
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }

        const token = localStorage.getItem('ig_token');
        if (!token && !document.cookie.includes('ig_token')) {
          // If no token exists and no demo user active
          if (sessionStorage.getItem('ig_demo_active') === 'true') {
            setUser(DEMO_USER);
          } else {
            setUser(null);
            localStorage.removeItem('socialcraft_user');
          }
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('socialcraft_user', JSON.stringify(data.user));
          } else {
            setUser(null);
            localStorage.removeItem('socialcraft_user');
            localStorage.removeItem('ig_token');
          }
        } else {
          // If 401 or unauthorized, clear session
          setUser(null);
          localStorage.removeItem('socialcraft_user');
          localStorage.removeItem('ig_token');
        }
      } catch (err) {
        console.warn('Session verification fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // Sync user state to localStorage safely with quota protection
  useEffect(() => {
    try {
      if (user) {
        // Avoid browser QuotaExceededError if avatarUrl is a large data URL
        const safeUser =
          user.avatarUrl && user.avatarUrl.length > 50000
            ? { ...user, avatarUrl: '' }
            : user;
        localStorage.setItem('socialcraft_user', JSON.stringify(safeUser));
      } else {
        localStorage.removeItem('socialcraft_user');
      }
    } catch (err) {
      console.warn('LocalStorage user sync skipped due to browser quota:', err);
    }
  }, [user]);

  // Login
  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return {
          success: false,
          unverified: data.unverified || false,
          error: data.error || 'Invalid email or password.',
        };
      }

      if (data.token) {
        localStorage.setItem('ig_token', data.token);
      }
      sessionStorage.setItem('ig_session_active', 'true');
      sessionStorage.removeItem('ig_demo_active');
      setUser(data.user);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Unable to connect to authentication server.',
      };
    }
  };

  // Register
  const register = async (
    email: string,
    password?: string,
    fullName?: string,
    brandName?: string,
    instagramHandle?: string
  ): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          fullName,
          brandName,
          instagramHandle,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return {
          success: false,
          error: data.error || 'Registration failed. Please verify your details.',
        };
      }

      setIsLoading(false);
      return {
        success: true,
        requiresVerification: true,
        message: data.message,
        devVerification: data.devVerification,
      };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Network error during registration.',
      };
    }
  };

  // Verify Email
  const verifyEmail = async (params: { token?: string; email?: string; otp?: string }) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Verification failed.' };
      }

      if (data.user) {
        setUser(data.user);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification network error.' };
    }
  };

  // Resend Verification
  const resendVerification = async (email: string) => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to resend code.' };
      }
      return { success: true, message: data.message, devVerification: data.devVerification };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend code.' };
    }
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Unable to request password reset.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  // Reset Password
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Password reset failed.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  // Google OAuth Login
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();

      if (!res.ok || !data.success || !data.url) {
        return {
          success: false,
          error:
            data.error ||
            'Google OAuth 2.0 is not yet configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env',
        };
      }

      // Redirect user to official Google OAuth consent screen
      window.location.href = data.url;
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unable to connect to Google OAuth service.',
      };
    }
  };

  // Demo fallback
  const loginAsDemo = () => {
    sessionStorage.setItem('ig_session_active', 'true');
    sessionStorage.setItem('ig_demo_active', 'true');
    setUser(DEMO_USER);
  };

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      sessionStorage.removeItem('ig_session_active');
      sessionStorage.removeItem('ig_demo_active');
      localStorage.removeItem('ig_token');
      localStorage.removeItem('socialcraft_user');
      localStorage.removeItem('ig_assistant_onboarded');
      localStorage.removeItem('socialcraft_mobile_onboarded');
      setUser(null);
    }
  };

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          return;
        }
      }
    } catch (err) {
      console.warn('Profile update API error:', err);
    }
    // Fallback local update
    const updated = { ...user, ...updates };
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        loginWithGoogle,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
