'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getJwtPayload(token?: string | null): any | null {
  try {
    if (!token) return null;
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function DashboardHome() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth0();
  const [backendToken, setBackendToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    setBackendToken(t);
    const payload = getJwtPayload(t);
    const roles: string[] = Array.isArray(payload?.roles) ? payload.roles : [];
    const adminCheck = roles.includes('Admin') || roles.includes('SuperAdmin');
    setIsAdmin(adminCheck);
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;

    if (backendToken && isAdmin) {
      router.replace('/dashboard/admin');
      return;
    }

    if (backendToken && !isAdmin) {
      router.replace('/dashboard/profile');
      return;
    }

    if (!isLoading && !isAuthenticated && !backendToken) {
      router.push('/login');
    }
  }, [bootstrapped, isLoading, isAuthenticated, backendToken, isAdmin, router]);

  if (bootstrapped && backendToken) {
    return (
      <div className="pt-20 px-6 md:px-12 lg:px-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-tur1 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return null;
}


