"use client"
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

const validationSchema = Yup.object({
  amount: Yup.number().required("Selecciona un monto").min(1, "El monto debe ser mayor a 0"),
});

async function createDonationOnBackend(amount: number) {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";
  try {
    const res = await axios.post(`${apiBase}/payment/create-donation`, { amount }, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    const data = res.data;

    // intenta extraer la URL de checkout (init_point para MercadoPago)
    if (!data) throw new Error("Respuesta vacía del servidor");

    if (typeof data === "string") return data;
    return (data.init_point ?? data.url ?? data.checkoutUrl ?? JSON.stringify(data)) as string;
  } catch (err: any) {
    // axios error handling
    const msg = err?.response?.data
      ? (typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data))
      : err?.message ?? "Error en la petición";
    throw new Error(msg);
  }
}

export default function DonationForm() {
  const formik = useFormik({
    initialValues: { amount: 0, custom: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setSubmitting(true);
      try {
        const amount = Number(values.custom) > 0 ? Number(values.custom) : Number(values.amount);
        if (!amount || amount <= 0) throw new Error("Selecciona un monto válido");

        const checkoutUrl = await createDonationOnBackend(amount);
        if (!checkoutUrl) throw new Error("No se recibió URL de pago desde el servidor");

        window.location.assign(checkoutUrl);
      } catch (err: any) {
        console.error("Error creando donación:", err);
        setStatus({ type: "error", message: err?.message ?? "Error al crear la donación" });
        setSubmitting(false);
      }
    },
  });

  const presetAmounts = [1000, 5000, 20000];

  return (
    <div className="flex flex-col justify-center items-center py-8 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl text-txt1 font-bold mb-2 text-center">¡Apóyanos con una donación!</h2>
        <p className="text-sm mb-4 text-txt2 text-center">Puedes ayudar al desarrollo y crecimiento de la página gracias a tu aporte monetario</p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Monto</label>
            <div className="flex gap-3 flex-wrap">
              {presetAmounts.map((amt) => {
                const active = Number(formik.values.amount) === amt && formik.values.custom === "";
                return (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => {
                      formik.setFieldValue("amount", amt);
                      formik.setFieldValue("custom", "");
                    }}
                    className={`px-4 py-2 rounded-md font-semibold transition hover:cursor-pointer ${
                      active
                        ? "bg-tur2 text-white shadow border-0"
                        : "bg-white text-gray-800 border-0 border-gray-200 hover:bg-tur1 hover:shadow-sm"
                    }`}
                  >
                    ${amt}
                  </button>
                );
              })}

              <input
                type="number"
                min={1}
                placeholder="Otro"
                value={formik.values.custom}
                onChange={(e) => {
                  const v = e.target.value;
                  formik.setFieldValue("custom", v);
                  formik.setFieldValue("amount", 0);
                }}
                className="ml-2 w-28 px-3 py-2 rounded-md border-0 text-gray-800 bg-white"
              />
            </div>
            {formik.touched.amount && formik.errors.amount && (
              <p className="mt-2 text-sm text-red-600">{String(formik.errors.amount)}</p>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={formik.isSubmitting || (Number(formik.values.amount) <= 0 && Number(formik.values.custom || 0) <= 0)}
              className={`w-full py-3 rounded-md text-lg font-semibold transition  ${
                formik.isSubmitting || (Number(formik.values.amount) <= 0 && Number(formik.values.custom || 0) <= 0)
                  ? "bg-verde cursor-not-allowed text-white"
                  : "bg-tur1 text-gray-800 hover:text-txt1 hover:bg-tur2 hover:cursor-pointer"
              }`}
            >
              {formik.isSubmitting ? "Redireccionando..." : `Pagar $${Number(formik.values.custom) > 0 ? formik.values.custom : formik.values.amount}`}
            </button>
          </div>

          {formik.status && (
            <div className={`mt-3 p-3 rounded-md ${formik.status.type === "error" ? "bg-red-50 text-red-900" : "bg-green-50 text-green-900"}`}>
              <p className="text-sm">{String(formik.status.message)}</p>
            </div>
          )}
        </form>

        <p className="mt-4 text-xs text-center text-gray-300">
          No recopilamos datos personales en este formulario. Serás redirigido a la plataforma de pago.
        </p>
      </div>
    </div>
  );
}