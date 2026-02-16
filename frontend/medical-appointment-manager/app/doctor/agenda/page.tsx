"use client"

import { useMemo, useState, useEffect } from "react"
import { appointments } from "@/lib/mock-data"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
const HOURS = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`)

function getWeekDates(offset: number) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1 + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function DoctorAgendaPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const { user } = require("@/lib/auth-context").useAuth();
  const [doctorAppointments, setDoctorAppointments] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState<string | number | null>(null);
  const todayStr = new Date().toISOString().split("T")[0];
  // Forzar doctorId correcto para Elena Vázquez
  useEffect(() => {
    if (!user) return;
    // Si el usuario es Elena Vázquez, forzar doctorId=7
    if (user.nombre === "Dra. Elena Vázquez" || user.name === "Dra. Elena Vázquez") {
      setDoctorId(7);
      console.log("DoctorAgenda: Forzando doctorId=7 para Elena Vázquez");
      return;
    }
    if (user.doctor?.id) {
      setDoctorId(user.doctor.id);
      console.log("DoctorAgenda: doctorId desde user.doctor.id", user.doctor.id);
    } else {
      // Buscar doctorId por userId
      fetch(`http://192.168.68.58:8080/api/doctors?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDoctorId(data[0].id);
            console.log("DoctorAgenda: doctorId obtenido por userId", data[0].id);
          } else {
            console.log("DoctorAgenda: No se encontró doctor para userId", user.id);
          }
        });
    }
  }, [user]);

  // Eliminado segundo useEffect duplicado que sobrescribía doctorId

  useEffect(() => {
    if (!doctorId) {
      console.log("DoctorAgenda: doctorId no disponible, no se hace fetch");
      return;
    }
    console.log('DoctorAgenda: doctorId usado para fetch', doctorId);
    const start = weekDates[0].toISOString().split("T")[0] + "T00:00:00";
    const end = weekDates[6].toISOString().split("T")[0] + "T23:59:59";
    fetch(`http://localhost:8080/api/appointments/doctor/${doctorId}/range?start=${start}&end=${end}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('DoctorAgenda: citas recibidas', data);
        const statusMap = {
          'CONFIRMED': 'CONFIRMADA',
          'PENDING': 'PENDIENTE',
          'COMPLETED': 'COMPLETADA',
          'CANCELLED': 'CANCELADA',
        };
        const mapped = data.map((apt: any) => ({
          ...apt,
          patientName: apt.patient?.nombre || '',
          date: apt.dateTime ? apt.dateTime.split('T')[0] : '',
          time: apt.dateTime ? new Date(apt.dateTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '',
          status: statusMap[apt.status] || apt.status
        }));
        setDoctorAppointments(mapped);
      });
  }, [doctorId, weekDates]);

  const getAppForSlot = (date: Date, hour: string) => {
    const dateStr = date.toISOString().split("T")[0];
    return doctorAppointments.find((a) => a.date === dateStr && a.time.startsWith(hour.split(":")[0]));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Agenda Semanal</h1>
        <p className="text-sm text-muted-foreground">Vista semanal de sus citas programadas</p>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-foreground">
          {weekDates[0].toLocaleDateString("es-MX", { day: "numeric", month: "short" })} - {weekDates[6].toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-16 border-b border-r bg-card p-2 text-xs font-medium text-muted-foreground">
                  Hora
                </th>
                {weekDates.map((d, i) => {
                  const isToday = d.toISOString().split("T")[0] === todayStr
                  return (
                    <th
                      key={i}
                      className={cn(
                        "border-b p-2 text-center text-xs font-medium",
                        isToday ? "bg-primary/5 text-primary" : "text-muted-foreground"
                      )}
                    >
                      <div>{DAY_NAMES[d.getDay()]}</div>
                      <div className={cn("text-lg font-bold", isToday ? "text-primary" : "text-foreground")}>
                        {d.getDate()}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour}>
                  <td className="sticky left-0 z-10 border-r bg-card p-2 text-xs text-muted-foreground text-right">
                    {hour}
                  </td>
                  {weekDates.map((d, i) => {
                    const apt = getAppForSlot(d, hour)
                    return (
                      <td key={i} className="border-b border-r p-1 h-14 align-top">
                        {apt && (
                          <div className="flex flex-col gap-0.5 rounded-md bg-primary/10 p-1.5">
                            <span className="text-[10px] font-medium text-foreground truncate">{apt.patientName.split(" ")[0]}</span>
                            <StatusBadge status={apt.status} />
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
