"use client"
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const validationSchema = Yup.object({
    name: Yup.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .required("El nombre de la vacante es requerido"),
    
    vacancyType: Yup.string()
        .required("El tipo de vacante es requerido"),
    
    vacancyDescription: Yup.string()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(500, "La descripción no puede exceder 500 caracteres")
        .required("La descripción es requerida"),
    
    urlImage: Yup.string()
        .url("Debe ser una URL válida")
        .required("La imagen es requerida"),
});

export default function VacancyForm() {
    const { isAuthenticated, token, user, logout, loading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        console.log("📋 VacancyForm - Inicializado", {
            isAuthenticated,
            user: user?.userName,
            token: token ? "✅" : "❌",
            loading
        });
    }, [isAuthenticated, user, token, loading]);

    // Redirigir si no está autenticado
    useEffect(() => {
        if (isClient && !loading && !isAuthenticated) {
            console.log("❌ VacancyForm - Usuario no autenticado, redirigiendo...");
            Swal.fire({
                icon: "warning",
                title: "Acceso requerido",
                text: "Debes iniciar sesión para crear una vacante",
                confirmButtonColor: "#3B82F6"
            }).then(() => {
                router.push('/login');
            });
        }
    }, [isAuthenticated, loading, isClient, router]);

    const formik = useFormik({
        initialValues: {
            name: "",
            vacancyDescription: "",
            vacancyType: "",
            urlImage: "",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            console.log("🎯 VacancyForm - Iniciando envío del formulario");
            
            if (!token) {
                console.log("❌ VacancyForm - No hay token disponible");
                await Swal.fire({
                    icon: "error",
                    title: "Sesión expirada",
                    text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                    confirmButtonColor: "#EF4444"
                });
                router.push('/login');
                return;
            }

            try {
                setSubmitting(true);
                
                const vacancyData = {
                    name: values.name,
                    vacancyDescription: values.vacancyDescription,
                    vacancyType: values.vacancyType,
                    urlImage: values.urlImage,
                };

                console.log("📤 VacancyForm - Enviando datos:", vacancyData);
                console.log("🔑 VacancyForm - Usando token:", token.substring(0, 20) + '...');

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/vacancy`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(vacancyData)
                    }
                );

                console.log("📨 VacancyForm - Respuesta recibida, status:", response.status);

                if (response.ok) {
                    const responseData = await response.json();
                    console.log("✅ VacancyForm - Vacante creada exitosamente:", responseData);
                    
                    resetForm();
                    
                    await Swal.fire({
                        icon: "success",
                        title: "¡Vacante creada!",
                        text: "La vacante se ha publicado exitosamente",
                        confirmButtonColor: "#10B981",
                        timer: 2000
                    });
                    
                    router.push('/home');
                } else {
                    const errorData = await response.json();
                    console.log("❌ VacancyForm - Error del servidor:", errorData);
                    
                    if (response.status === 401) {
                        await Swal.fire({
                            icon: "error",
                            title: "Sesión expirada",
                            text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                            confirmButtonColor: "#EF4444"
                        });
                        await logout();
                        router.push('/login');
                    } else if (response.status === 400) {
                        await Swal.fire({
                            icon: "error",
                            title: "Error de validación",
                            text: errorData.message || "Verifica los datos ingresados",
                            confirmButtonColor: "#EF4444"
                        });
                    } else if (response.status === 403) {
                        await Swal.fire({
                            icon: "error",
                            title: "Acceso denegado",
                            text: "No tienes permisos para crear vacantes",
                            confirmButtonColor: "#EF4444"
                        });
                    } else {
                        await Swal.fire({
                            icon: "error",
                            title: "Error del servidor",
                            text: errorData.message || "Hubo un error al crear la vacante",
                            confirmButtonColor: "#EF4444"
                        });
                    }
                }
            } catch (error: any) {
                console.error("❌ VacancyForm - Error de conexión:", error);
                await Swal.fire({
                    icon: "error",
                    title: "Error de conexión",
                    text: "No se pudo conectar con el servidor. Verifica tu conexión.",
                    confirmButtonColor: "#EF4444"
                });
            } finally {
                setSubmitting(false);
            }
        }
    });

    // Mostrar loading
    if (loading || !isClient) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // No mostrar formulario si no está autenticado
    if (!isAuthenticated) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

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

                {/* Información de sesión */}
                <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-green-800 font-medium">
                                Conectado como: <span className="font-bold">{user?.userName}</span>
                            </p>
                            <p className="text-green-600 text-sm">
                                Estado: Autenticado ✅
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                <form onSubmit={formik.handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
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
                                disabled={formik.isSubmitting}
                                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300 transform ${
                                    formik.isSubmitting
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