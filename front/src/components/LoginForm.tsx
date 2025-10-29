"use client"
import { useFormik } from "formik";
import * as Yup from "yup";

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
  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema,
    onSubmit: (values, { setSubmitting, setStatus }) => {
      // Simular llamada a API de login
      console.log("Datos del login:", values);
      
      setTimeout(() => {
        // Aquí iría la lógica real de autenticación
        if (values.email === "test@test.com" && values.password === "123456") {
          setStatus({ type: "success", message: "Login exitoso!" });
        } else {
          setStatus({ type: "error", message: "Datos incorrectos" });
        }
        setSubmitting(false);
      }, 1000);
    }
  });

  return (
    <div className="flex flex-col justify-center text-center w-[70%] max-w-md mx-auto my-16 gap-6 p-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-xl">
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
            className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 bg-red-50"
                : "border-fondo1 bg-white focus:border-tur3"
            }`}
            placeholder="tu@email.com"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-2 text-sm text-red-600 font-medium">{formik.errors.email}</p>
          )}
        </div>

        {/* Campo Password */}
        <div className="text-left">
          <label htmlFor="password" className="block color-grey-500 text-lg font-semibold mb-2">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 ${
              formik.touched.password && formik.errors.password
                ? "border-red-500 bg-red-50"
                : "border-fondo1 bg-white focus:border-tur3"
            }`}
            placeholder="••••••••"
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-2 text-sm text-red-600 font-medium">{formik.errors.password}</p>
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
  );
}