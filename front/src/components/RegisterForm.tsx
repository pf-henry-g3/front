"use client";
import { useFormik } from "formik";
import * as Yup from "yup";




// Schema de validación con Yup según las consignas del backend

const validationSchema = Yup.object({


    name: Yup.string()
        .required("El nombre es obligatorio")
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(80, "El nombre de usuario no puede tener mas de 80 caracteres"),

    // Email validation

    email: Yup.string()
        .required("El email es obligatorio")
        .email("Formato invalido"),

    // Password validation

    password: Yup.string()
        .required("La contraseña es obligatorio")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(15, "La contraseña no debe tener mas de 15 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,"La contraseña debe tener al menos una mayuscula, una minuscula, un numero y un caracter especial"),


    // Confirm Password validation

    confirmPassword: Yup.string()
        .required("Confirmar contraseña")
        .oneOf([Yup.ref('password')], "Las contraseñas deben coincidir"),

    // Birth Date validation

    birthDate: Yup.date()
        .required("La fecha de nacimiento es obligatoria")
        .typeError("Debe ser una fecha válida"),
    });



    export default function RegisterForm() {

        const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            birthDate: "",
            terms: false
        },

        validationSchema,
        onSubmit: (values, { setSubmitting, setStatus, resetForm }) => {

            // Simular llamada a API de registro

            console.log("Datos del registro:", values);
            setTimeout(() => {

                // Aquí iría la lógica real de registro

                setStatus({ type: "success", message: "¡Registro exitoso! Bienvenido a la comunidad musical." });
                resetForm();
                setSubmitting(false);
            }, 1500);

        }

    });

    return (
        <div className="min-h-screen flex flex-col justify-center items-center py-8 px-4">
            <div className="w-full max-w-4xl bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-xl p-8 text-center">
                <h2 className="text-txt1 text-2xl font-bold mb-2">Únete a la Comunidad</h2>
                <p className="text-txt2 text-sm mb-4">Crea tu perfil y conecta con músicos de todo el mundo</p>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    {/* Primera fila - Nombre y Email */}
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Campo Nombre */}
                        <div className="text-left flex-1">
                            <label htmlFor="name" className="block text-txt1 text-sm font-semibold mb-1">
                                Nombre Completo
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                                className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-1 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 text-sm ${formik.touched.name && formik.errors.name
                                        ? "border-red-500 bg-red-50"
                                        : "border-fondo1 bg-white focus:border-tur3"
                                    }`}
                                placeholder="Tu nombre completo"
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="mt-1 text-xs text-white-600 font-medium">{formik.errors.name}</p>
                            )}
                        </div>

                        {/* Campo Email */}

                        <div className="text-left flex-1">
                            <label htmlFor="email" className="block text-txt1 text-sm font-semibold mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-1 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 text-sm 
                                    ${formik.touched.email && formik.errors.email
                                        ? "border-red-500 bg-red-50"
                                        : "border-fondo1 bg-white focus:border-tur3"
                                    }`}
                                placeholder="tu@email.com"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Segunda fila - Contraseñas */}
                    <div className="flex flex-col md:flex-row gap-3">
                    {/* Campo Password */}
                        <div className="text-left flex-1">
                            <label htmlFor="password" className="block text-txt1 text-sm font-semibold mb-1">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-1 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 text-sm 
                                    ${formik.touched.password && formik.errors.password
                                        ? "border-red-500 bg-red-50"
                                        : "border-fondo1 bg-white focus:border-tur3"
                                    }`}
                                placeholder="••••••••"
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="mt-2 text-sm text-white-700 font-medium">{formik.errors.password}</p>
                            )}
                        </div>
                        



                        {/* Campo Confirmar Password */}
                        <div className="text-left flex-1">
                            <label htmlFor="confirmPassword" className="block text-txt1 text-sm font-semibold mb-1">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.confirmPassword}
                                className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-1 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 text-sm 
                                    ${formik.touched.confirmPassword && formik.errors.confirmPassword
                                        ? "border-red-500 bg-red-50"
                                        : "border-fondo1 bg-white focus:border-tur3"
                                    }`}
                                placeholder="••••••••"
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    {/* Tercera fila - Fecha de nacimiento */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="text-left flex-1">
                            <label htmlFor="birthDate" className="block text-txt1 text-sm font-semibold mb-1">
                                Fecha de Nacimiento
                            </label>
                            <input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.birthDate}
                                className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-1 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 text-sm 
                                    ${formik.touched.birthDate && formik.errors.birthDate
                                        ? "border-red-500 bg-red-50"
                                        : "border-fondo1 bg-white focus:border-tur3"
                                    }`}
                                placeholder=""
                            />
                            {formik.touched.birthDate && formik.errors.birthDate && (
                                <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.birthDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Botón Submit */}

                    <button
                        type="submit"
                        disabled={formik.isSubmitting || !formik.isValid}
                        className={`w-full py-2 px-4 rounded-md text-base font-sans shadow-lg transition duration-300 ${formik.isSubmitting || !formik.isValid
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-tur1 text-azul hover:bg-tur2 hover:text-oscuro2 hover:-translate-y-0.5 hover:cursor-pointer"
                            }`}
                    >
                        {formik.isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
                    </button>
                </form>



                {/* Mensajes de estado */}
                {formik.status && (
                    <div className={`mt-4 p-4 rounded-md shadow-md ${formik.status.type === "success"
                            ? "bg-tur1 border border-tur2 text-azul"
                            : "bg-red-100 border border-red-400 text-red-700"
                        }`}>
                        <p className="font-medium">{formik.status.message}</p>
                    </div>
                )}



                {/* Link para login */}

                <div className="mt-4 text-center">
                    <p className="text-txt2 text-sm">
                        ¿Ya tienes cuenta?
                        <a
                            href="/login"
                           className="ml-1 text-tur3 text-sm font-sans transition duration-400 hover:text-tur2 hover:cursor-pointer underline"
                        >
                            Inicia sesión aquí
                        </a>
                    </p>
                </div>



                {/* Decorative element */}

                <div className="mt-4">
                    <h2 className="text-tur2 text-xl font-semibold">🎼</h2>
                </div>
            </div>
        </div>
    );
}