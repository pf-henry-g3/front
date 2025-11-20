"use client";

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateApplicationDto } from '../interfaces/ICreateAplication';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import axios from 'axios';

// Schema de validación con Yup
export const CreateApplicationValidationSchema = Yup.object({
    vacancyId: Yup.string()
        .required('El ID de la vacante es requerido'),
    applicantId: Yup.string()
        .required('El ID del aplicante es requerido'),
    applicationDescription: Yup.string()
        .optional()
        .max(500, 'La descripción no puede exceder 500 caracteres'),
});

interface ApplicationFormProps {
    vacancyId: string;
}

export default function ApplicationForm({ vacancyId }: ApplicationFormProps) {
    const router = useRouter();
    const [applicantId, setApplicantId] = useState<string>("");
    const [applicantUserName, setApplicantUserName] = useState<string>("");
    const [vacancyInfo, setVacancyInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    useEffect(() => {
        // Obtener información del usuario
        const getCurrentUser = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setApplicantId(user.id);
                    setApplicantUserName(user.userName || user.name);
                }
            } catch (error) {
                console.error('Error obteniendo usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        getCurrentUser();
    }, []);

    // Obtener información de la vacante - CORREGIDO
    useEffect(() => {
        const getVacancyInfo = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (token && vacancyId) {
                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}vacancy/${vacancyId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    // ✅ CORRECCIÓN: Acceder a data.data para obtener la vacante
                    setVacancyInfo(response.data.data || response.data);
                    console.log('✅ Información de vacante:', response.data);
                }
            } catch (error) {
                console.error('❌ Error obteniendo vacante:', error);
            }
        };

        if (vacancyId) {
            getVacancyInfo();
        }
    }, [vacancyId]);

    const formik = useFormik<CreateApplicationDto>({
        initialValues: {
            vacancyId: vacancyId,
            applicantId: applicantId,
            applicationDescription: '',
        },
        validationSchema: CreateApplicationValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setSubmitting(true);

                const token = localStorage.getItem('access_token');

                if (!token) {
                    await Swal.fire({
                        icon: "error",
                        title: "No autorizado",
                        text: "Debes iniciar sesión para postularte",
                        confirmButtonColor: "#EF4444"
                    });
                    router.push('/login');
                    return;
                }

                console.log('📤 Enviando postulación:', values);

                // ✅ ENVIAR CON UUIDs (sabemos que esta estructura funciona)
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}application`,
                    {
                        vacancyId: values.vacancyId,
                        applicantId: values.applicantId,
                        applicationDescription: values.applicationDescription
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('✅ Postulación enviada exitosamente:', response.data);

                await Swal.fire({
                    icon: "success",
                    title: "¡Postulación enviada!",
                    text: `Te has postulado a: ${vacancyInfo?.name || 'la vacante'}`,
                    confirmButtonText: "Continuar",
                    confirmButtonColor: "#10B981",
                    timer: 3000
                });

                resetForm();
                router.push('/dashboard');

            } catch (error: any) {
                console.error('❌ Error enviando postulación:', error);

                if (axios.isAxiosError(error) && error.response) {
                    const status = error.response.status;
                    const errorData = error.response.data;

                    if (status === 400 && errorData.message?.includes('el usuario ya aplico')) {
                        // ✅ USUARIO YA APLICÓ - Mostrar mensaje específico
                        setAlreadyApplied(true);
                        await Swal.fire({
                            icon: "info",
                            title: "Ya te has postulado",
                            text: "Ya has enviado una postulación a esta vacante anteriormente.",
                            confirmButtonText: "Entendido",
                            confirmButtonColor: "#3B82F6"
                        });
                    } else if (status === 400) {
                        await Swal.fire({
                            icon: "error",
                            title: "Error en los datos",
                            text: errorData.message || "Verifica que la información sea correcta.",
                            confirmButtonColor: "#EF4444"
                        });
                    } else if (status === 401) {
                        await Swal.fire({
                            icon: "error",
                            title: "Sesión expirada",
                            text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                            confirmButtonColor: "#EF4444"
                        });
                        router.push('/login');
                    } else {
                        await Swal.fire({
                            icon: "error",
                            title: "Error del servidor",
                            text: `Error ${status}: ${errorData.message || 'Intenta más tarde'}`,
                            confirmButtonColor: "#EF4444"
                        });
                    }
                } else {
                    await Swal.fire({
                        icon: "error",
                        title: "Error de conexión",
                        text: "No se pudo conectar con el servidor.",
                        confirmButtonColor: "#EF4444"
                    });
                }
            } finally {
                setSubmitting(false);
            }
        }
    });

    if (loading) {
        return (
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-tur1 mx-auto mb-4"></div>
                <p className="text-txt1">Cargando información...</p>
            </div>
        );
    }

    if (alreadyApplied) {
        return (
            <div className="text-center p-8">
                <div className="bg-blue-100 border border-blue-400 rounded-xl p-6 mb-6">
                    <div className="text-6xl mb-4">📨</div>
                    <h3 className="text-xl font-bold text-blue-800 mb-2">Ya te has postulado</h3>
                    <p className="text-blue-700 mb-4">
                        Ya has enviado una postulación a esta vacante anteriormente.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/vacancies')}
                    className="px-6 py-3 bg-gradient-to-r from-tur1 to-tur2 text-azul rounded-lg font-bold hover:from-tur2 hover:to-tur3 transition-all duration-300"
                >
                    Ver Otras Vacantes
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Información de la postulación */}
            {vacancyInfo && (
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-txt1 mb-4">Postulando a:</h3>
                    <div className="space-y-2">
                        <p className="text-txt1">
                            <strong>Vacante:</strong> {vacancyInfo.name || vacancyInfo.bandName || 'No disponible'}
                        </p>
                        <p className="text-txt1">
                            <strong>Tipo:</strong> {vacancyInfo.vacancyType || 'No disponible'}
                        </p>
                        <p className="text-txt2 text-sm">
                            <strong>Tu usuario:</strong> {applicantUserName}
                        </p>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="applicationDescription" className="block text-lg font-bold text-txt1 mb-2">
                    Mensaje de Postulación (Opcional)
                </label>
                <textarea
                    id="applicationDescription"
                    name="applicationDescription"
                    rows={6}
                    value={formik.values.applicationDescription}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-txt1 placeholder-txt2/50 focus:outline-none focus:ring-2 focus:ring-tur2 focus:border-tur2 transition duration-300 resize-none"
                    placeholder="Explica por qué eres el candidato ideal para esta vacante..."
                />
                {formik.touched.applicationDescription && formik.errors.applicationDescription && (
                    <p className="mt-2 text-sm text-red-400">{formik.errors.applicationDescription}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300 ${formik.isSubmitting || !formik.isValid
                        ? "bg-gray-400 cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-tur1 to-tur2 text-azul hover:from-tur2 hover:to-tur3 hover:shadow-xl hover:scale-105"
                    }`}
            >
                {formik.isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-azul"></div>
                        Enviando postulación...
                    </span>
                ) : (
                    "📨 Enviar Postulación"
                )}
            </button>
        </form>
    );
}