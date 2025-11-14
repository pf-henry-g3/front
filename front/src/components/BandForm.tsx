"use client"
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as Yup from "yup";

interface Usuario {
  id: string;
  name: string;
}

interface BandMemberDto {
  memberId?: string | null;
  isOpen: boolean;
  role?: string;
}

export interface CreateBandDto {
  name: string;
  genres: string[];
  imageUrl: string;
  locality: string;
  description: string;
  members: BandMemberDto[];
}

const validationSchema = Yup.object({
  name: Yup.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100).required("El nombre de la banda es requerido"),
  genres: Yup.array().of(Yup.string()).min(1, "Selecciona al menos un género").max(5, "Máximo 5 géneros"),
  imageUrl: Yup.string().url("Debe ser una URL válida").required("La imagen es requerida"),
  locality: Yup.string().min(2).required("La localidad es requerida"),
  description: Yup.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción es muy larga").required("La descripción es requerida"),
  members: Yup.array().of(
    Yup.object({
      memberId: Yup.string().when("isOpen", {
        is: false,
        then: Yup.string().required("Selecciona un usuario o marca como puesto libre"),
        otherwise: Yup.string().notRequired()
      }),
      isOpen: Yup.boolean().required()
    })
  )
});

export default function BandForm() {
  const router = useRouter();
  const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});
  const [suggestions, setSuggestions] = useState<Record<number, Usuario[]>>({});
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const debounceRef = useRef<Record<number, number>>({});

  const formik = useFormik<CreateBandDto>({
    initialValues: {
      name: "",
      genres: [],
      imageUrl: "",
      locality: "",
      description: "",
      members: [{ memberId: "", isOpen: false }]
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setSubmitting(true);

        const payload = {
          name: values.name,
          genres: values.genres,
          imageUrl: values.imageUrl,
          locality: values.locality,
          description: values.description,
          members: values.members.map(m => ({ memberId: m.isOpen ? null : (m.memberId || null), isOpen: m.isOpen }))
        };

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bands`, payload, {
          headers: { "Content-Type": "application/json" }
        });

        if (response.status === 200 || response.status === 201) {
          await Swal.fire({ icon: "success", title: "Banda creada", text: "La banda se creó correctamente", timer: 1500, showConfirmButton: false });
          resetForm();
          router.push("/bands");
        }
      } catch (error) {
        console.error("Error creando banda:", error);
        await Swal.fire({ icon: "error", title: "Error", text: "No se pudo crear la banda. Intenta más tarde." });
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Sync searchTerms and suggestions when members length changes
  useEffect(() => {
    const len = formik.values.members.length;
    setSearchTerms(prev => {
      const copy = [...prev];
      while (copy.length < len) copy.push("");
      while (copy.length > len) copy.pop();
      return copy;
    });
    setSuggestions(prev => {
      const copy: Record<number, Usuario[]> = {};
      for (let i = 0; i < formik.values.members.length; i++) {
        copy[i] = prev[i] || [];
      }
      return copy;
    });
    // clear loading flags for removed indices
    setLoadingUsers(prev => {
      const copy: Record<number, boolean> = {};
      for (let i = 0; i < formik.values.members.length; i++) copy[i] = prev[i] || false;
      return copy;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.members.length]);

  const fetchUsers = async (term: string, index: number) => {
    const t = term?.trim();
    if (!t || t.length === 0) {
      setSuggestions(s => ({ ...s, [index]: [] }));
      return;
    }
    setLoadingUsers(l => ({ ...l, [index]: true }));
    try {
      // Se consulta /user?q=term&page=1&limit=10 — ajusta si tu API usa otro parámetro
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
      });
      const data = res.data;
      const list = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : (Array.isArray(data.users) ? data.users : []));
      const mapped = list.map((u: any) => ({ id: String(u._id ?? u.id ?? u.uid ?? ""), name: u.name ?? u.username ?? u.fullName ?? "Sin nombre" }));
      setSuggestions(s => ({ ...s, [index]: mapped }));
    } catch (err) {
      console.error("Error buscando usuarios:", err);
      setSuggestions(s => ({ ...s, [index]: [] }));
    } finally {
      setLoadingUsers(l => ({ ...l, [index]: false }));
    }
  };

  const onSearchInput = (index: number, value: string) => {
    // typing clears selected memberId
    const membersCopy = [...formik.values.members];
    membersCopy[index] = { ...membersCopy[index], memberId: "" , isOpen: false};
    formik.setFieldValue("members", membersCopy);

    setSearchTerms(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });

    // debounce fetch
    if (debounceRef.current[index]) {
      window.clearTimeout(debounceRef.current[index]);
    }
    debounceRef.current[index] = window.setTimeout(() => {
      fetchUsers(value, index);
    }, 300);
  };

  const selectSuggestion = (index: number, user: Usuario) => {
    const membersCopy = [...formik.values.members];
    membersCopy[index] = { ...membersCopy[index], memberId: user.id, isOpen: false };
    formik.setFieldValue("members", membersCopy);

    setSearchTerms(prev => {
      const copy = [...prev];
      copy[index] = user.name;
      return copy;
    });
    setSuggestions(s => ({ ...s, [index]: [] }));
  };

  const markOpen = (index: number) => {
    const membersCopy = [...formik.values.members];
    membersCopy[index] = { ...membersCopy[index], memberId: "", isOpen: true };
    formik.setFieldValue("members", membersCopy);

    setSearchTerms(prev => {
      const copy = [...prev];
      copy[index] = "Puesto libre";
      return copy;
    });
    setSuggestions(s => ({ ...s, [index]: [] }));
  };

  const addMember = () => {
    formik.setFieldValue("members", [...formik.values.members, { memberId: "", isOpen: false }]);
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
      const copy: Record<number, Usuario[]> = {};
      Object.keys(s).forEach(k => {
        const i = Number(k);
        if (i < index) copy[i] = s[i];
        else if (i > index) copy[i - 1] = s[i];
      });
      return copy;
    });
  };

  return (
    <div className="bg-linear-to-br from-fondo1 via-fondo2 to-fondo3 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-[1200px]">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-txt1 mb-2">🎸 Crear Nueva Banda</h2>
          <p className="text-txt2 text-lg">Configura tu banda: géneros, miembros y más.</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
            <div className="xl:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6 xl:sticky xl:top-6">
                <label className="block text-xl font-bold text-txt1 mb-4">🎵 Géneros Principales *</label>
                <p className="text-sm text-txt2 mb-4">Selecciona de 1 a 5 géneros</p>

                <div className="space-y-3">
                  {['Rock', 'Pop', 'Jazz', 'Blues', 'Metal', 'Folk', 'Electrónica', 'Hip Hop'].map(genre => (
                    <label key={genre} className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${formik.values.genres.includes(genre) ? 'bg-tur2 text-azul shadow-md transform scale-105' : 'bg-white/5 hover:bg-white/10 text-txt1'}`}>
                      <input
                        type="checkbox"
                        name="genres"
                        value={genre}
                        checked={formik.values.genres.includes(genre)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) formik.setFieldValue('genres', [...formik.values.genres, value]);
                          else formik.setFieldValue('genres', formik.values.genres.filter(g => g !== value));
                        }}
                        className="mr-3 w-5 h-5 accent-tur2"
                      />
                      <span className="font-medium">{genre}</span>
                    </label>
                  ))}
                </div>

                {formik.touched.genres && (formik.errors.genres as any) && (
                  <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">⚠️ {String(formik.errors.genres)}</p>
                )}

                <div className="mt-4 p-3 bg-tur1/20 border border-tur1/30 rounded-lg text-center">
                  <p className="text-txt1 font-semibold">{formik.values.genres.length} / 5 géneros</p>
                </div>
              </div>
            </div>

            <div className="xl:col-span-3 space-y-6">
              <div>
                <label htmlFor="name" className="block text-lg font-bold text-txt1 mb-2">🎤 Nombre de la Banda *</label>
                <input id="name" name="name" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.name}
                  className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 ${formik.touched.name && formik.errors.name ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-tur2 focus:border-tur2"}`}
                  placeholder="Ej: Los Acordes Salvajes" />
                {formik.touched.name && formik.errors.name && <p className="mt-2 text-sm text-red-400">{formik.errors.name}</p>}
              </div>

              {/* DESCRIPCIÓN: agregado entre nombre y localidad */}
              <div>
                <label htmlFor="description" className="block text-lg font-bold text-txt1 mb-2">📝 Descripción *</label>
                <textarea id="description" name="description" rows={4}
                  onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.description}
                  className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 resize-none ${formik.touched.description && formik.errors.description ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-tur2 focus:border-tur2"}`}
                  placeholder="Describe la banda, estilo, trayectoria, etc." />
                {formik.touched.description && formik.errors.description && <p className="mt-2 text-sm text-red-400">{formik.errors.description}</p>}
              </div>

              <div>
                <label htmlFor="locality" className="block text-lg font-bold text-txt1 mb-2">📍 Localidad *</label>
                <input id="locality" name="locality" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.locality}
                  className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 ${formik.touched.locality && formik.errors.locality ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-tur2 focus:border-tur2"}`}
                  placeholder="Ciudad, País" />
                {formik.touched.locality && formik.errors.locality && <p className="mt-2 text-sm text-red-400">{formik.errors.locality}</p>}
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-lg font-bold text-txt1 mb-2">🖼️ URL de Imagen *</label>
                <input id="imageUrl" name="imageUrl" type="url" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.imageUrl}
                  className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 ${formik.touched.imageUrl && formik.errors.imageUrl ? "border-red-500 focus:ring-red-500" : "border-white/20 focus:ring-tur2 focus:border-tur2"}`}
                  placeholder="https://ejemplo.com/imagen.jpg" />
                {formik.touched.imageUrl && formik.errors.imageUrl && <p className="mt-2 text-sm text-red-400">{formik.errors.imageUrl}</p>}

                {formik.values.imageUrl && !formik.errors.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-txt2 mb-2">Vista previa:</p>
                    <img src={formik.values.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border-2 border-white/20"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible'; }} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-lg font-bold text-txt1 mb-2">👥 Miembros</label>
                <p className="text-sm text-txt2 mb-3">Escribe para buscar usuarios (autocompletado). También puedes marcar "Puesto libre".</p>

                <div className="space-y-3">
                  {formik.values.members.map((member, idx) => (
                    <div key={idx} className="relative bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={searchTerms[idx] ?? ""}
                          onChange={(e) => onSearchInput(idx, e.target.value)}
                          placeholder="Buscar usuario por nombre..."
                          className="flex-1 bg-transparent border border-white/20 rounded-md px-3 py-2 focus:outline-none"
                        />

                        <button type="button" onClick={() => markOpen(idx)} className="px-3 py-2 bg-yellow-400 text-black rounded-md">Puesto libre</button>
                        <button type="button" onClick={() => removeMember(idx)} className="px-3 py-2 bg-red-500 text-white rounded-md" disabled={formik.values.members.length === 1}>Eliminar</button>
                      </div>

                      {loadingUsers[idx] && <p className="mt-2 text-sm text-txt2">Buscando...</p>}

                      {suggestions[idx] && suggestions[idx].length > 0 && (
                        <ul className="absolute z-20 left-3 right-3 mt-2 bg-white/95 text-black rounded-md shadow-lg max-h-56 overflow-auto">
                          {suggestions[idx].map(u => (
                            <li key={u.id} onClick={() => selectSuggestion(idx, u)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                              {u.name}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* validation message */}
                      {Array.isArray(formik.errors.members) && (formik.touched.members && (formik.touched.members as any)[idx]) && (formik.errors.members as any)[idx] && (
                        <p className="mt-2 text-sm text-red-400">{(formik.errors.members as any)[idx].memberId || (formik.errors.members as any)[idx].isOpen}</p>
                      )}
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => addMember()} className="px-3 py-2 mt-3 bg-tur1 text-azul rounded-md">+ Añadir miembro</button>
              </div>

              <button type="submit" disabled={formik.isSubmitting || !formik.isValid}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300 transform ${formik.isSubmitting || !formik.isValid ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-gradient-to-r from-tur1 to-tur2 text-azul hover:from-tur2 hover:to-tur3 hover:shadow-xl hover:scale-105"}`}>
                {formik.isSubmitting ? "Creando banda..." : "🚀 Publicar Banda"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}