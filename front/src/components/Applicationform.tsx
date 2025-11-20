import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateApplicationDto } from '../interfaces/ICreateAplication';
import { useEffect, useState } from "react";


// Schema de validación con Yup
export const CreateApplicationValidationSchema = Yup.object({
    vacancyId: Yup.string()
        .uuid('El ID de la vacante debe ser un UUID válido')
        .required('El ID de la vacante es requerido'),
    applicantId: Yup.string()
        .uuid('El ID del aplicante debe ser un UUID válido')
        .required('El ID del aplicante es requerido'),
    applicationDescription: Yup.string()
        .optional()
        .max(500, 'La descripción no puede exceder 500 caracteres'),
});





interface ApplicationFormProps {
    vacancyId: string;
    // applicantId ya no es required como prop
}

export default function ApplicationForm({ vacancyId }: ApplicationFormProps) {
    const [applicantId, setApplicantId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtener el ID del usuario actual
        const getCurrentUserId = () => {
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setApplicantId(user.id);
                }
            } catch (error) {
                console.error('Error obteniendo usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        getCurrentUserId();
    }, []);

    const formik = useFormik<CreateApplicationDto>({
        initialValues: {
            vacancyId: vacancyId,
            applicantId: applicantId,
            applicationDescription: '',
        },
        validationSchema: CreateApplicationValidationSchema,
        enableReinitialize: true, // ✅ Importante: permite reinicializar cuando applicantId cambia
        onSubmit: async (values) => {
            console.log('Enviando postulación:', values);
            // Aquí tu lógica de envío
        },
    });

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!applicantId) {
        return (
            <div className="text-center p-8">
                <p className="text-txt2 mb-4">Debes iniciar sesión para postularte</p>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="px-6 py-3 bg-tur1 text-azul rounded-lg hover:bg-tur2 transition-colors"
                >
                    Iniciar Sesión
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="applicationDescription" className="block text-lg font-bold text-txt1 mb-2">
                    Mensaje de Postulación
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
                disabled={formik.isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-tur1 to-tur2 text-azul rounded-lg text-lg font-bold hover:from-tur2 hover:to-tur3 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
                {formik.isSubmitting ? "Enviando..." : "📨 Enviar Postulación"}
            </button>
        </form>
    );
}