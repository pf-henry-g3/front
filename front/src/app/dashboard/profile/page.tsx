'use client';

import { useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    userName: '',
    email: '',
    urlImage: '',
    roles: [],
  });

  if (user && form.email === '') {
    setForm({
      name: user.name || '',
      userName: user.userName || '',
      email: user.email || '',
      urlImage: user.urlImage || '',
      roles: user.roles || [],
    });
  }

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

  if (!user) {
    return (
      <div className="pt-20 px-6 md:px-12 lg:px-24">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm text-center text-gray-900">
          Redirigiendo...
        </div>
      </div>
    );
  }

  const handleChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(null);

    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
      if (!base) throw new Error('URL del backend no configurada');

      const res = await fetch(`${base}/user/${user.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          userName: form.userName,
          urlImage: form.urlImage,
        }),
      });

      if (!res.ok) throw new Error('Error actualizando el perfil');

      setOk('Perfil actualizado');
    } catch (err: any) {
      setError(err.message || 'Error actualizando el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-20 px-6 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Mi perfil</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2 flex items-center gap-4">
              <img
                src={form.urlImage || '/default-user.jpg'}
                alt="avatar"
                className="h-16 w-16 rounded-full object-cover border"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-800 mb-1 block">URL Imagen</label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-gray-900"
                  value={form.urlImage}
                  onChange={handleChange('urlImage')}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Nombre</label>
              <input className="rounded-md border px-3 py-2 text-gray-900"
                value={form.name}
                onChange={handleChange('name')} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Usuario</label>
              <input className="rounded-md border px-3 py-2 text-gray-900"
                value={form.userName}
                onChange={handleChange('userName')} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Email</label>
              <input disabled className="rounded-md border px-3 py-2 bg-gray-100 text-gray-900"
                value={form.email} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Fecha de nacimiento</label>
              <input
                type="date"
                className="rounded-md border px-3 py-2 text-gray-900"
                value={form.birthDate || ''}
                onChange={handleChange('birthDate')}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">Ciudad</label>
              <input className="rounded-md border px-3 py-2 text-gray-900"
                value={form.city}
                onChange={handleChange('city')} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-800 mb-1">País</label>
              <input className="rounded-md border px-3 py-2 text-gray-900"
                value={form.country}
                onChange={handleChange('country')} />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-800 mb-1">Sobre mí</label>
              <textarea
                className="rounded-md border px-3 py-2 text-gray-900"
                rows={4}
                value={form.aboutMe}
                onChange={handleChange('aboutMe')}
              />
            </div>

            {Array.isArray(form.roles) && form.roles.length > 0 && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-800 mb-1 block">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {form.roles.map((r, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-md bg-gray-200 text-gray-900 text-sm font-medium">
                      {r?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex gap-3 items-center">
              <button
                disabled={saving}
                className="px-4 py-2 rounded-md bg-tur1 text-azul hover:bg-tur2 transition disabled:opacity-60"
              >
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
