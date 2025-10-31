"use client";

import { useRouter } from "next/navigation";

export default function AuthButtons () {
    const router = useRouter();
  
    return (
        <div className='flex items-center space-x-4'>
                <button 
                    className="bg-tur1 py-1.5 px-4 rounded-md text-azul text-lg font-sans shadow-xl transition duration-300 hover:bg-tur2 hover:text-oscuro2 hover:-translate-y-0.5 hover:cursor-pointer flex items-center gap-2" 
                    onClick={() => {router.push("/login");}}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Iniciar Sesión
                </button>

                <button 
                    className="py-1.5 rounded-md px-4 text-tur3 text-lg font-sans border border-fondo1 transition duration-400 hover:bg-tur3 hover:border-verde hover:text-azul hover:-translate-y-0.5 hover:cursor-pointer flex items-center gap-2" 
                    onClick={() => {router.push("/register");}}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Registrarse
                </button>
            </div>
    )
}