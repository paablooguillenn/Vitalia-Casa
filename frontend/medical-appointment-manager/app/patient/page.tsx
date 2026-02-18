
"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, ArrowRight, CalendarPlus, Stethoscope, QrCode } from "lucide-react"

export default function PatientDashboard() {
  const { user } = useAuth()
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  // Handler para el escaneo QR
  const handleScan = (data: string | null) => {
    if (data) {
      setShowScanner(false);
      // Buscar token en la URL escaneada
      const match = data.match(/token=([a-zA-Z0-9\-]+)/);
      if (match && match[1]) {
        router.push(`/checkin?token=${match[1]}`);
      } else {
        alert("QR no válido para check-in");
      }
    }
  };
  const handleError = (err: any) => {
    alert("Error al acceder a la cámara o leer el QR");
    setShowScanner(false);
  };

  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const myAppointments = appointments
    .filter((a) => String(a.patientId) === String(user?.id))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const todayStr = new Date().toISOString().split("T")[0];
  const historyAppointments = myAppointments.filter((a) => a.date < todayStr);
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`/api/appointments/patient/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Adaptar los datos recibidos al formato esperado
        const statusMap: Record<string, string> = {
          'CONFIRMED': 'CONFIRMADA',
          'PENDING': 'PENDIENTE',
          'COMPLETED': 'COMPLETADA',
          'CANCELLED': 'CANCELADA',
          'CHECKED_IN': 'EN CONSULTA',
        };
        const mapped = data.map((apt: any) => {
          const [date, time] = apt.dateTime ? apt.dateTime.split('T') : [null, null];
          return {
            ...apt,
            date: date,
            time: time ? time.substring(0,5) : '',
            doctorName: apt.doctor?.nombre || 'Sin asignar',
            specialty: apt.doctor?.specialty || '',
            patientId: apt.patient?.id,
            status: statusMap[apt.status] || apt.status,
          };
        });
        setAppointments(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.id]);


  const nextAppointment = myAppointments.find(
    (a) => (a.status === "CONFIRMADA" || a.status === "PENDIENTE") && a.date >= new Date().toISOString().split("T")[0]
  );

  const upcoming = myAppointments.filter(
    (a) => (a.status === "CONFIRMADA" || a.status === "PENDIENTE") && a.date >= new Date().toISOString().split("T")[0]
  );

  const completed = myAppointments.filter((a) => a.status === "COMPLETADA").length;



  return (
    <div className="flex flex-col gap-6">
      {/* Modal/overlay para escanear QR */}
      {showScanner && isClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2">Escanear QR de Check-in</h2>
            <div className="w-72 h-72">
            </div>
            <Button className="mt-4" variant="outline" onClick={() => setShowScanner(false)}>Cancelar</Button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowScanner(true)}
            className="rounded-full bg-primary p-3 shadow hover:bg-primary/80 transition-colors"
            title="Escanear QR"
          >
            <QrCode className="w-6 h-6 text-white" />
          </button>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Hola, {user?.name?.split(" ")[0] || user?.nombre?.split(" ")[0] || "Paciente"}
        </h1>
        <p className="text-muted-foreground text-sm">Resumen de sus citas medicas</p>
      </div>
      {myAppointments.length === 0 && (
        <div className="text-center text-red-500">No hay citas para mostrar (depuración)</div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">Citas Proximas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completed}</p>
              <p className="text-xs text-muted-foreground">Completadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {myAppointments.filter((a) => a.status === "PENDIENTE").length}
              </p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next appointment hero */}
      {nextAppointment ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription>Proxima Cita</CardDescription>
            <CardTitle className="text-lg text-foreground">{nextAppointment.doctorName}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {new Date(nextAppointment.date + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {nextAppointment.time} hrs
              </span>
              <StatusBadge status={nextAppointment.status} />
            </div>
            <p className="text-sm text-muted-foreground">{nextAppointment.specialty}</p>
            {nextAppointment.notes && <p className="text-xs text-muted-foreground/70">{nextAppointment.notes}</p>}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <CalendarPlus className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No tiene citas proximas</p>
            <Button asChild size="sm">
              <Link href="/patient/new-appointment">Agendar Cita</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upcoming list */}
      {upcoming.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Proximas Citas</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/patient/appointments" className="flex items-center gap-1 text-primary">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {upcoming.slice(0, 4).map((apt) => (
              <Card key={apt.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">{apt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-medium text-foreground">{apt.time} hrs</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(apt.date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Historial de citas */}
      {historyAppointments.length > 0 && (
        <div className="flex flex-col gap-3 mt-6">
          <h2 className="text-lg font-semibold text-foreground">Historial de Citas</h2>
          <div className="flex flex-col gap-2">
            {historyAppointments.slice(0, 6).map((apt) => (
              <Card key={apt.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">{apt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-medium text-foreground">{apt.time} hrs</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(apt.date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
