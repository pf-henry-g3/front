"use client";
import axios, { AxiosError } from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { CreateUserDto } from "../interfaces/ICreateUserDto";
import { useRouter } from "next/navigation";




// Schema de validación con Yup según las consignas del backend

const validationSchema = Yup.object({


    name: Yup.string()
        .required("El nombre es obligatorio")
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(80, "El nombre de usuario no puede tener mas de 80 caracteres"),

    userName: Yup.string()
    .required("El nombre de usuario es obligatorio")
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
        .required("Confirmar contraseña es obligatorio")
        .oneOf([Yup.ref('password')], "Las contraseñas deben coincidir"),

    // Birth Date validation

    birthDate: Yup.date()
        .required("La fecha de nacimiento es obligatoria")
        .typeError("Debe ser una fecha válida"),
    });



    export default function RegisterForm() {

const router= useRouter ()      

const formik = useFormik<CreateUserDto>({
    initialValues: {
        name: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        birthDate: "",

        
  
  
        
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus, resetForm, setFieldError }) => {
        // Validar que todos los campos estén completos
        const { name, userName, email, password, confirmPassword, birthDate } = values;
        if (!name || !userName || !email || !password || !confirmPassword || !birthDate) {
            return Swal.fire({
                icon: "error",
                title: "Faltan datos",
                text: "Por favor completa todos los campos obligatorios"
            });
        }

        try {
            // 1. Activar estado de loading
            setSubmitting(true);
            
            // 2. Preparar datos para el backend
            const registerData = {
                name: values.name,
                userName: values.userName, // Corregido: debe ser userName, no username
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword, // El backend también requiere confirmPassword
                birthDate: values.birthDate
            };
            
            // Debug: Mostrar datos que se envían
            console.log('Datos a enviar:', registerData);
            console.log('Estado del formulario antes del envío:', {
                values: values,
                errors: formik.errors,
                touched: formik.touched
            });
            
            // 3. Hacer petición POST al backend
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
                registerData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // 4. Manejar respuesta exitosa
            console.log('Respuesta del servidor:', response.data);
            
            // Si llegamos aquí sin errores, el registro fue exitoso
            if (response.status === 200 || response.status === 201) {
                // Resetear formulario completamente
                resetForm({
                    values: {
                        name: "",
                        userName: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        birthDate: ""
                    },
                    errors: {},
                    touched: {}
                });
                
                // Mostrar mensaje de éxito con SweetAlert2
                await 
                    router.push("/login");
                    Swal.fire({
                    icon: "success",
                    title: "¡Registro completado con éxito!",
                    text: "Tu cuenta ha sido creada correctamente",
                    confirmButtonText: "Ir al Login",
                    confirmButtonColor: "#10B981"
                });
                
                // Opcional: Redireccionar al login después del alert
                // router.push('/login');
            }
            
        } catch (error) {
            // 5. Manejar diferentes tipos de errores
            const axiosError = error as AxiosError<any>;
            
            // console.error('Error de registro:', axiosError);
            // console.error('Response data:', axiosError.response?.data);
            // console.error('Response status:', axiosError.response?.status);
            
            if (axiosError.response?.status === 400) {
                // Errores de validación del backend
                const errorData = axiosError.response.data;
                
                // Si el backend devuelve un array de mensajes de error
                if (errorData.message && Array.isArray(errorData.message)) {
                    await Swal.fire({
                        icon: "error",
                        title: "Errores de validación",
                        html: errorData.message.map((msg: string) => `• ${msg}`).join('<br>'),
                        confirmButtonColor: "#EF4444"
                    });
                } else if (errorData.errors) {
                    // Mapear errores específicos a campos
                    if (errorData.errors.email) {
                        setFieldError('email', errorData.errors.email);
                    }
                    if (errorData.errors.password) {
                        setFieldError('password', errorData.errors.password);
                    }
                    if (errorData.errors.userName) {
                        setFieldError('userName', errorData.errors.userName);
                    }
                    if (errorData.errors.name) {
                        setFieldError('name', errorData.errors.name);
                    }
                    
                    await Swal.fire({
                        icon: "error",
                        title: "Error de validación",
                        text: "Por favor, corrige los errores indicados en el formulario.",
                        confirmButtonColor: "#EF4444"
                    });
                } else {
                    await Swal.fire({
                        icon: "error",
                        title: "Error de validación",
                        text: errorData.message || "Error de validación.",
                        confirmButtonColor: "#EF4444"
                    });
                }
                
            } else if (axiosError.response?.status === 409) {
                // Usuario ya existe
                setFieldError('email', 'Este email ya está registrado');
                await Swal.fire({
                    icon: "error",
                    title: "Usuario ya existe",
                    text: "Este email ya está registrado. ¿Quieres iniciar sesión?",
                    confirmButtonColor: "#EF4444"
                });
                
            } else {
                // Error de red o servidor
                await Swal.fire({
                    icon: "error",
                    title: "Error de conexión",
                    text: "Hubo un error en el registro. Inténtalo de nuevo más tarde.",
                    confirmButtonColor: "#EF4444"
                });
            }
            
        } finally {
            // 6. Siempre desactivar loading
            setSubmitting(false);
        }
    }
});

    return (
        <div className="min-h-screen flex flex-col justify-center items-center py-8 px-4">
            <div className="w-full max-w-6xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-8 text-center">
                <h2 className="text-txt1 text-3xl font-bold mb-3">🎵 Únete a la Comunidad Musical</h2>
                <p className="text-txt2 text-lg mb-8">Crea tu perfil y conecta con músicos de todo el mundo</p>
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {/* Primera fila - Información personal (3 campos) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Campo Nombre */}
                        <div className="text-left">
                            <label htmlFor="name" className="block text-txt1 text-sm font-semibold mb-2">
                                Nombre Completo
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-tur2 transition-all duration-300 placeholder:text-gray-500 text-sm text-gray-900 font-medium ${formik.touched.name && formik.errors.name
                                        ? "border-red-500 bg-red-50/80 text-red-900"
                                        : "border-tur3/40 bg-white/90 focus:border-tur1 focus:bg-white/95 hover:shadow-md"
                                    }`}
                                placeholder="Tu nombre completo"
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="mt-2 text-xs text-red-600 font-medium">{formik.errors.name}</p>
                            )}
                        </div>

                        {/* Campo Usuario */}
                        <div className="text-left">
                            <label htmlFor="userName" className="block text-txt1 text-sm font-semibold mb-2">
                                Nombre de Usuario
                            </label>
                            <input
                                id="userName"
                                name="userName"
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.userName}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-tur1/30 transition-all duration-300 placeholder:text-oscuro3 text-sm text-oscuro1 font-medium backdrop-blur-sm ${formik.touched.userName && formik.errors.userName
                                        ? "border-red-500 bg-red-50/80 text-red-900"
                                        : "border-tur3/40 bg-white/90 focus:border-tur1 focus:bg-white/95 hover:shadow-md"
                                    }`}
                                placeholder="Nombre de usuario único"
                            />
                            {formik.touched.userName && formik.errors.userName && (
                                <p className="mt-2 text-xs text-red-600 font-medium">{formik.errors.userName}</p>
                            )}
                        </div>

                        {/* Campo Email */}
                        <div className="text-left">
                            <label htmlFor="email" className="block text-txt1 text-sm font-semibold mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-tur2 transition-all duration-300 placeholder:text-gray-500 text-sm text-gray-900 font-medium ${formik.touched.email && formik.errors.email
                                        ? "border-red-500 bg-red-50/80 text-red-900"
                                        : "border-tur3/40 bg-white/90 focus:border-tur1 focus:bg-white/95 hover:shadow-md"
                                    }`}
                                placeholder="tu@email.com"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="mt-2 text-xs text-red-600 font-medium">{formik.errors.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Segunda fila - Seguridad y fecha (3 campos) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Campo Contraseña */}
                        <div className="text-left">
                            <label htmlFor="password" className="block text-txt1 text-sm font-semibold mb-2">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-tur2 transition-all duration-300 placeholder:text-gray-500 text-sm text-gray-900 font-medium ${formik.touched.password && formik.errors.password
                                        ? "border-red-500 bg-red-50/80 text-red-900"
                                        : "border-tur3/40 bg-white/90 focus:border-tur1 focus:bg-white/95 hover:shadow-md"
                                    }`}
                                placeholder="Mínimo 8 caracteres"
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="mt-2 text-xs text-red-600 font-medium">{formik.errors.password}</p>
                            )}
                        </div>

                        {/* Campo Confirmar Password */}
                        <div className="text-left">
                            <label htmlFor="confirmPassword" className="block text-txt1 text-sm font-semibold mb-2">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.confirmPassword}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-tur2 transition-all duration-300 placeholder:text-gray-500 text-sm text-gray-900 font-medium ${formik.touched.confirmPassword && formik.errors.confirmPassword
                                        ? "border-red-500 bg-red-50 text-red-900"
                                        : "border-gray-300 bg-white focus:border-tur2 hover:shadow-md"
                                    }`}
                                placeholder="Repite tu contraseña"
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <p className="mt-2 text-xs text-red-600 font-medium">{formik.errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Campo Fecha de nacimiento */}
                        <div className="text-left">
                            <label htmlFor="birthDate" className="block text-txt1 text-sm font-semibold mb-2">
                                Fecha de Nacimiento
                            </label>
                            <input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.birthDate}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-tur1/30 transition-all duration-300 text-sm text-oscuro1 font-medium backdrop-blur-sm ${formik.touched.birthDate && formik.errors.birthDate
                                        ? "border-red-500 bg-red-50/80 text-red-900"
                                        : "border-tur3/40 bg-white/90 focus:border-tur1 focus:bg-white/95 hover:shadow-md"
                                    }`}
                            />
                            {formik.touched.birthDate && formik.errors.birthDate && (
                                <p className="mt-2 text-xs text-red-600 font-medium">{formik.errors.birthDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Botón Submit - Estilo landing */}
                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={formik.isSubmitting || !formik.isValid}
                            className={`w-full py-4 px-6 rounded-xl text-lg font-bold shadow-xl transition-all duration-300 backdrop-blur-sm ${formik.isSubmitting || !formik.isValid
                                    ? "bg-gray-400/80 cursor-not-allowed text-white border-2 border-gray-300"
                                    : "bg-gradient-to-r from-tur1 to-tur2 text-azul border-2 border-tur3/30 hover:from-tur2 hover:to-tur1 hover:text-oscuro1 hover:-translate-y-1 hover:shadow-2xl transform active:scale-95"
                                }`}
                        >
                            {formik.isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creando cuenta...
                                </span>
                            ) : "Crear Mi Cuenta"}
                        </button>
                    </div>
                </form>



                {/* Los mensajes ahora se muestran con SweetAlert2 */}



                {/* Link para login */}
                <div className="mt-6 text-center">
                    <p className="text-oscuro2 text-base font-medium">
                        ¿Ya tienes cuenta?
                        <a
                            href="/login"
                           className="ml-2 text-tur1 text-base font-bold transition-all duration-300 hover:text-tur2 hover:cursor-pointer underline decoration-2 underline-offset-4 hover:decoration-tur2"
                        >
                            Inicia sesión aquí
                        </a>
                    </p>
                </div>

            </div>
        </div>
    );
}