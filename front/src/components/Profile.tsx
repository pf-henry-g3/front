'use client';

import { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext'; // Tu contexto real
import { useRouter } from 'next/navigation';

export default function DashboardProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  if (!user) return null; // La protección ya debería estar en el layout o useEffect

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* COLUMNA IZQUIERDA: Resumen y Menú */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
            <img
              src={user.urlImage || '/default-user.jpg'}
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-tur1 p-1"
              alt="Avatar"
            />
            <h2 className="mt-4 font-bold text-xl text-gray-800">{user.name}</h2>
            <p className="text-gray-500 text-sm">@{user.userName}</p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-2 px-4 rounded-lg text-left transition-all ${activeTab === 'info' ? 'bg-tur1/10 text-tur3 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                👤 Mis Datos
              </button>
              <button
                onClick={() => router.push('/dashboard/bands')} // Ejemplo de navegación
                className="py-2 px-4 rounded-lg text-left hover:bg-gray-50 text-gray-600 transition-all"
              >
                🎸 Mis Bandas
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-4 rounded-lg text-left transition-all ${activeTab === 'security' ? 'bg-tur1/10 text-tur3 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                🔒 Seguridad
              </button>
            </div>

            <hr className="my-6 border-gray-100" />

            <button
              onClick={logout}
              className="w-full py-2 px-4 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: Contenido Dinámico */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Header del contenido */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg">
                {activeTab === 'info' ? 'Información Personal' : 'Seguridad de la cuenta'}
              </h3>
              {activeTab === 'info' && (
                <button className="text-sm text-tur3 font-medium hover:underline">
                  Editar información
                </button>
              )}
            </div>

            {/* Body del contenido */}
            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email</label>
                      <p className="text-gray-800 font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Fecha Nacimiento</label>
                      <p className="text-gray-800 font-medium">{user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'No definida'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ciudad</label>
                      <p className="text-gray-800 font-medium">{user.city || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">País</label>
                      <p className="text-gray-800 font-medium">{user.country || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Sobre mí</label>
                    <p className="text-gray-600 mt-2 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                      {user.aboutMe || "No has escrito nada sobre ti aún."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="text-center py-10 text-gray-500">
                  <p>Aquí iría el formulario para cambiar contraseña o activar 2FA.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}