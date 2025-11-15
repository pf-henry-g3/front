'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext'

export default function DashboardHome() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Verificar si el usuario es admin
  const isAdmin =
    user?.roles?.some(
      role => role.name === 'Admin' || role.name === 'SuperAdmin'
    ) || false;

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tur1 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, useAuth ya redirigió a /login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl border bg-white/70 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">
            Bienvenido{user.userName ? `, ${user.userName}` : ''}
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona tu perfil y accede a herramientas.
          </p>

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
