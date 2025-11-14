"use client"
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as Yup from "yup";

export interface CreatevacancyDto {
    name: string;
    vacancyDescription: string;
    urlImage: string;
    genres: string[];
}

const validationSchema = Yup.object({
    name: Yup.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .required("El nombre de la vacante es requerido"),
    
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

    const formik = useFormik<CreatevacancyDto>({
        initialValues: {
            name: "",
            vacancyDescription: "",
            urlImage: "",
            genres: [],
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const { name, vacancyDescription, urlImage, genres } = values;
            if (!name || !vacancyDescription || !urlImage || genres.length === 0) {
                return Swal.fire({
                    icon: "error",
                    title: "Faltan datos",
                    text: "Por favor completa todos los campos obligatorios"
                });
            }

            try {
                setSubmitting(true);
                
                const vacancyData = {
                    name: values.name,
                    vacancyDescription: values.vacancyDescription, 
                    urlImage: values.urlImage,
                    genres: values.genres,
                };
                
                console.log('Datos a enviar:', vacancyData);
                
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/vacancy`,
                    vacancyData,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (response.status === 200 || response.status === 201) {
                    resetForm({
                        values: {
                            name: "",
                            vacancyDescription: "",
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

                    router.push('/vacancies');
                }
                
            } catch (error) {
                const axiosError = error as any;
                console.error('Error al crear vacante:', axiosError);
                
                if (axiosError.response?.status === 400) {
                    const errorData = axiosError.response.data;
                    
                    if (errorData.message && Array.isArray(errorData.message)) {
                        await Swal.fire({
                            icon: "error",
                            title: "Errores de validación",
                            html: errorData.message.map((msg: string) => `• ${msg}`).join('<br>'),
                            confirmButtonColor: "#EF4444"
                        });
                    } else {
                        await Swal.fire({
                            icon: "error",
                            title: "Error de validación",
                            text: errorData.message || "Datos inválidos",
                            confirmButtonColor: "#EF4444"
                        });
                    }
                } else if (axiosError.response?.status === 401) {
                    await Swal.fire({
                        icon: "error",
                        title: "No autorizado",
                        text: "Debes iniciar sesión para crear una vacante",
                        confirmButtonColor: "#EF4444"
                    });
                    router.push('/login');
                } else {
                    await Swal.fire({
                        icon: "error",
                        title: "Error de conexión",
                        text: "Hubo un error al crear la vacante. Inténtalo de nuevo más tarde.",
                        confirmButtonColor: "#EF4444"
                    });
                }
                
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 py-12 px-4 sm:px-6 lg:px-8">
            {/* ✅ Cambiar max-w-7xl por container o max-w-full con padding */}
            <div className="container mx-auto max-w-[1400px]">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-txt1 mb-2">
                        📢 Crear Nueva Vacante
                    </h2>
                    <p className="text-txt2 text-lg">
                        Encuentra al músico perfecto para tu proyecto
                    </p>
                </div>

                {/* ✅ Cambiar padding del form */}
                <form onSubmit={formik.handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10">
                    {/* ✅ Ajustar gap y columnas */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
                        
                        {/* Columna Izquierda: Géneros - ✅ Cambiar proporción */}
                        <div className="xl:col-span-1">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6 xl:sticky xl:top-6">
                                <label className="block text-xl font-bold text-txt1 mb-4 flex items-center gap-2">
                                    🎵 Géneros Musicales *
                                </label>
                                <p className="text-sm text-txt2 mb-4">
                                    Selecciona de 1 a 5 géneros
                                </p>
                                
                                <div className="space-y-3">
                                    {['Rock', 'Pop', 'Jazz', 'Blues', 'Metal', 'Folk', 'Electrónica', 'Hip Hop'].map(genre => (
                                        <label 
                                            key={genre} 
                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                                                formik.values.genres.includes(genre)
                                                    ? 'bg-tur2 text-azul shadow-md transform scale-105'
                                                    : 'bg-white/5 hover:bg-white/10 text-txt1'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                name="genres"
                                                value={genre}
                                                checked={formik.values.genres.includes(genre)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (e.target.checked) {
                                                        formik.setFieldValue('genres', [...formik.values.genres, value]);
                                                    } else {
                                                        formik.setFieldValue(
                                                            'genres',
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
                                        ⚠️ {formik.errors.genres}
                                    </p>
                                )}

                                {/* Contador de géneros seleccionados */}
                                <div className="mt-4 p-3 bg-tur1/20 border border-tur1/30 rounded-lg text-center">
                                    <p className="text-txt1 font-semibold">
                                        {formik.values.genres.length} / 5 géneros
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Resto del formulario - ✅ Ocupar más espacio */}
                        <div className="xl:col-span-3 space-y-6">
                            
                            {/* Campo Name */}
                            <div>
                                <label htmlFor="name" className="block text-lg font-bold text-txt1 mb-2 flex items-center gap-2">
                                    ✏️ Nombre de la Vacante *
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

                            {/* Campo Description */}
                            <div>
                                <label htmlFor="vacancyDescription" className="block text-lg font-bold text-txt1 mb-2 flex items-center gap-2">
                                    📝 Descripción *
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
                                
                                {/* Preview de imagen */}
                                {formik.values.urlImage && !formik.errors.urlImage && (
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
                                )}
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
                                    "🚀 Publicar Vacante"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}