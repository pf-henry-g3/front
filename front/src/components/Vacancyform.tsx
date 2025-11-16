"use client"
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

// export interface CreatevacancyDto {
//     name: string;
//     vacancyDescription: string;
//     vacancyType: string;
//     urlImage: string;
//     genres: string[];
// }

// // ✅ Interface para los géneros del backend
// interface Genre {
//     id: string;
//     name: string;
// }

const validationSchema = Yup.object({
    name: Yup.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .required("El nombre de la vacante es requerido"),
    
    vacancyType: Yup.string()
        .max(50, "El tipo no puede exceder 50 caracteres")
        .required("El tipo de vacante es requerido"),
    
    vacancyDescription: Yup.string()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(500, "La descripción no puede exceder 500 caracteres")
        .required("La descripción es requerida"),
    
    urlImage: Yup.string()
        .url("Debe ser una URL válida")
        .required("La imagen es requerida"),
    
    // genres: Yup.array()
    //     .of(Yup.string())
    //     .min(1, "Debes seleccionar al menos un género")
    //     .max(5, "No puedes seleccionar más de 5 géneros")
    //     .required("Los géneros son requeridos")
});

export default function VacancyForm() {
    const router = useRouter();
    const { isAuthenticated, loading, refreshUser} = useAuth();

    useEffect(() => {
        // Forzar actualización del usuario si el token cambia
        refreshUser();
    }, [refreshUser]);

   
      // Mostrar loading mientras carga el estado de autenticación
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">Cargando...</div>
            </div>
        );
    }

    // Si no está autenticado, no mostrar nada (ProtectedRoute ya redirige)
    if (!isAuthenticated) {
        return null;
    }
    
        
    // const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
    // const [loadingGenres, setLoadingGenres] = useState(true);

    // // ✅ Solo cargar géneros, asumiendo que el usuario ya está autenticado
    // useEffect(() => {
    //     const fetchGenres = async () => {
    //         try {
    //             const token = localStorage.getItem('access_token');
    //             if (!token) {
    //                 setLoadingGenres(false);
    //                 return;
    //             }
    //             const response = await axios.get(
    //                 `${process.env.NEXT_PUBLIC_API_URL}/genre`,
    //                 {
    //                     headers: {
    //                         'Authorization': `Bearer ${token}`,
    //                         'Content-Type': 'application/json'
    //                     }
    //                 }
    //             );
    //             const genres = response.data?.data || response.data;
    //             setAvailableGenres(genres);
    //         } catch (error: any) {
    //             setAvailableGenres([]);
    //         } finally {
    //             setLoadingGenres(false);
    //         }
    //     };
    //     fetchGenres();
    // }, []);

    const formik = useFormik({
        initialValues: {
            name: "",
            vacancyDescription: "",
            vacancyType: "",
            urlImage: "",
            // genres: [],
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const { name, vacancyDescription, vacancyType, urlImage } = values;
            if (!name || !vacancyDescription || !vacancyType || !urlImage) {
                await Swal.fire({
                    icon: "error",
                    title: "Faltan datos",
                    text: "Por favor completa todos los campos obligatorios"
                });
                return;
            }
            try {
                setSubmitting(true);
                const token = localStorage.getItem('access_token');
                console.log("Token para enviar:", token);
                if (!token) {
                    await Swal.fire({
                        icon: "error",
                        title: "No autorizado",
                        text: "Debes iniciar sesión para crear una vacante",
                        confirmButtonColor: "#EF4444"
                    });
                    router.push('/login');
                    return;
                }
                // const genreNames = genres.map(genreId => {
                //     const genre = availableGenres.find(g => g.id === genreId);
                //     return genre?.name || '';
                // }).filter(name => name !== '');
                const vacancyData = {
                    name,
                    vacancyDescription,
                    vacancyType,
                    urlImage,
                    // genres: genreNames,
                };
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/vacancy`,
                    vacancyData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                if (response.status === 200 || response.status === 201) {
                    resetForm({
                        values: {
                            name: "",
                            vacancyDescription: "",
                            vacancyType: "",
                            urlImage: "",
                            // genres: [],
                        },
                        errors: {},
                        touched: {}
                    });
                    await Swal.fire({
                        icon: "success",
                        title: "¡Vacante creada!",
                        text: "La vacante se ha publicado exitosamente",
                        confirmButtonText: "Continuar",
                        confirmButtonColor: "#10B981",
                        timer: 2000
                    });
                    router.push('/home');
                }
            } catch (error: any) {
                const axiosError = error;
                if (axiosError.response?.status === 400) {
                    const errorData = axiosError.response.data;
                    if (errorData.message && Array.isArray(errorData.message)) {
                        await Swal.fire({
                            icon: "error",
                            title: "Errores de validación",
                            html: `<div class="text-left">${errorData.message.map((msg: string) => `• ${msg}`).join('<br>')}</div>`,
                            confirmButtonColor: "#EF4444"
                        });
                    } else {
                        await Swal.fire({
                            icon: "error",
                            title: "Error de validación",
                            text: errorData.message || "Datos inválidos. Verifica que todos los campos estén correctos.",
                            confirmButtonColor: "#EF4444"
                        });
                    }
                } else if (axiosError.response?.status === 401) {
                    await Swal.fire({
                        icon: "error",
                        title: "Sesión expirada",
                        text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                        confirmButtonColor: "#EF4444"
                    });
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    window.dispatchEvent(new Event('auth-changed'));
                    window.dispatchEvent(new Event('storage'));
                    router.push('/login');
                } else if (axiosError.response?.status === 403) {
                    await Swal.fire({
                        icon: "error",
                        title: "Acceso denegado",
                        text: "No tienes permisos para crear vacantes",
                        confirmButtonColor: "#EF4444"
                    });
                } else {
                    await Swal.fire({
                        icon: "error",
                        title: "Error de conexión",
                        text: axiosError.response?.data?.message || "Hubo un error al crear la vacante. Inténtalo de nuevo más tarde.",
                        confirmButtonColor: "#EF4444"
                    });
                }
            } finally {
                setSubmitting(false);
            }
        }
    });

    // const handleGenreToggle = (genreId: string) => {
    //     const currentGenres = formik.values.genres;
    //     if (currentGenres.includes(genreId)) {
    //         formik.setFieldValue('genres', currentGenres.filter(id => id !== genreId));
    //     } else {
    //         if (currentGenres.length < 5) {
    //             formik.setFieldValue('genres', [...currentGenres, genreId]);
    //         } else {
    //             Swal.fire({
    //                 icon: "warning",
    //                 title: "Límite alcanzado",
    //                 text: "Solo puedes seleccionar hasta 5 géneros",
    //                 confirmButtonColor: "#F59E0B",
    //                 timer: 2000
    //             });
    //         }
    //     }
    // };

    // if (loadingGenres) {
    //     return (
    //         <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 flex items-center justify-center">
    //             <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
    //                 <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tur1 mx-auto mb-4"></div>
    //                 <p className="text-txt1 font-semibold text-lg">🎵 Cargando formulario...</p>
    //                 <p className="text-txt2 text-sm mt-2">Obteniendo géneros musicales...</p>
    //                 <p className="text-txt2 text-xs mt-4 opacity-70">
    //                     Si tarda mucho, verifica tu conexión
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

    // if (!loadingGenres && availableGenres.length === 0) {
    //     return (
    //         <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 flex items-center justify-center px-4">
    //             <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md">
    //                 <div className="text-6xl mb-4">⚠️</div>
    //                 <h3 className="text-txt1 font-bold text-xl mb-2">
    //                     No se pudieron cargar los géneros
    //                 </h3>
    //                 <p className="text-txt2 text-sm mb-6">
    //                     Es necesario cargar los géneros para crear una vacante
    //                 </p>
    //                 <div className="flex gap-3 justify-center flex-wrap">
    //                     <button
    //                         onClick={() => router.push('/home')}
    //                         className="px-6 py-3 bg-white/20 hover:bg-white/30 text-txt1 font-bold rounded-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300"
    //                     >
    //                         ← Volver al inicio
    //                     </button>
    //                     <button
    //                         onClick={() => window.location.reload()}
    //                         className="px-6 py-3 bg-gradient-to-r from-tur2 to-tur1 text-azul font-bold rounded-xl hover:from-tur1 hover:to-tur2 transition-all duration-300"
    //                     >
    //                         🔄 Reintentar
    //                     </button>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-[1400px]">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-txt1 mb-2">
                        Crear Nueva Vacante
                    </h2>
                    <p className="text-txt2 text-lg">
                        Encuentra al músico perfecto para tu proyecto
                    </p>
                </div>
                <form onSubmit={formik.handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
                        {/* Géneros eliminados para pruebas */}
                        {/* <div className="xl:col-span-1"> ... </div> */}
                        <div className="xl:col-span-4 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-lg font-bold text-txt1 mb-2 flex items-center gap-2">
                                    Nombre de la Vacante *
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.name}
                                    className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 ${
                                        formik.touched.name && formik.errors.name
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-white/20 focus:ring-tur2 focus:border-tur2"
                                    }`}
                                    placeholder="Ej: Guitarrista para banda de rock"
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="mt-2 text-sm text-red-400">{formik.errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="vacancyType" className="block text-lg font-bold text-txt1 mb-2 flex items-center gap-2">
                                    Tipo de Vacante *
                                </label>
                                <select
                                    id="vacancyType"
                                    name="vacancyType"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.vacancyType}
                                    className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 focus:outline-none focus:ring-2 transition duration-300 ${
                                        formik.touched.vacancyType && formik.errors.vacancyType
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-white/20 focus:ring-tur2 focus:border-tur2"
                                    }`}
                                >
                                    <option value="" disabled className="bg-oscuro1 text-txt2">
                                        Selecciona el tipo de músico
                                    </option>
                                    <option value="Guitarrista" className="bg-oscuro1 text-txt1">🎸 Guitarrista</option>
                                    <option value="Bajista" className="bg-oscuro1 text-txt1">🎸 Bajista</option>
                                    <option value="Baterista" className="bg-oscuro1 text-txt1">🥁 Baterista</option>
                                    <option value="Vocalista" className="bg-oscuro1 text-txt1">🎤 Vocalista</option>
                                    <option value="Tecladista" className="bg-oscuro1 text-txt1">🎹 Tecladista</option>
                                    <option value="DJ" className="bg-oscuro1 text-txt1">🎧 DJ</option>
                                    <option value="Saxofonista" className="bg-oscuro1 text-txt1">🎷 Saxofonista</option>
                                    <option value="Trompetista" className="bg-oscuro1 text-txt1">🎺 Trompetista</option>
                                    <option value="Violinista" className="bg-oscuro1 text-txt1">🎻 Violinista</option>
                                    <option value="Percusionista" className="bg-oscuro1 text-txt1">🥁 Percusionista</option>
                                    <option value="Productor" className="bg-oscuro1 text-txt1">🎚️ Productor Musical</option>
                                    <option value="Ingeniero de Sonido" className="bg-oscuro1 text-txt1">🔊 Ingeniero de Sonido</option>
                                    <option value="Otro" className="bg-oscuro1 text-txt1">🎵 Otro</option>
                                </select>
                                {formik.touched.vacancyType && formik.errors.vacancyType && (
                                    <p className="mt-2 text-sm text-red-400">{formik.errors.vacancyType}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="vacancyDescription" className="block text-lg font-bold text-txt1 mb-2 flex items-center gap-2">
                                    Descripción *
                                </label>
                                <textarea
                                    id="vacancyDescription"
                                    name="vacancyDescription"
                                    rows={6}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.vacancyDescription}
                                    className={`w-full px-4 py-3 bg-white/10 border-2 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 transition duration-300 resize-none ${
                                        formik.touched.vacancyDescription && formik.errors.vacancyDescription
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-white/20 focus:ring-tur2 focus:border-tur2"
                                    }`}
                                    placeholder="Describe los requisitos, experiencia requerida, detalles del proyecto..."
                                />
                                {formik.touched.vacancyDescription && formik.errors.vacancyDescription && (
                                    <p className="mt-2 text-sm text-red-400">{formik.errors.vacancyDescription}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="urlImage" className="block text-lg font-bold text-txt1 mb-2 flex items-center gap-2">
                                    URL de Imagen *
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
                            </div>
                            <button
                                type="submit"
                                disabled={formik.isSubmitting || !formik.isValid}
                                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300 transform ${
                                    formik.isSubmitting || !formik.isValid
                                        ? "bg-gray-400 cursor-not-allowed opacity-50"
                                        : "bg-gradient-to-r from-tur1 to-tur2 text-azul hover:from-tur2 hover:to-tur3 hover:shadow-xl hover:scale-105"
                                }`}
                            >
                                {formik.isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        Creando vacante...
                                    </span>
                                ) : (
                                    "Publicar Vacante"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}