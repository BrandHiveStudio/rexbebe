'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService, AdminUser } from '../../services/authService';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';

  const [isVerifying, setIsVerifying] = useState(!isLoginPage);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // If we're on the login page, no verification is required
    if (isLoginPage) {
      setIsVerifying(false);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('rexbebe_admin_token') : null;

    if (!token) {
      // Unauthenticated user attempting to access admin route: redirect immediately
      setIsVerifying(true);
      const redirectUrl = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
      return;
    }

    // Verify token with backend
    authService.getAdminMe(token)
      .then(res => {
        if (res && res.user) {
          setAdminUser(res.user);
          localStorage.setItem('rexbebe_admin_user', JSON.stringify(res.user));
          setIsVerifying(false);
        } else {
          throw new Error('Invalid user payload');
        }
      })
      .catch(err => {
        console.warn('[AdminAuthGuard] Token verification failed:', err.message);
        localStorage.removeItem('rexbebe_admin_token');
        localStorage.removeItem('rexbebe_admin_user');
        document.cookie = 'rexbebe_admin_token=; path=/; max-age=0; SameSite=Strict';
        router.replace(`/admin/login?reason=expired&redirect=${encodeURIComponent(pathname)}`);
      });
  }, [pathname, isLoginPage, router]);

  // If on login page, render login page directly without layout constraints
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If verifying session, show clean loading screen to prevent UI flashing
  if (isVerifying) {
    return (
      <div className="h-screen w-full bg-[#0F0F12] flex flex-col items-center justify-center text-stone-200">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-amber-500/20 animate-pulse">
            🦕
          </div>
          <div className="absolute -inset-1 rounded-2xl border border-amber-500/40 animate-ping opacity-25" />
        </div>
        <h2 className="text-base font-bold tracking-wider text-white uppercase font-heading">
          REXBEBE Security
        </h2>
        <p className="text-xs text-stone-400 mt-1 font-medium">
          Verifying administrative credentials & privileges...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
