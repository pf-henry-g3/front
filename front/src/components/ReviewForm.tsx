"use client"

import axios from "axios";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";

interface CreateReviewDto {
  receptorUserName: string;  // viene desde afuera
  score: number;
  reviewDescription: string;
}

export default function ReviewForm({ receptorUserName }: { receptorUserName: string }) {

  const validationSchema = Yup.object({

    score: Yup.number()
      .min(1, "La valoración no puede ser menor a 1")
      .max(5, "La valoración no puede ser mayor a 5")
      .required("La valoración es requerida"),

    reviewDescription: Yup.string()
      .min(10, "La descripción debe tener al menos 10 caracteres")
      .max(1000, "La descripción no puede exceder 1000 caracteres")
      .required("La descripción es requerida"),
  });

  const formik = useFormik<CreateReviewDto>({
    initialValues: {
      receptorUserName,
      score: 0,
      reviewDescription: "",
    },
    validationSchema,
    enableReinitialize: true, // importante si receptorUserName llega async
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setSubmitting(true);

        const reviewRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/review`,
          values,
          { headers: { "Content-Type": "application/json" } }
        );

        await Swal.fire({
          icon: "success",
          title: "Reseña creada!",
          text: "La reseña se ha publicado exitosamente",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#10B981",
          timer: 2000
        });

        resetForm();
      } catch (error) {
        console.error("Error creando reseña:", error);

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al crear la reseña.",
          confirmButtonColor: "#EF4444"
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="max-w-xl mx-auto mt-3 pt-10 p-5 border-t-2 border-txt2 overflow-y-auto ">
      <h2 className="text-2xl font-bold mb-4 text-oscuro1">Publicar Reseña</h2>

      <form onSubmit={formik.handleSubmit}>

        {/* Score */}
        <label className="block mb-2 font-semibold text-oscuro2">Puntuación (1 a 5)</label>
        <input
          type="number"
          name="score"
          className="w-full p-2 border rounded text-oscuro3"
          value={formik.values.score}
          onChange={formik.handleChange}
          min={1}
          max={5}
        />
        {formik.errors.score && formik.touched.score && (
          <p className="text-red-500 text-sm">{formik.errors.score}</p>
        )}

        {/* Review */}
        <label className="block mt-4 mb-2 font-semibold text-oscuro2 ">Descripción</label>
        <textarea
          name="reviewDescription"
          className="w-full p-2 border rounded text-oscuro3"
          rows={4}
          value={formik.values.reviewDescription}
          onChange={formik.handleChange}
        />
        {formik.errors.reviewDescription && formik.touched.reviewDescription && (
          <p className="text-red-500 text-sm">{formik.errors.reviewDescription}</p>
        )}

        {/* Botón */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="mt-6 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 disabled:bg-gray-400"
        >
          {formik.isSubmitting ? "Publicando..." : "Publicar Reseña"}
        </button>
      </form>
    </div>
  );
}
