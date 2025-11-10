"use client";
import axios, { AxiosError } from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

// Interfaz para los datos de login
interface LoginData {
    email: string;
    password: string;
}

// Schema de validación con Yup
const validationSchema = Yup.object({
    email: Yup.string()
        .email("Email inválido")
        .required("El email es requerido"),
    password: Yup.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .required("La contraseña es requerida")
});

export default function LoginForm() {
    const router = useRouter();

    const formik = useFormik<LoginData>({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setFieldError, resetForm }) => {
            // Validar que todos los campos estén completos
            const { email, password } = values;
            if (!email || !password) {
                return Swal.fire({
                    icon: "error",
                    title: "Faltan datos",
                    text: "Por favor completa todos los campos"
                });
            }

            try {
                // 1. Activar estado de loading
                setSubmitting(true);
                
                // 2. Preparar datos para el backend
                const loginData = {
                    email: values.email,
                    password: values.password
                };
                
                // Debug: Mostrar datos que se envían
                console.log('Datos a enviar:', loginData);
                
                // 3. Hacer petición POST al backend
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
                    loginData,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                // 4. Manejar respuesta exitosa
                console.log('Respuesta del servidor:', response.data);
                
                // Si llegamos aquí sin errores, el login fue exitoso
                if (response.status === 200 || response.status === 201) {
                    // Guardar token si el backend lo devuelve
                    if (response.data.token) {
                        localStorage.setItem('token', response.data.token);
                    }
                    
                    // Resetear formulario
                    resetForm({
                        values: {
                            email: "",
                            password: ""
                        },
                        errors: {},
                        touched: {}
                    });
                    
                    // Mostrar mensaje de éxito y redirigir
                    await Swal.fire({
                        icon: "success",
                        title: "¡Inicio de sesión exitoso!",
                        text: "Bienvenido de vuelta",
                        confirmButtonText: "Continuar",
                        confirmButtonColor: "#10B981",
                        timer: 2000
                    });
                    
                    // Redireccionar al home
                    router.push('/home');
                }
                
            } catch (error) {
                // 5. Manejar diferentes tipos de errores
                const axiosError = error as AxiosError<any>;
                
                console.error('Error de login:', axiosError);
                
                if (axiosError.response?.status === 400) {
                    // Errores de validación
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
                    // Credenciales incorrectas
                    setFieldError('email', 'Email o contraseña incorrectos');
                    setFieldError('password', 'Email o contraseña incorrectos');
                    await Swal.fire({
                        icon: "error",
                        title: "Credenciales incorrectas",
                        text: "El email o la contraseña son incorrectos",
                        confirmButtonColor: "#EF4444"
                    });
                    
                } else if (axiosError.response?.status === 404) {
                    // Usuario no encontrado
                    setFieldError('email', 'Usuario no encontrado');
                    await Swal.fire({
                        icon: "error",
                        title: "Usuario no encontrado",
                        text: "No existe una cuenta con este email",
                        confirmButtonColor: "#EF4444"
                    });
                    
                } else {
                    // Error de red o servidor
                    await Swal.fire({
                        icon: "error",
                        title: "Error de conexión",
                        text: "Hubo un error al iniciar sesión. Inténtalo de nuevo más tarde.",
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
    <div className="flex flex-col justify-center items-center pt-16 px-4">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-xl p-8 text-center">
        <h2 className="text-txt1 text-3xl font-bold mb-4">Iniciar Sesión</h2>
        <p className="text-txt2 text-md mb-6">Conecta con otros artistas y descubre nuevas oportunidades</p>
      
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Campo Email */}
        <div className="text-left">
          <label htmlFor="email" className="block text-txt1 text-lg font-semibold mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={`w-full px-4 py-3 border-2 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 bg-red-50"
                : "border-fondo1 bg-white focus:border-tur3"
            }`}
            placeholder="tu@email.com"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.email}</p>
          )}
        </div>

        {/* Campo Password */}
        <div className="text-left">
          <label htmlFor="password" className="block text-txt1 text-lg font-semibold mb-2">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className={`w-full px-4 py-3 border-2 text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 ${
              formik.touched.password && formik.errors.password
                ? "border-red-500 bg-red-50"
                : "border-fondo1 bg-white focus:border-tur3"
            }`}
            placeholder="••••••••"
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.password}</p>
          )}
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid}
          className={`w-full py-3 px-6 rounded-md text-lg font-sans shadow-xl transition duration-300 ${
            formik.isSubmitting || !formik.isValid
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-tur1 text-azul hover:bg-tur2 hover:text-oscuro2 hover:-translate-y-0.5 hover:cursor-pointer"
          }`}
        >
          {formik.isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      {/* Mensajes de estado */}
      {formik.status && (
        <div className={`mt-4 p-4 rounded-md shadow-md ${
          formik.status.type === "success" 
            ? "bg-tur1 border border-tur2 text-azul"
            : "bg-red-100 border border-red-400 text-red-700"
        }`}>
          <p className="font-medium">{formik.status.message}</p>
        </div>
      )}

      {/* Link para registro */}
      <div className="mt-8 text-center">
        <p className="text-txt2 text-md">
          ¿No tienes cuenta? 
          <a 
            href="/register" 
            className="ml-1 text-tur3 text-lg font-sans transition duration-400 hover:text-tur2 hover:cursor-pointer underline"
          >
            Regístrate aquí
          </a>
        </p>
      </div>

        {/* Decorative element */}
        <div className="mt-6">
          <h2 className="text-tur2 text-2xl font-semibold">♫</h2>
        </div>
      </div>
    </div>
  );
}