"use client";

import { useState } from "react";
import axios from "axios";

export default function ReSendMailButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const clickHandler = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";
      const res = await axios.post(`${base}/user/send-verification`, {}, { timeout: 10000 });
      setMsg(res.data?.message ?? "Correo reenviado");
    } catch (err: any) {
      setMsg(err?.response?.data?.message ?? err?.message ?? "Error al reenviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={clickHandler}
        disabled={loading}
        className={`px-3 py-2 rounded ${loading ? "opacity-60 cursor-not-allowed" : "hover:brightness-95"}`}
      >
        {loading ? "Enviando..." : "Reenviar"}
      </button>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
    </div>
  );
}