'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function VacantButton() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  // No mostrar nada mientras carga
  if (loading) {
    console.log('⏳ VacantButton - Esperando verificación de autenticación...');
    return null;
  }

  // Solo mostrar si el usuario está autenticado
  if (!isAuthenticated || !user) {
    console.log('❌ VacantButton - Usuario no autenticado, ocultando botón');
    return null;
  }

  console.log('✅ VacantButton - Mostrando botón para:', user.userName);

  return (
    <div className='flex items-center space-x-4'>
      <button
        className="text-sm bg-azul py-1.5 px-4 rounded-md text-text2 font-sans shadow-xl transition duration-300 hover:bg-verde hover:text-txt1 hover:cursor-pointer flex items-center gap-2" 
        onClick={() => {
          console.log('🖱️ VacantButton - Navegando a /vacancy');
          router.push("/vacancy");
        }}
      >
        <span>🎵</span>
        Publicar Vacante
      </button>
    </div>
  );
}