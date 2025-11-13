'use client';

import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import Router, { useRouter } from 'next/navigation';


export default function VacantButton() {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  // No mostrar nada mientras carga
  if (isLoading) {
    return null;
  }

  // Solo mostrar si el usuario está autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='flex items-center space-x-4'>
    <button
        className="text-sm bg-azul py-1.5 px-4 rounded-md text-text2 font-sans shadow-xl transition duration-300 hover:bg-verde hover:text-txt1 hover:cursor-pointer flex items-center gap-2" 
        onClick={() => {router.push("/vacancy");}}
      
    >
      📢 Publicar Vacante
    </button>
    </div>

  );
}