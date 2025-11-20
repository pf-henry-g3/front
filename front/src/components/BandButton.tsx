'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BandButton() {
  const { isAuthenticated: isAuth0Authenticated, isLoading } = useAuth0();
  const router = useRouter();
  const [hasLocalToken, setHasLocalToken] = useState(false);

  // ✅ Verificar si hay token en localStorage (login normal)
  useEffect(() => {
    const checkLocalAuth = () => {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      setHasLocalToken(!!(token && user));
    };

    checkLocalAuth();

    // ✅ Escuchar cambios en la autenticación
    window.addEventListener('auth-changed', checkLocalAuth);
    window.addEventListener('storage', checkLocalAuth);

    return () => {
      window.removeEventListener('auth-changed', checkLocalAuth);
      window.removeEventListener('storage', checkLocalAuth);
    };
  }, []);

  // No mostrar nada mientras carga
  if (isLoading) {
    return null;
  }

  // ✅ Verificar AMBOS tipos de autenticación
  const isAuthenticated = isAuth0Authenticated || hasLocalToken;

  // Solo mostrar si el usuario está autenticado (cualquier método)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='flex items-center space-x-4'>
      <button
        className="jsx-fd0de145dd41e0c2 inline-block px-8 py-4 bg-gradient-to-r from-tur2 to-tur1 text-oscuro2 font-bold text-lg rounded-xl cursor-pointer hover:from-tur1 hover:to-tur2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        onClick={() => router.push("/dashboard/profile/mybands")}
      >
        Mis bandas
      </button>
    </div>
  );
}