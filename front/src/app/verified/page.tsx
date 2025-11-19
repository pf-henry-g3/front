"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

// 1. Creamos un componente interno con TODA la lógica
function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No se encontró un token de verificación.");
      return;
    }

    const verifyToken = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3013";

        const res = await fetch(`${backendUrl}user/verify?token=${token}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Error al verificar");
        }

        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(error.message || "El token es inválido o ha expirado.");
      }
    };

    verifyToken();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex flex-col text-center mx-auto w-lg min-h-screen mt-32 gap-4">
        <h1 className="text-txt1 text-3xl animate-pulse">Verificando tu cuenta...</h1>
        <p className="text-txt2 text-xl">Por favor espera un momento.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col text-center mx-auto w-lg min-h-screen mt-32 gap-1">
        <h1 className="text-red-500 text-3xl">¡Ups! Hubo un problema</h1>
        <p className="text-txt2 text-xl">{errorMessage}</p>
        <Link
          href={"/login"}
          className="bg-gray-300 py-1.5 px-4 mt-8 rounded-md mx-auto text-black text-xl"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-center mx-auto w-lg min-h-screen mt-32 gap-1">
      <h1 className="text-txt1 text-3xl">¡Gracias por registrarte!</h1>
      <p className="text-txt2 text-xl">Tu cuenta ha sido verificada correctamente</p>
      <Link
        href={"/home"}
        className="bg-tur1 py-1.5 px-4 mt-8 rounded-md min-w-65 max-w-70 mx-auto text-azul text-2xl font-sans shadow-xl transition duration-300 hover:bg-tur2 hover:text-oscuro2 hover:-translate-y-0.5 hover:cursor-pointer flex items-center gap-2"
      >
        ↪ Seguir explorando
      </Link>
    </div>
  );
}

// 2. El componente principal exportado por defecto SOLO contiene el Suspense
export default function VerificatedPage() {
  return (
    // El fallback es lo que se ve un milisegundo mientras Next.js carga los params
    <Suspense fallback={<div className="text-center mt-32">Cargando verificación...</div>}>
      <VerificationContent />
    </Suspense>
  );
}