'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  name?: string;
  userName?: string;
  email?: string;
  birthDate?: string;
  city?: string;
  country?: string;
  aboutMe?: string;
  urlImage?: string;
  roles?: Array<{ id?: string; name?: string }>;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (!token) {
          setError('No autenticado');
          setLoading(false);
          return;
        }

        const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        let userId: string | null = null;
        let userFromStorage: User | null = null;
        
        if (u) {
          try {
            const parsed = JSON.parse(u);
            if (parsed?.id) {
              userId = parsed.id;
              userFromStorage = parsed;
            }
          } catch {
            // ignore
          }
        }

        if (!userId) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload?.sub || payload?.id || null;
          } catch {
            // ignore
          }
        }

        if (!userId) {
          if (userFromStorage) {
            setUser(userFromStorage);
            setLoading(false);
            return;
          }
          setError('No se encontró ID de usuario');
          setLoading(false);
          return;
        }

        if (userFromStorage) {
          setUser(userFromStorage);
        }

        const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
        if (!base) {
          if (userFromStorage) {
            setLoading(false);
            return;
          }
          setError('URL del backend no configurada');
          setLoading(false);
          return;
        }

        try {
          const res = await fetch(`${base}/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) {
            if (userFromStorage) {
              setLoading(false);
              return;
            }
            throw new Error('Error al cargar el perfil');
          }

          const data = await res.json();
          const userData = data?.data || data;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
          } else if (!userFromStorage) {
            throw new Error('No se recibieron datos del servidor');
          }
        } catch (fetchError) {
          if (!userFromStorage) {
            throw fetchError;
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleChange = (key: keyof User) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUser(prev => (prev ? { ...prev, [key]: e.target.value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token || !user?.id) throw new Error('No autenticado');
      const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
      if (!base) throw new Error('URL del backend no configurada');
      const res = await fetch(`${base}/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          userName: user.userName,
          birthDate: user.birthDate,
          city: user.city,
          country: user.country,
          aboutMe: user.aboutMe,
          urlImage: user.urlImage,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Error actualizando el perfil');
      }
      const updated = await res.json();
      // Intenta guardar versión nueva si API devuelve el usuario
      if (updated?.data) {
        localStorage.setItem('user', JSON.stringify(updated.data));
        setUser(updated.data);
      }
      setOk('Perfil actualizado');
    } catch (err: any) {
      setError(err.message || 'Error actualizando el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 px-6 md:px-12 lg:px-24">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-tur1 mr-2"></div>
          <span className="text-gray-900">Cargando perfil…</span>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="pt-20 px-6 md:px-12 lg:px-24">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm text-center text-red-700 font-medium">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-20 px-6 md:px-12 lg:px-24">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm text-center text-gray-900">
          No se pudo cargar el perfil
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Mi perfil</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Imagen de perfil */}
            <div className="md:col-span-2 flex items-center gap-4">
              <img
                src={user.urlImage || '/default-user.jpg'}
                alt="avatar"
                className="h-16 w-16 rounded-full object-cover border"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-800 mb-1 block">URL Imagen</label>
                <input className="w-full rounded-md border px-3 py-2 text-gray-900" value={user.urlImage || ''} onChange={handleChange('urlImage')} />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Nombre</label>
              <input className="rounded-md border px-3 py-2 text-gray-900" value={user.name || ''} onChange={handleChange('name')} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Usuario</label>
              <input className="rounded-md border px-3 py-2 text-gray-900" value={user.userName || ''} onChange={handleChange('userName')} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Email</label>
              <input className="rounded-md border px-3 py-2 bg-gray-100 text-gray-900" value={user.email || ''} disabled />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Fecha de nacimiento</label>
              <input 
                type="date" 
                className="rounded-md border px-3 py-2 text-gray-900" 
                value={user.birthDate ? (user.birthDate.includes('T') ? user.birthDate.split('T')[0] : user.birthDate) : ''} 
                onChange={handleChange('birthDate')} 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Ciudad</label>
              <input className="rounded-md border px-3 py-2 text-gray-900" value={user.city || ''} onChange={handleChange('city')} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">País</label>
              <input className="rounded-md border px-3 py-2 text-gray-900" value={user.country || ''} onChange={handleChange('country')} />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-800 mb-1">Sobre mí</label>
              <textarea className="rounded-md border px-3 py-2 text-gray-900" rows={4} value={user.aboutMe || ''} onChange={handleChange('aboutMe')} />
            </div>

            {/* Roles solo lectura */}
            {Array.isArray(user.roles) && user.roles.length > 0 && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-800 mb-1 block">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((r, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-md bg-gray-200 text-gray-900 text-sm font-medium">{r?.name}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex gap-3 items-center">
              <button disabled={saving} className="px-4 py-2 rounded-md bg-tur1 text-azul hover:bg-tur2 transition disabled:opacity-60">
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              {ok && <span className="text-green-600 text-sm">{ok}</span>}
              {error && <span className="text-red-600 text-sm">{error}</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


