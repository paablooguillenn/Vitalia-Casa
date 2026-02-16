"use client"

import { useMemo, useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, Clock, Users, CheckCircle, AlertCircle } from "lucide-react"

export default function DoctorDashboard() {
    const todayStr = new Date().toISOString().split("T")[0];
    const { user } = useAuth();
    const today = new Date().toISOString().split("T")[0];
    const [appointments, setAppointments] = useState<any[]>([]);
    const historyAppointments = appointments.filter((a) => a.dateTime && a.dateTime.split('T')[0] < todayStr);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://172.20.10.4:8080/api/users/${user.id}/appointments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const statusMap = {
          'CONFIRMED': 'CONFIRMADA',
          'PENDING': 'PENDIENTE',
          'COMPLETED': 'COMPLETADA',
          'CANCELLED': 'CANCELADA',
        };
        const mapped = data.map((apt) => ({
          ...apt,
          patientName: apt.patient?.nombre || '',
          time: apt.dateTime ? new Date(apt.dateTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '',
          status: statusMap[apt.status] || apt.status
        }));
        setAppointments(mapped);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const todayAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        // a.dateTime formato ISO, extraer fecha
        const date = a.dateTime?.split("T")[0];
        return date === today;
      })
      .sort((a, b) => (a.dateTime || '').localeCompare(b.dateTime || ''));
  }, [appointments, today]);

  const confirmed = todayAppointments.filter((a) => a.status === "CONFIRMED" || a.status === "CONFIRMADA").length;
  const pending = todayAppointments.filter((a) => a.status === "PENDIENTE" || a.status === "PENDING").length;

  const nextAppointment = todayAppointments.find((a) => {
    if (!a.dateTime) return false;
    const now = new Date();
    const aptDate = new Date(a.dateTime);
    return (a.status === "CONFIRMED" || a.status === "CONFIRMADA" || a.status === "PENDIENTE" || a.status === "PENDING") && aptDate > now;
  });

  useEffect(() => {
    if (!nextAppointment || !nextAppointment.dateTime) return;
    const update = () => {
      const now = new Date();
      const target = new Date(nextAppointment.dateTime);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown("Ahora");
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${hours}h ${mins}m`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [nextAppointment]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Panel del Doctor{user?.name ? ` - ${user.name}` : user?.nombre ? ` - ${user.nombre}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
              <p className="text-xs text-muted-foreground">Pacientes Hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pending}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next appointment countdown */}
      {nextAppointment && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription>Proxima Cita</CardDescription>
            <CardTitle className="flex items-center gap-3 text-lg text-foreground">
              {nextAppointment.patientName}
              <span className="text-sm font-normal text-primary">{countdown}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {nextAppointment.time} hrs
              </span>
              <StatusBadge status={nextAppointment.status} />
              {nextAppointment.notes && <span className="text-xs">- {nextAppointment.notes}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's patients */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Pacientes del Dia</h2>
        {todayAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No tiene citas programadas hoy</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {todayAppointments.map((apt) => (
              <Card key={apt.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                      {apt.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{apt.patientName}</p>
                    {apt.notes && <p className="text-xs text-muted-foreground truncate">{apt.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-foreground">{apt.time}</span>
                    <StatusBadge status={apt.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Historial de citas */}
      {historyAppointments.length > 0 && (
        <div className="flex flex-col gap-3 mt-6">
          <h2 className="text-lg font-semibold text-foreground">Historial de Citas</h2>
          <div className="flex flex-col gap-2">
            {historyAppointments.slice(0, 6).map((apt) => (
              <Card key={apt.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                      {apt.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{apt.patientName}</p>
                    {apt.notes && <p className="text-xs text-muted-foreground truncate">{apt.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-foreground">{apt.time}</span>
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
