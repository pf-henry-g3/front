'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext'
import { useEffect } from 'react';

export default function DashboardHome() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Verificar si el usuario es admin
  const isAdmin =
    user?.roles?.some(
      role => role.name === 'Admin' || role.name === 'SuperAdmin'
    ) || false;

  // Redirigir automáticamente a admin si es SuperAdmin o Admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace('/dashboard/admin');
    } else if (!loading && user && !isAdmin) {
      router.replace('/dashboard/profile');
    }
  }, [user, loading, isAdmin, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tur1 mx-auto"></div>
          <p className="mt-4 text-txt1">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, useAuth ya redirigió a /login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="mt-4 text-txt1">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 md:px-12 lg:px-24 ">
      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-xl max-w-[%75] border border-tur1 bg-azul p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-oscuro1">
            Bienvenido{user.userName ? `, ${user.userName}` : ''}
          </h1>
          <p className="mt-2 text-txt1">
            Gestiona tu perfil y accede a herramientas.
          </p>

          <div className="mt-4 flex gap-3">
            <button
              className="px-4 py-2 rounded-md bg-tur1 shadow-md text-oscuro3 hover:bg-tur2 transition"
              onClick={() => router.push('/dashboard/profile')}
            >
              Editar mi información
            </button>

            {isAdmin && (
              <button
                className="px-4 py-2 rounded-md bg-purple-500 shadow-md text-white hover:bg-purple-600 transition"
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
