'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VacantButton() {
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
        className="text-md text-text2 font-sans shadow-xl transition duration-300 hover:text-tur2 hover:cursor-pointer flex items-center gap-22"
        onClick={() => router.push("/vacancy")}
      >
        Publicar Vacante
      </button>
    </div>
  );
}