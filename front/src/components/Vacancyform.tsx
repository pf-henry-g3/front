"use client"
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import * as Yup from "yup";

export interface CreatevacancyDto {
    name: string;
    vacancyDescription: string;
    vacancyType: string;
    urlImage: string;
    genres: string[];
}

// ✅ Interface para los géneros del backend
interface Genre {
    id: string;
    name: string;
}

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
    
    genres: Yup.array()
        .of(Yup.string())
        .min(1, "Debes seleccionar al menos un género")
        .max(5, "No puedes seleccionar más de 5 géneros")
        .required("Los géneros son requeridos")
});

export default function VacancyForm() {
    const router = useRouter();
    const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
    const [loadingGenres, setLoadingGenres] = useState(true);

    // ✅ Cargar géneros desde el backend con manejo de error 401
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const token = localStorage.getItem('access_token');
                
                // ✅ Verificar que hay token antes de hacer la petición
                if (!token) {
                    console.warn('⚠️ No hay token disponible');
                    await Swal.fire({
                        icon: "warning",
                        title: "Sesión requerida",
                        text: "Debes iniciar sesión para crear vacantes",
                        confirmButtonColor: "#F59E0B"
                    });
                    router.push('/login');
                    return;
                }

                console.log('🔑 Token encontrado, cargando géneros...');
                
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/genre`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                // Ajustar según la estructura de respuesta de tu backend
                const genres = response.data?.data || response.data;
                setAvailableGenres(genres);
                console.log('✅ Géneros cargados:', genres.length, 'géneros');
                
            } catch (error: any) {
                console.error('❌ Error cargando géneros:', error);
                console.error('❌ Status:', error.response?.status);
                console.error('❌ Message:', error.response?.data?.message);
                
                // ✅ Manejo específico del error 401
                if (error.response?.status === 401) {
                    await Swal.fire({
                        icon: "error",
                        title: "Sesión expirada",
                        text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                        confirmButtonColor: "#EF4444"
                    });
                    
                    // Limpiar localStorage y redirigir
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    window.dispatchEvent(new Event('auth-changed'));
                    window.dispatchEvent(new Event('storage'));
                    router.push('/login');
                    
                } else if (error.response?.status === 403) {
                    await Swal.fire({
                        icon: "error",
                        title: "Acceso denegado",
                        text: "No tienes permisos para acceder a esta información",
                        confirmButtonColor: "#EF4444"
                    });
                    router.push('/home');
                    
                } else {
                    await Swal.fire({
                        icon: "error",
                        title: "Error al cargar géneros",
                        text: "No se pudieron cargar los géneros musicales. Por favor, intenta nuevamente.",
                        confirmButtonColor: "#EF4444",
                        showCancelButton: true,
                        cancelButtonText: "Volver",
                        confirmButtonText: "Reintentar"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.reload();
                        } else {
                            router.push('/home');
                        }
                    });
                }
            } finally {
                setLoadingGenres(false);
            }
        };

        fetchGenres();
    }, [router]);

    const formik = useFormik<CreatevacancyDto>({
        initialValues: {
            name: "",
            vacancyDescription: "",
            vacancyType: "",
            urlImage: "",
            genres: [],
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const { name, vacancyDescription, vacancyType, urlImage, genres } = values;
            
            if (!name || !vacancyDescription || !vacancyType || !urlImage || genres.length === 0) {
                return Swal.fire({
                    icon: "error",
                    title: "Faltan datos",
                    text: "Por favor completa todos los campos obligatorios"
                });
            }

            try {
                setSubmitting(true);
                
                const token = localStorage.getItem('access_token');
                
                console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');
                
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

                // ✅ CAMBIO PRINCIPAL: Convertir IDs a nombres
                const genreNames = values.genres.map(genreId => {
                    const genre = availableGenres.find(g => g.id === genreId);
                    return genre?.name || '';
                }).filter(name => name !== '');
                
                const vacancyData = {
                    name: values.name,
                    vacancyDescription: values.vacancyDescription,
                    vacancyType: values.vacancyType,
                    urlImage: values.urlImage,
                    genres: 'genresNames', // ✅ Ya son IDs
                };
                
                console.log('📤 Datos a enviar:', vacancyData);
                console.log('📡 URL:', `${process.env.NEXT_PUBLIC_API_URL}/vacancy`);
                
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
                
                console.log('✅ Respuesta exitosa:', response.status);
                
                if (response.status === 200 || response.status === 201) {
                    resetForm({
                        values: {
                            name: "",
                            vacancyDescription: "",
                            vacancyType: "",
                            urlImage: "",
                            genres: [],
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
                
            } catch (error) {
                const axiosError = error as any;
                console.error('❌ Error completo:', axiosError);
                console.error('❌ Status:', axiosError.response?.status);
                console.error('❌ Data:', axiosError.response?.data);
                
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

    // ✅ Función para manejar selección de géneros
    const handleGenreToggle = (genreId: string) => {
        const currentGenres = formik.values.genres;
        
        if (currentGenres.includes(genreId)) {
            // Remover género
            formik.setFieldValue('genres', currentGenres.filter(id => id !== genreId));
        } else {
            // Agregar género (máximo 5)
            if (currentGenres.length < 5) {
                formik.setFieldValue('genres', [...currentGenres, genreId]);
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Límite alcanzado",
                    text: "Solo puedes seleccionar hasta 5 géneros",
                    confirmButtonColor: "#F59E0B",
                    timer: 2000
                });
            }
        }
    };

    // ✅ Loading state mientras cargan los géneros
    if (loadingGenres) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 flex items-center justify-center">
                <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tur1 mx-auto mb-4"></div>
                    <p className="text-txt1 font-semibold text-lg">🎵 Cargando formulario...</p>
                    <p className="text-txt2 text-sm mt-2">Obteniendo géneros musicales...</p>
                    <p className="text-txt2 text-xs mt-4 opacity-70">
                        Si tarda mucho, verifica tu conexión
                    </p>
                </div>
            </div>
        );
    }

    // ✅ Estado cuando no hay géneros disponibles
    if (!loadingGenres && availableGenres.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 flex items-center justify-center px-4">
                <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-txt1 font-bold text-xl mb-2">
                        No se pudieron cargar los géneros
                    </h3>
                    <p className="text-txt2 text-sm mb-6">
                        Es necesario cargar los géneros para crear una vacante
                    </p>
                    
                    <div className="flex gap-3 justify-center flex-wrap">
                        <button
                            onClick={() => router.push('/home')}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-txt1 font-bold rounded-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300"
                        >
                            ← Volver al inicio
                        </button>
                        
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gradient-to-r from-tur2 to-tur1 text-azul font-bold rounded-xl hover:from-tur1 hover:to-tur2 transition-all duration-300"
                        >
                            🔄 Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-[1400px]">
                {/* Header */}
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
                        
                      

                        {/* Columna Izquierda: Géneros */}
                        <div className="xl:col-span-1">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6 xl:sticky xl:top-6">
                                <label className="block text-xl font-bold text-txt1 mb-4 flex items-center gap-2">
                                     Géneros Musicales *
                                    <span className="text-sm font-normal text-txt2">
                                        ({formik.values.genres.length}/5)
                                    </span>
                                </label>
                                <p className="text-sm text-txt2 mb-4">
                                    Selecciona de 1 a 5 géneros
                                </p>
                                
                                {/* ✅ Géneros con checkboxes */}
                                <div className="grid grid-cols-1 gap-3">
                                    {availableGenres.map((genre) => {
                                        const isSelected = formik.values.genres.includes(genre.id);
                                        
                                        return (
                                            <label
                                                key={genre.id}
                                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                                                    isSelected
                                                        ? 'bg-gradient-to-r from-tur2/30 to-tur1/30 border-tur1 shadow-md'
                                                        : 'bg-white/5 hover:bg-white/10 border-transparent hover:border-tur2/50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleGenreToggle(genre.id)}
                                                    className="w-5 h-5 rounded border-2 border-txt2/50 text-tur1 focus:ring-2 focus:ring-tur1 focus:ring-offset-0 bg-white/10 cursor-pointer transition-all"
                                                />
                                                <span className={`ml-3 font-medium ${isSelected ? 'text-tur1' : 'text-txt1'}`}>
                                                    {genre.name}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                
                                {formik.touched.genres && formik.errors.genres && (
                                    <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                        ⚠️ {formik.errors.genres}
                                    </p>
                                )}

                                {/* Contador de géneros */}
                                <div className="mt-4 p-3 bg-tur1/20 border border-tur1/30 rounded-lg text-center">
                                    <p className="text-txt1 font-semibold">
                                        {formik.values.genres.length} / 5 géneros seleccionados
                                    </p>
                                </div>
                            </div>
                        </div>



            



                        {/* Columna Derecha: Resto del formulario */}
                        <div className="xl:col-span-3 space-y-6">
                            
                            {/* Campo Name */}
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

                            {/* Campo Tipo de Vacante */}
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

                            {/* Campo Description */}
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

                            {/* Campo URL Image */}
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
                                
                                {/* Preview de imagen */}
                                {/* {formik.values.urlImage && !formik.errors.urlImage && (
                                    <div className="mt-4">
                                        <p className="text-sm text-txt2 mb-2">Vista previa:</p>
                                        <img 
                                            src={formik.values.urlImage} 
                                            alt="Preview" 
                                            className="w-full h-48 object-cover rounded-lg border-2 border-white/20"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                                            }}
                                        />
                                    </div>
                                )} */}
                            </div>

                            {/* Botón Submit */}
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

{/* ✅ Estilos mejorados para checkboxes */}
            <style jsx>{`
                input[type="checkbox"] {
                    appearance: none;
                    -webkit-appearance: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                input[type="checkbox"]:checked {
                    background-color: rgba(79, 209, 197, 0.3);
                    border-color: #4FD1C5;
                }
                
                input[type="checkbox"]:checked::before {
                    content: "✓";
                    color: #4FD1C5;
                    font-weight: bold;
                    font-size: 14px;
                }
                
                input[type="checkbox"]:hover {
                    border-color: #4FD1C5;
                    background-color: rgba(79, 209, 197, 0.1);
                }
            `}</style>