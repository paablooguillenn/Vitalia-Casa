"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function CheckinContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading"|"ok"|"error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    // Llama al backend para actualizar el estado de la cita
    fetch(`/api/appointments/checkin?token=${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        // PATCH para poner la cita en estado EN_CONSULTA
        const apt = await res.json();
        if (!apt || !apt.id) throw new Error();
        // Actualiza el estado a EN_CONSULTA
        await fetch(`/api/appointments/${apt.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "EN_CONSULTA" })
        });
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") return <div className="text-center py-10">Cargando...</div>;
  if (status === "error") return <div className="text-center py-10 text-red-500">No se pudo validar el check-in. Token inválido o cita no encontrada.</div>;
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6 bg-white rounded-xl shadow-lg max-w-md mx-auto mt-10 p-8 border border-emerald-100">
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-2 shadow-inner">
        <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="#d1fae5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 13l3 3 6-6" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold text-emerald-700 text-center">¡Bienvenido a la consulta!</h1>
      <p className="text-lg text-gray-700 text-center">Por favor, espere a ser atendido.<br/>Su llegada ha sido registrada correctamente.</p>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Cargando...</div>}>
      <CheckinContent />
    </Suspense>
  );
}
