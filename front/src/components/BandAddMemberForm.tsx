"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

interface IUser {
  id: string;
  name: string;
  userName: string;
  email?: string;
  urlImage?: string;
}

interface Band {
  id: string;
  bandName: string;
}

export default function AddMemberForm() {
  const [bands, setBands] = useState<Band[]>([]);
  const [loadingBands, setLoadingBands] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);

  const [users, setUsers] = useState<IUser[]>([]);
  const [suggestions, setSuggestions] = useState<IUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const validationSchema = Yup.object({
  bandId: Yup.string()
    .required("Debes seleccionar una banda"),
  
  userName: Yup.string()
    .min(1, "El nombre de usuario no puede estar vacío. Por favor elige un usuario")
    .required("Debes escribir el usuario a agregar"),
});

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user?.id || null);
    }
  }, []);

  // Cargar bandas del líder
  useEffect(() => {
    if (!userId) return;

    const fetchBands = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/band/bandOfUser/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const bandData: Band[] = res.data.data.map((b: any) => ({
          id: b.id,
          bandName: b.bandName,
        }));

        setBands(bandData);
      } catch (error) {
        console.error("Error cargando bandas:", error);
        setBands([]);
      } finally {
        setLoadingBands(false);
      }
    };

    fetchBands();
  }, [userId]);

  // Cargar todos los usuarios (para sugerencias)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.data || []);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };
    fetchUsers();
  }, []);

  const formik = useFormik({
    initialValues: {
      bandId: "",
      userName: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const token = localStorage.getItem("access_token");
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/band/addMember/${values.bandId}`,
          { userName: values.userName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire({
        icon: "success",
        title: "Miembro agregado",
        text: `${values.userName} fue agregado a la banda`,
      });

        formik.resetForm();
        setSuggestions([]);
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          
          if (status === 401) {
            Swal.fire({
              icon: "error",
              title: "Credenciales inválidas",
              text: "Tu sesión ha expirado o tus credenciales son inválidas.",
            });
          } else if (status === 400) {
            Swal.fire({
              icon: "error",
              title: "Miembro ya agregado",
              text: `${values.userName} ya ha sido agregado a esta banda.`,
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Ocurrió un error al agregar al miembro.",
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ocurrió un error al agregar al miembro.",
          });
        }
      }
    },
  });

  // Filtrado de sugerencias
  const filterUsers = (term: string): IUser[] => {
    const t = term?.trim().toLowerCase();
    if (!t) return [];
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(t) ||
        u.userName?.toLowerCase().includes(t) ||
        u.email?.toLowerCase().includes(t)
    );
  };

  const onSearchInput = (value: string) => {
    formik.setFieldValue("userName", value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSuggestions(filterUsers(value));
    }, 300);
  };

  const selectUser = (user: IUser) => {
    formik.setFieldValue("userName", user.userName);
    setSuggestions([]);
  };

  return (
    <div className="mt-20">
      <h1 className="text-center text-txt1 font-bold text-4xl mb-10">Agrega artistas a tu banda</h1>
      <div className="container max-w-[76%] mx-auto bg-azul border border-tur2/30 shadow-2xl rounded-xl py-8 px-16">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Select de bandas */}
          <div>
            <label className="text-xl block font-bold mb-1">Selecciona una banda:</label>
            {loadingBands ? (
              <p>Cargando bandas...</p>
            ) : (
            <div>
              <select
                value={formik.values.bandId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="bandId"
                className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 ${
                  formik.touched.bandId && formik.errors.bandId
                    ? "border-red-500 focus:ring-red-500"
                    : "border-white/20 focus:ring-tur2 focus:border-tur2"
                }`}
              >
                <option value="" className="bg-txt1 text-azul font-semibold">
                  - Selecciona una banda -
                </option>
                {bands.map((band) => (
                  <option key={band.id} value={band.id} className="bg-txt1 text-oscuro2 txt-xl">
                    {band.bandName}
                  </option>
                ))}
              </select>
              
              {formik.touched.bandId && formik.errors.bandId && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.bandId}</p>
              )}
            </div>
            )}
          </div>
          
          {/* Input usuario con sugerencias */}
          <div className="pb-2">
            <label className="block text-xl font-bold mb-1">Usuario a agregar:</label>
            <input
              type="text"
              name="userName"
              placeholder="Escribe nombre de usuario..."
              value={formik.values.userName}
              onChange={(e) => onSearchInput(e.target.value)}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 ${formik.touched.userName && formik.errors.userName
                ? "border-red-500 focus:ring-red-500"
                : "border-white/20 focus:ring-t-tur2 focus:ring-x-tur2 focus:border-tur2"
              }`}
            />

            {formik.touched.userName && formik.errors.userName && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.userName}</p>
            )}
            {/* Lista de sugerencias */}
            {suggestions.length > 0 && (
              <ul className="bg-white rounded-b shadow max-h-40 z-10 overflow-auto">
                {suggestions.map((u) => (
                  <li
                  key={u.id}
                  className="px-3 py-2 cursor-pointer bg-txt1 text-md font-semibold text-oscuro2 transition hover:bg-blue-500"
                  onClick={() => selectUser(u)}
                  >
                    {u.userName} ({u.name})
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300 transform ${!formik.isValid || formik.isSubmitting
              ? "bg-gray-400 cursor-not-allowed opacity-50"
              : "bg-linear-to-r from-tur1 to-tur2 text-azul cursor-pointer hover:from-tur2 hover:to-tur3 hover:shadow-xl hover:scale-105"
            }`}
            >
            {formik.isSubmitting ? "Agregando artista..." : "🎤 Agregar Artista"}
          </button>
        </form>
      </div>
    </div>
  );
}
