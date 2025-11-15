"use client"

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as Yup from "yup";
import IUser from "../interfaces/IUser";

interface IBandMember {
  userId?: string;
  isOpen: boolean;
}

interface CreateBandDto {
  bandName: string;
  bandDescription: string;
  formationDate: string;
  urlImage: string;
  genres: string[];
  members: IBandMember[];
}

const validationSchema = Yup.object({
  bandName: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .required("El nombre de la banda es requerido"),

  genres: Yup.array()
    .of(Yup.string())
    .min(1, "Debes seleccionar al menos un género")
    .max(5, "No puedes seleccionar más de 5 géneros")
    .required("Los géneros son requeridos"),

  urlImage: Yup.string()
    .url("Debe ser una URL válida")
    .required("La imagen es requerida"),

  bandDescription: Yup.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .required("La descripción es requerida"),

  formationDate: Yup.date()
  .typeError("Debe ser una fecha válida")
  .max(new Date(), "La fecha no puede ser posterior a hoy")
  .required("La fecha de formación es obligatoria"),

  members: Yup.array().of(
    Yup.object().shape({
      isOpen: Yup.boolean().required(),
      userId: Yup.string().when("isOpen", {
        is: false,
        then: schema => schema.required("Selecciona un usuario o marca como puesto libre"),
        otherwise: schema => schema.notRequired()
      })
    })
  )

});

export default function BandForm() {
  const router = useRouter();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});
  const [suggestions, setSuggestions] = useState<Record<number, IUser[]>>({});
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const debounceRef = useRef<Record<number, number>>({});

  // Cargar todos los usuarios al montar
  useEffect(() => {
    let mounted = true;
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`);
        if (mounted) {
          const data = Array.isArray(res.data) ? res.data : res.data.data || [];
          setUsers(data);
        }
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };
    fetchAllUsers();
    return () => { mounted = false; };
  }, []);

  const formik = useFormik<CreateBandDto>({
    initialValues: {
      bandName: "",
      genres: [],
      urlImage: "",
      bandDescription: "",
      formationDate: "",
      members: [{ userId: "", isOpen: false }]
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      console.log("ejecutado submit")
      try {
        setSubmitting(true);

        // Crear la banda
        const bandPayload = {
          bandName: values.bandName,
          bandDescription: values.bandDescription,
          formationDate: values.formationDate,
          genres: values.genres.join(", "),
          bandImage: values.urlImage,
        };
        console.log("Haciendo POST:", bandPayload);
        const bandRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/band`,
          bandPayload,
          { headers: { "Content-Type": "application/json" } }
        );

        if (bandRes.status === 200 || bandRes.status === 201) {
          const bandId = bandRes.data.id || bandRes.data._id;

          // Agregar miembros a la banda
          for (const member of values.members) {
            if (member.userId && !member.isOpen) {
              try {
                await axios.post(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/band/addMember/${bandId}`,
                  { userId: member.userId },
                  { headers: { "Content-Type": "application/json" } }
                );
              } catch (err) {
                console.error("Error al agregar miembro:", err);
              }
            }
          }

          await Swal.fire({
            icon: "success",
            title: "¡Banda creada!",
            text: "La banda se ha publicado exitosamente",
            confirmButtonText: "Continuar",
            confirmButtonColor: "#10B981",
            timer: 2000
          });

          resetForm();
          router.push("/bands");
        }
      } catch (error) {
        const axiosError = error as any;
        console.error("Error creando banda:", axiosError);

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al crear la banda. Inténtalo de nuevo más tarde.",
          confirmButtonColor: "#EF4444"
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Sincronizar searchTerms y suggestions cuando cambia la cantidad de miembros
  useEffect(() => {
    const len = formik.values.members.length;
    setSearchTerms(prev => {
      const copy = [...prev];
      while (copy.length < len) copy.push("");
      while (copy.length > len) copy.pop();
      return copy;
    });
    setSuggestions(prev => {
      const copy: Record<number, IUser[]> = {};
      for (let i = 0; i < len; i++) {
        copy[i] = prev[i] || [];
      }
      return copy;
    });
    setLoadingUsers(prev => {
      const copy: Record<number, boolean> = {};
      for (let i = 0; i < len; i++) copy[i] = prev[i] || false;
      return copy;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.members.length]);

  const filterUsers = (term: string): IUser[] => {
    const t = term?.trim().toLowerCase();
    if (!t || t.length === 0) return [];
    return users.filter(u =>
      (u.name?.toLowerCase().includes(t) ||
        u.userName?.toLowerCase().includes(t) ||
        u.email?.toLowerCase().includes(t))
    );
  };

  const onSearchInput = (index: number, value: string) => {
    // Limpiar selección cuando se empieza a escribir
    const membersCopy = [...formik.values.members];
    membersCopy[index] = { ...membersCopy[index], userId: "", isOpen: false };
    formik.setFieldValue("members", membersCopy);

    setSearchTerms(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });

    // Debounce para filtrar
    if (debounceRef.current[index]) {
      window.clearTimeout(debounceRef.current[index]);
    }
    debounceRef.current[index] = window.setTimeout(() => {
      const filtered = filterUsers(value);
      setSuggestions(s => ({ ...s, [index]: filtered }));
    }, 300);
  };

  const selectUser = (index: number, user: IUser) => {
    const membersCopy = [...formik.values.members];
    membersCopy[index] = { userId: user.id, isOpen: false };
    formik.setFieldValue("members", membersCopy);

    setSearchTerms(prev => {
      const copy = [...prev];
      copy[index] = user.name;
      return copy;
    });
    setSuggestions(s => ({ ...s, [index]: [] }));
  };

  const markAsOpen = (index: number) => {
    const membersCopy = [...formik.values.members];
    membersCopy[index] = { userId: "", isOpen: true };
    formik.setFieldValue("members", membersCopy);

    setSearchTerms(prev => {
      const copy = [...prev];
      copy[index] = "Puesto libre";
      return copy;
    });
    setSuggestions(s => ({ ...s, [index]: [] }));
  };

  const addMember = () => {
    formik.setFieldValue("members", [
      ...formik.values.members,
      { userId: "", isOpen: false }
    ]);
    setSearchTerms(prev => [...prev, ""]);
  };

  const removeMember = (index: number) => {
    const arr = [...formik.values.members];
    arr.splice(index, 1);
    formik.setFieldValue("members", arr);

    setSearchTerms(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    setSuggestions(s => {
      const copy: Record<number, IUser[]> = {};
      Object.keys(s).forEach(k => {
        const i = Number(k);
        if (i < index) copy[i] = s[i];
        else if (i > index) copy[i - 1] = s[i];
      });
      return copy;
    });
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="container max-w-[80%] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-txt1 mb-2">🎸 Crear Nueva Banda</h2>
          <p className="text-txt2 text-lg">Configura tu banda: géneros, miembros y más.</p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="bg-azul  border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10"
        >
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* Géneros - Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6 xl:sticky xl:top-6">
                <label className="block text-xl font-bold text-txt1 mb-4">
                  🎵 Géneros Principales *
                </label>
                <p className="text-sm text-txt2 mb-4">Selecciona de 1 a 5 géneros</p>

                <div className="space-y-3">
                  {[
                    "Rock",
                    "Pop",
                    "Jazz",
                    "Blues",
                    "Metal",
                    "Folk",
                    "Electrónica",
                    "Hip Hop"
                  ].map(genre => (
                    <label
                      key={genre}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                        formik.values.genres.includes(genre)
                          ? "bg-tur2 text-azul shadow-md transform scale-105"
                          : "bg-white/5 hover:bg-white/10 text-txt1"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="genres"
                        value={genre}
                        checked={formik.values.genres.includes(genre)}
                        onChange={e => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            formik.setFieldValue("genres", [
                              ...formik.values.genres,
                              value
                            ]);
                          } else {
                            formik.setFieldValue(
                              "genres",
                              formik.values.genres.filter(g => g !== value)
                            );
                          }
                        }}
                        className="mr-3 w-5 h-5 accent-tur2"
                      />
                      <span className="font-medium">{genre}</span>
                    </label>
                  ))}
                </div>

                {formik.touched.genres && formik.errors.genres && (
                  <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    ⚠️ {String(formik.errors.genres)}
                  </p>
                )}

                <div className="mt-4 p-3 bg-tur1/20 border border-tur1/30 rounded-lg text-center">
                  <p className="text-txt1 font-semibold">
                    {formik.values.genres.length} / 5 géneros
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario principal */}
            <div className="xl:col-span-3 space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-lg font-bold text-txt1 mb-2">
                  🎤 Nombre de la Banda *
                </label>
                <input
                  id="bandName"
                  name="bandName"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.bandName}
                  className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 ${
                    formik.touched.bandName && formik.errors.bandName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:ring-tur2 focus:border-tur2"
                  }`}
                  placeholder="Ej: Los Acordes Salvajes"
                />
                {formik.touched.bandName && formik.errors.bandName && (
                  <p className="mt-2 text-sm text-red-400">{formik.errors.bandName}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="bandDescription"
                  className="block text-lg font-bold text-txt1 mb-2"
                >
                  📝 Descripción *
                </label>
                <textarea
                  id="bandDescription"
                  name="bandDescription"
                  rows={4}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.bandDescription}
                  className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 resize-none ${
                    formik.touched.bandDescription && formik.errors.bandDescription
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:ring-tur2 focus:border-tur2"
                  }`}
                  placeholder="Describe la banda, estilo, trayectoria, etc."
                />
                {formik.touched.bandDescription && formik.errors.bandDescription && (
                  <p className="mt-2 text-sm text-red-400">
                    {formik.errors.bandDescription}
                  </p>
                )}
              </div>

              {/* Imagen */}
              <div>
                <label htmlFor="bandImage" className="block text-lg font-bold text-txt1 mb-2">
                  🖼️ URL de Imagen *
                </label>
                <input
                  id="urlImage"
                  name="urlImage"
                  type="url"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.urlImage}
                  className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 ${
                    formik.touched.urlImage && formik.errors.urlImage
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/20 focus:ring-tur2 focus:border-tur2"
                  }`}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formik.touched.urlImage && formik.errors.urlImage && (
                  <p className="mt-2 text-sm text-red-400">{formik.errors.urlImage}</p>
                )}

                {formik.values.urlImage && !formik.errors.urlImage && (
                  <div className="mt-4">
                    <p className="text-sm text-txt2 mb-2">Vista previa:</p>
                    <img
                      src={formik.values.urlImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-white/20"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=Imagen+no+disponible";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Fecha de formación */}
              <div>
                <label htmlFor="formationDate" className="block text-lg font-bold text-txt1 mb-2">
                  📅 Fecha de formación *
                </label>

                <input
                  id="formationDate"
                  name="formationDate"
                  type="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.formationDate}
                  className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 
                    ${formik.touched.formationDate && formik.errors.formationDate ? "border-red-500" : "border-white/20"}
                  `}
                />

                {formik.touched.formationDate && formik.errors.formationDate && (
                  <p className="mt-2 text-sm text-red-400">{formik.errors.formationDate}</p>
                )}
              </div>


              {/* Miembros */}
              <div>
                <label className="block text-lg font-bold text-txt1 mb-2">
                  👥 Miembros
                </label>
                <span className="mb-3 flex flex-row justify-between ">
                  <p className="text-sm mt-2.5 pl-0.5 text-txt2 ">
                    Escribe para buscar artistas. También puedes marcar el puesto como libre.
                    </p>
                  <button
                  type="button"
                  onClick={() => addMember()}
                  className="px-4 py-2 bg-tur1 text-azul rounded-md cursor-pointer hover:bg-tur2 transition font-semibold"
                >
                  + Añadir miembro
                </button>
                </span>
                
                

                <div className="space-y-3">
                  {formik.values.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="relative"
                    >
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={searchTerms[idx] ?? ""}
                            onChange={e => onSearchInput(idx, e.target.value)}
                            placeholder="Buscar usuario por nombre..."
                            className="w-full bg-transparent border border-white/20 rounded-md px-3 py-2 text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 focus:ring-tur2 focus:border-tur2"
                          />

                          {/* Sugerencias */}
                          {suggestions[idx] && suggestions[idx].length > 0 && (
                            <ul className="absolute z-20 left-3 right-3 mt-1 bg-white/95 text-black rounded-md shadow-lg max-h-56 overflow-auto">
                              {suggestions[idx].map(user => (
                                <li
                                  key={user.id}
                                  onClick={() => selectUser(idx, user)}
                                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex flex-col"
                                >
                                  <span className="font-semibold">{user.name}</span>
                                  <span className="text-xs text-gray-600">
                                    @{user.userName}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          
                        </div>

                        <button
                          type="button"
                          onClick={() => markAsOpen(idx)}
                          className="px-3 py-2 bg-yellow-400 text-black rounded-md cursor-pointer hover:bg-yellow-500 transition"
                        >
                          Libre
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMember(idx)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md cursor-pointer hover:bg-red-600 transition disabled:opacity-50"
                          disabled={formik.values.members.length === 1}
                        >
                          X
                        </button>
                      </div>

                      {/* Validación */}
                      {Array.isArray(formik.errors.members) &&
                      formik.touched.members &&
                      (formik.touched.members as any)[idx] &&
                      (formik.errors.members as any)[idx] && (
                        <p className="mt-2 text-sm text-red-400">
                          {(formik.errors.members as any)[idx].userId ||
                          (formik.errors.members as any)[idx].isOpen}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300 transform ${
                  formik.isSubmitting || !formik.isValid
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-linear-to-r from-tur1 to-tur2 text-azul cursor-pointer hover:from-tur2 hover:to-tur3 hover:shadow-xl hover:scale-105"
                }`}
              >
                {formik.isSubmitting ? "Creando banda..." : "🚀 Publicar Banda"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}