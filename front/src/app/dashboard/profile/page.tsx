'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  name?: string;
  userName?: string;
  email?: string;
  city?: string;
  country?: string;
  aboutMe?: string;
  urlImage?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    try {
      const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (u) setUser(JSON.parse(u));
    } catch {
      // ignore
    }
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          userName: user.userName,
          city: user.city,
          country: user.country,
          aboutMe: user.aboutMe,
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

  if (!user) {
    return (
      <div className="pt-20 px-6 md:px-12 lg:px-24">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">Cargando perfil…</div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Mi perfil</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Nombre</label>
              <input className="rounded-md border px-3 py-2" value={user.name || ''} onChange={handleChange('name')} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Usuario</label>
              <input className="rounded-md border px-3 py-2" value={user.userName || ''} onChange={handleChange('userName')} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Ciudad</label>
              <input className="rounded-md border px-3 py-2" value={user.city || ''} onChange={handleChange('city')} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">País</label>
              <input className="rounded-md border px-3 py-2" value={user.country || ''} onChange={handleChange('country')} />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-gray-600 mb-1">Sobre mí</label>
              <textarea className="rounded-md border px-3 py-2" rows={4} value={user.aboutMe || ''} onChange={handleChange('aboutMe')} />
            </div>
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


