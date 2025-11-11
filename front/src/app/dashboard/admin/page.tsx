'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function decodeJwt(token?: string | null): any | null {
  try {
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function AdminMetricsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const payload = decodeJwt(token);
    const roles: string[] = Array.isArray(payload?.roles) ? payload.roles : [];
    const isAdmin = roles.includes('Admin') || roles.includes('SuperAdmin');
    if (!token || !isAdmin) {
      setAuthorized(false);
      setError('No autorizado');
      return;
    }
    setAuthorized(true);
  }, []);

  if (!authorized) {
    return (
      <div className="pt-20 px-6 md:px-12 lg:px-24">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">
          {error || 'No autorizado'}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">
          <h3 className="text-sm text-gray-500">Usuarios</h3>
          <div className="mt-2 text-3xl font-semibold">—</div>
          <p className="text-xs text-gray-400 mt-1">Total registrados</p>
        </div>
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">
          <h3 className="text-sm text-gray-500">Bandas</h3>
          <div className="mt-2 text-3xl font-semibold">—</div>
          <p className="text-xs text-gray-400 mt-1">Total creadas</p>
        </div>
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">
          <h3 className="text-sm text-gray-500">Vacantes</h3>
          <div className="mt-2 text-3xl font-semibold">—</div>
          <p className="text-xs text-gray-400 mt-1">Publicadas</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white/70 p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Actividad reciente</h3>
        <p className="text-sm text-gray-500 mt-2">Próximamente: métricas y gráficos.</p>
      </div>
    </div>
  );
}


