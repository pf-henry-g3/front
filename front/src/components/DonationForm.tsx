"use client"
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";

// Schema de validación: solo monto
const validationSchema = Yup.object({
  amount: Yup.number().required("Selecciona un monto").min(1, "El monto debe ser mayor a 0"),
});

export default function DonationForm() {
  const formik = useFormik({
    initialValues: {
      amount: 0,
      custom: "",
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setSubmitting(true);
      const amount = Number(values.custom) > 0 ? Number(values.custom) : Number(values.amount);
      const params = new URLSearchParams({ amount: String(amount) }).toString();

      // Redirige a la pasarela de pago (URL placeholder)
      const paymentUrl = `https://payment.example.com/checkout?${params}`;
      window.location.assign(paymentUrl);
    },
  });

  const presetAmounts = [0.99, 4.99, 9.99];

  return (
    <div className="flex flex-col justify-center items-center py-8 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl text-txt1 font-bold mb-2 text-center">¡Apoyanos realizando donaciones!</h2>
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
                        ? "bg-tur2 text-white shadow"
                        : "bg-white text-gray-800 border border-gray-200 hover:bg-tur1 hover:shadow-sm"
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
                className="ml-2 w-28 px-3 py-2 border rounded-md bg-white"
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
                  : "bg-tur1 text-white hover:bg-tur2 hover:cursor-pointer"
              }`}
            >
              {formik.isSubmitting ? "Redireccionando..." : `Pagar $${Number(formik.values.custom) > 0 ? formik.values.custom : formik.values.amount}`}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-center text-gray-300">
          No recopilamos datos personales en este formulario. Serás redirigido a la plataforma de pago.
        </p>
      </div>
    </div>
  );
}