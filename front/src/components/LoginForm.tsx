"use client";
import axios, { AxiosError } from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { apiClient, apiClientWithToken } from "../lib/api-client";

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
  const { loginWithRedirect } = useAuth0();

  const handleGoogleSignIn = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: "google-oauth2",
          redirect_uri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo iniciar sesión con Google",
        confirmButtonColor: "#EF4444",
      });
    }
  };

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
          email: values.email.trim(),
          password: values.password.trim()
        };

        // Debug: Mostrar datos que se envían
        console.log('Datos a enviar:', loginData);


        const response = await apiClient.post('auth/signin', loginData);
        const user = response.data.data.userWithoutPassword
        console.log('✅ Login exitoso:', user);
        console.log('🍪 Cookie guardada automáticamente');


        // 4. Manejar respuesta según código
        if (response.status >= 200 && response.status < 300) {
          // ❌ YA NO guardamos el token en localStorage
          // ✅ El token ahora está en una cookie HttpOnly (automático)

          // Solo guardamos el usuario para UI (opcional)
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            console.log('👤 Usuario guarado en localStorage:', user);
          }

          resetForm({ values: { email: "", password: "" }, errors: {}, touched: {} });

          await Swal.fire({
            icon: "success",
            title: "¡Inicio de sesión exitoso!",
            text: "Bienvenido de vuelta",
            confirmButtonText: "Continuar",
            confirmButtonColor: "#10B981",
            timer: 1500
          });

          router.push('/dashboard');
          return;

        } else if (response.status === 400) {
          const errorData = response.data;
          const backendMsg = typeof errorData?.message === 'string' ? errorData.message : undefined;
          if (backendMsg) {
            await Swal.fire({ icon: "error", title: "Error", text: backendMsg, confirmButtonColor: "#EF4444" });
            return;
          }
          if (errorData?.message && Array.isArray(errorData.message)) {
            await Swal.fire({ icon: "error", title: "Errores de validación", html: errorData.message.map((m: string) => `• ${m}`).join('<br>'), confirmButtonColor: "#EF4444" });
            return;
          }
          await Swal.fire({ icon: "error", title: "Error de validación", text: errorData?.message || "Datos inválidos", confirmButtonColor: "#EF4444" });
          return;
        } else if (response.status === 401) {
          await Swal.fire({ icon: "error", title: "Credenciales incorrectas", text: "El email o la contraseña son incorrectos", confirmButtonColor: "#EF4444" });
          return;
        } else if (response.status === 404) {
          await Swal.fire({ icon: "error", title: "Usuario no encontrado", text: "No existe una cuenta con este email", confirmButtonColor: "#EF4444" });
          return;
        } else {
          await Swal.fire({ icon: "error", title: "Error", text: "No se pudo iniciar sesión. Intenta nuevamente.", confirmButtonColor: "#EF4444" });
          return;
        }

      } catch (error) {
        // 5. Manejar diferentes tipos de errores
        const axiosError = error as AxiosError<any>;

        console.error('Error de login:', axiosError);

        if (axiosError.response?.status === 400) {
          // Errores de validación
          const errorData = axiosError.response.data;

          // Mostrar mensaje directo del backend si existe
          const backendMsg = typeof errorData?.message === 'string' ? errorData.message : undefined;
          if (backendMsg) {
            await Swal.fire({
              icon: "error",
              title: "Error",
              text: backendMsg,
              confirmButtonColor: "#EF4444"
            });
            return;
          }

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
              className={`w-full px-4 py-3 border-2 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 ${formik.touched.email && formik.errors.email
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
              className={`w-full px-4 py-3 border-2 text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 ${formik.touched.password && formik.errors.password
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
            className={`w-full py-3 px-6 rounded-md text-lg font-sans shadow-xl transition duration-300 ${formik.isSubmitting || !formik.isValid
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-tur1 text-azul hover:bg-tur2 hover:text-oscuro2 hover:-translate-y-0.5 hover:cursor-pointer"
              }`}
          >
            {formik.isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/30" />
          <span className="text-white/70 text-sm">O continúa con</span>
          <div className="h-px flex-1 bg-white/30" />
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-6 rounded-md text-lg font-sans shadow transition duration-300 bg-white text-oscuro1 hover:bg-gray-100 flex items-center justify-center gap-3 border border-white/40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12  s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24  s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657  C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.191-5.238C29.211,35.091,26.715,36,24,36  c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.237-2.231,4.166-4.094,5.571  c0.001-0.001,0.002-0.001,0.003-0.002l6.191,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          Continuar con Google
        </button>

        {/* Mensajes de estado */}
        {formik.status && (
          <div className={`mt-4 p-4 rounded-md shadow-md ${formik.status.type === "success"
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