'use client';

import { useAuth } from '@/src/hooks/useAuth';

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-state flex items-center justify-center min-h-screen">
        <div className="loading-text text-gray-600">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="profile-card action-card mx-auto mt-10 max-w-md bg-white rounded-xl shadow p-6">
      {user.urlImage && (
        <img
          src={user.urlImage}
          alt={user.name || 'Foto de perfil'}
          className="w-32 h-32 mx-auto rounded-full object-cover"
        />
      )}

      <h2 className="text-2xl font-semibold text-center mt-4">
        {user.userName || user.name}
      </h2>

      <p className="text-center text-gray-600">{user.email}</p>

      <div className="mt-4">
        <h3 className="font-semibold">Roles:</h3>
        <ul className="list-disc ml-6 text-gray-700">
          {user.roles?.map((r, i) => (
            <li key={i}>{r.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
