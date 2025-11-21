'use client';

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface IUser {
  id: string;
  email: string;
  userName: string;
  name: string;
  birthDate?: string;
  aboutMe?: string;
  city?: string;
  country?: string;
  address?: string;
  urlImage?: string;
  genres?: Array<{ id: string; name: string }>;
  roles?: Array<{ id: string; name: string }>;
}

export default function ProfileView() {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          await Swal.fire({
            icon: "warning",
            title: "Sesión requerida",
            text: "Debes iniciar sesión.",
            confirmButtonColor: "#F59E0B",
          });
          router.push("/login");
          return;
        }

        const parsedUser: IUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-txt1">Cargando perfil...</span>
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-txt1">No se encontró el usuario</span>
      </div>
    );

  return (
    <div className=" bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3  px-4 sm:px-6 lg:px-8">
      <div className="container max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 md:p-10 lg:p-12">
          
          {/* FOTO */}
          <div className="text-center mb-10">
            <img
              src={user.urlImage || "https://via.placeholder.com/200x200?text=Sin+Foto"}
              alt="Foto de perfil"
              className="w-48 h-48 mx-auto rounded-full border-4 border-tur3 shadow-xl object-cover"
            />

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              {user.name || "Sin nombre"}
            </h1>

            <p className="text-gray-600 text-lg">@{user.userName}</p>

            
          </div>

          <hr className="my-10 border-gray-300" />

          {/* INFO GENERAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📧 Email</h2>
              <p className="text-gray-700 text-lg">{user.email}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🌍 Ubicación</h2>
              <p className="text-gray-700 text-lg">
                {user.city ? `${user.city}, ${user.country}` : "Sin ubicación"}
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 shadow-sm md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏠 Dirección</h2>
              <p className="text-gray-700 text-lg">
                {user.address || "No especificada"}
              </p>
            </div>
          </div>

          <hr className="my-10 border-gray-300" />

          {/* SOBRE MI */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 Sobre mí</h2>

            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
              <p className="text-gray-700 text-lg whitespace-pre-line">
                {user.aboutMe || "Este usuario todavía no escribió una descripción."}
              </p>
            </div>
          </div>

          <hr className="my-10 border-gray-300" />

          {/* GENEROS */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎵 Géneros musicales</h2>

            <div className="flex flex-wrap gap-3">
              {user.genres?.length ? (
                user.genres.map(g => (
                  <span
                    key={g.id}
                    className="bg-tur2 text-white px-5 py-2 rounded-full font-semibold shadow-md"
                  >
                    {g.name}
                  </span>
                ))
              ) : (
                <p className="text-gray-600">Sin géneros seleccionados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
