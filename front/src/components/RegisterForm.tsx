"use client";

import { useFormik } from "formik";
import * as Yup from "yup";

// Schema de validación con Yup
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .required("El nombre es requerido"),
  email: Yup.string()
    .email("Email inválido")
    .required("El email es requerido"),
  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número"
    )
    .required("La contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], "Las contraseñas deben coincidir")
    .required("Confirmar contraseña es requerido"),
  instrument: Yup.string()
    .required("Selecciona tu instrumento principal"),
  genre: Yup.string()
    .required("Selecciona tu género musical favorito"),
  experience: Yup.string()
    .required("Selecciona tu nivel de experiencia"),
  terms: Yup.boolean()
    .oneOf([true], "Debes aceptar los términos y condiciones")
});

export default function RegisterForm() {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      instrument: "",
      genre: "",
      experience: "",
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
    <div className="flex flex-col justify-center text-center w-[90%] max-w-2xl mx-auto my-16 gap-6 p-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-xl">
      <h2 className="text-txt1 text-3xl font-bold mb-4">Únete a la Comunidad</h2>
      <p className="text-txt2 text-md mb-6">Crea tu perfil y conecta con músicos de todo el mundo</p>
      
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Primera fila - Nombre y Email */}
        <div className="flex flex-col md:flex-cols-2 gap-4">
          {/* Campo Nombre */}
          <div className="text-left">
            <label htmlFor="name" className="block text-txt1 text-lg font-semibold mb-2">
              Nombre Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 ${
                formik.touched.name && formik.errors.name
                  ? "border-red-500 bg-red-50"
                  : "border-fondo1 bg-white focus:border-tur3"
              }`}
              placeholder="Tu nombre completo"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.name}</p>
            )}
          </div>

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
              className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 ${
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
        </div>

        {/* Segunda fila - Contraseñas */}
        <div className="flex flex-col md:flex-cols-2 gap-4">
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
              className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 bg-red-50"
                  : "border-fondo1 bg-white focus:border-tur3"
              }`}
              placeholder="••••••••"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-2 text-sm text-red-700 font-medium">{formik.errors.password}</p>
            )}
          </div>

          {/* Campo Confirmar Password */}
          <div className="text-left">
            <label htmlFor="confirmPassword" className="block  text-txt1 text-lg font-semibold mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
              className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 placeholder:text-gray-600 ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
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

        {/* Tercera fila - Información musical */}
        <div className="flex flex-col md:flex-cols-2 gap-4">
          {/* Campo Instrumento */}
          <div className="text-left">
            <label htmlFor="instrument" className="block text-txt1 text-lg font-semibold mb-2">
              Instrumento Principal
            </label>
            <select
              id="instrument"
              name="instrument"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.instrument}
              className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 text-gray-800 ${
                formik.touched.instrument && formik.errors.instrument
                  ? "border-red-500 bg-red-50"
                  : "border-fondo1 bg-white focus:border-tur3"
              }`}
            >
              <option value="">Selecciona...</option>
              <option value="guitarra">Guitarra</option>
              <option value="piano">Piano</option>
              <option value="bajo">Bajo</option>
              <option value="bateria">Batería</option>
              <option value="violin">Violín</option>
              <option value="saxofon">Saxofón</option>
              <option value="trompeta">Trompeta</option>
              <option value="voz">Voz</option>
              <option value="otro">Otro</option>
            </select>
            {formik.touched.instrument && formik.errors.instrument && (
              <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.instrument}</p>
            )}
          </div>

          {/* Campo Género */}
          <div className="text-left">
            <label htmlFor="genre" className="block text-txt1 text-lg font-semibold mb-2">
              Género Favorito
            </label>
            <select
              id="genre"
              name="genre"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.genre}
              className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 text-gray-800 ${
                formik.touched.genre && formik.errors.genre
                  ? "border-red-500 bg-red-50"
                  : "border-fondo1 bg-white focus:border-tur3"
              }`}
            >
              <option value="">Selecciona...</option>
              <option value="rock">Rock</option>
              <option value="pop">Pop</option>
              <option value="jazz">Jazz</option>
              <option value="blues">Blues</option>
              <option value="clasica">Clásica</option>
              <option value="folk">Folk</option>
              <option value="reggae">Reggae</option>
              <option value="electronica">Electrónica</option>
              <option value="otro">Otro</option>
            </select>
            {formik.touched.genre && formik.errors.genre && (
              <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.genre}</p>
            )}
          </div>

          {/* Campo Experiencia */}
          <div className="text-left">
            <label htmlFor="experience" className="block text-txt1 text-lg font-semibold mb-2">
              Nivel de Experiencia
            </label>
            <select
              id="experience"
              name="experience"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.experience}
              className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-tur2 transition duration-300 text-gray-800 ${
                formik.touched.experience && formik.errors.experience
                  ? "border-red-500 bg-red-50"
                  : "border-fondo1 bg-white focus:border-tur3"
              }`}
            >
              <option value="">Selecciona...</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
              <option value="profesional">Profesional</option>
            </select>
            {formik.touched.experience && formik.errors.experience && (
              <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.experience}</p>
            )}
          </div>
        </div>

        {/* Términos y condiciones */}
        <div className="text-left">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="terms"
              checked={formik.values.terms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-5 h-5 text-tur1 border-2 border-fondo1 rounded focus:ring-tur2"
            />
            <span className="text-txt2 text-md">
              Acepto los{" "}
              <a href="/terms" className="text-tur3 hover:text-tur2 underline">
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a href="/privacy" className="text-tur3 hover:text-tur2 underline">
                política de privacidad
              </a>
            </span>
          </label>
          {formik.touched.terms && formik.errors.terms && (
            <p className="mt-2 text-sm text-white-600 font-medium">{formik.errors.terms}</p>
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
          {formik.isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
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

      {/* Link para login */}
      <div className="mt-8 text-center">
        <p className="text-txt2 text-md">
          ¿Ya tienes cuenta? 
          <a 
            href="/login" 
            className="ml-1 text-tur3 text-lg font-sans transition duration-400 hover:text-tur2 hover:cursor-pointer underline"
          >
            Inicia sesión aquí
          </a>
        </p>
      </div>

      {/* Decorative element */}
      <div className="mt-6">
        <h2 className="text-tur2 text-2xl font-semibold">🎼</h2>
      </div>
    </div>
  );
}