'use client';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function AuthButton() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Hola, {user.name}</span>
        <a href="/api/auth/logout" className="btn">
          Cerrar Sesión
        </a>
      </div>
    );
  }

  return (
    <a href="/api/auth/login" className="btn">
      Iniciar Sesión
    </a>
  );
}