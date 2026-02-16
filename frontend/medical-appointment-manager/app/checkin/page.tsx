"use client"


import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";


export default function CheckinPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"pending"|"success"|"already"|"fail">("pending");
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    if (!token) return setStatus("fail");
    fetch(`http://192.168.56.1:8080/api/appointments/checkin?token=${token}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.id) {
          setAppointment(data);
          if (data.status === "CHECKED_IN" || data.status === "EN CONSULTA") setStatus("already");
          else setStatus("success");
        } else {
          setStatus("fail");
        }
      });
  }, [token]);

  if (status === "pending") return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <span className="text-lg font-semibold">Cargando...</span>
    </div>
  );

  if (status === "fail") return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <XCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Cita no encontrada</h2>
      <p>El código QR no es válido o la cita no existe.</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
      <h2 className="text-3xl font-bold mb-2">¡Bienvenido a tu cita médica!</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-4 w-full max-w-md">
        <div className="mb-2 text-left">
          <b>Paciente:</b> {appointment?.patient?.nombre}
        </div>
        <div className="mb-2 text-left">
          <b>Doctor:</b> {appointment?.doctor?.nombre} ({appointment?.doctor?.especialidad})
        </div>
        <div className="mb-2 text-left">
          <b>Fecha y hora:</b> {appointment?.dateTime?.replace("T", " ").slice(0, 16)}
        </div>
        <div className="mb-2 text-left">
          <b>Estado:</b> <span className="font-semibold text-green-600">En consulta</span>
        </div>
      </div>
      <p className="text-lg">Tu llegada ha sido registrada correctamente.<br />Por favor, espera a ser llamado por el doctor.</p>
      {status === "already" && (
        <p className="mt-4 text-yellow-600">Ya habías realizado el check-in para esta cita.</p>
      )}
    </div>
  );
}
