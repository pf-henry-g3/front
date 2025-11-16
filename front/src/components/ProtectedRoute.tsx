'use client';

import { useAuth } from '@/src/context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean; // true = requiere login, false = requiere logout
  showLoading?: boolean;
}

export default function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login',
  requireAuth = true,
  showLoading = true
}: ProtectedRouteProps) {
  const { user, isAuthenticated: isContextAuth, loading: contextLoading } = useAuth();
  const { isAuthenticated: isAuth0Authenticated, isLoading: auth0Loading } = useAuth0();
  const router = useRouter();
  const [hasLocalToken, setHasLocalToken] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    const localUser = localStorage.getItem('user');
    const hasToken = !!(token && localUser);

    setHasLocalToken(hasToken);
    setMounted(true);

    const handleAuthChange = () => {
      const newToken = localStorage.getItem('access_token');
      const newUser = localStorage.getItem('user');
      setHasLocalToken(!!(newToken && newUser));
    };

    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [isContextAuth, isAuth0Authenticated]);

  const isLoading = !mounted || contextLoading || auth0Loading;
  const isAuthenticated = isContextAuth || isAuth0Authenticated || hasLocalToken;

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
    } else if (!requireAuth && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tur1 mx-auto mb-4"></div>
          <p className="text-txt1 font-semibold text-lg">🔐 Verificando acceso...</p>
          <p className="text-txt2 text-sm mt-2">Por favor espera...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-txt1 font-bold text-xl mb-2">Acceso restringido</h2>
          <p className="text-txt2 mb-4">Debes iniciar sesión para acceder a esta página</p>
          <div className="animate-pulse text-txt2 text-sm">Redirigiendo al login...</div>
        </div>
      </div>
    );
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
