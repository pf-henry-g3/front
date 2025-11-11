'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useMemo, useState } from 'react';
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
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [backendToken, setBackendToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    setBackendToken(t);
    if (u) {
      try {
        const ju = JSON.parse(u);
        setUserName(ju?.name || ju?.userName || ju?.email || '');
      } catch {
        // no-op
      }
    }
    const payload = getJwtPayload(t);
    const roles: string[] = Array.isArray(payload?.roles) ? payload.roles : [];
    setIsAdmin(roles.includes('Admin') || roles.includes('SuperAdmin'));
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !backendToken) {
      // Not logged in anywhere, send to login
      loginWithRedirect({ appState: { returnTo: '/dashboard' } });
    }
  }, [isLoading, isAuthenticated, backendToken, loginWithRedirect]);

  return (
    <div className="pt-20 px-6 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">Bienvenido{userName ? `, ${userName}` : ''}</h1>
          <p className="mt-2 text-gray-600">Gestiona tu perfil y accede a herramientas.</p>
          <div className="mt-4 flex gap-3">
            <button
              className="px-4 py-2 rounded-md bg-tur1 text-azul hover:bg-tur2 transition"
              onClick={() => router.push('/dashboard/profile')}
            >
              Editar mi información
            </button>
            {isAdmin && (
              <button
                className="px-4 py-2 rounded-md bg-purple-500 text-white hover:bg-purple-600 transition"
                onClick={() => router.push('/dashboard/admin')}
              >
                Ver métricas (Admin)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


