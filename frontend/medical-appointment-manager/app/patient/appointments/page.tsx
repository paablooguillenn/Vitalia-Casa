"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { StatusBadge } from "@/components/shared/status-badge"
import type { AppointmentStatus } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 6

export default function PatientAppointmentsPage() {

  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [appointments, setAppointments] = useState<any[]>([])
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean, aptId?: number }>({ open: false })
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/users/${user.id}/appointments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Función robusta para mapear cualquier variante de estado
        function normalizeStatus(status: string): string {
          if (!status) return 'DESCONOCIDO';
          const s = status.toUpperCase().replace(/\s|-/g, '_');
          if (["CONFIRMADA", "CONFIRMADO", "CONFIRMED"].includes(s)) return "CONFIRMADA";
          if (["PENDIENTE", "PENDING"].includes(s)) return "PENDIENTE";
          if (["COMPLETADA", "COMPLETADO", "COMPLETED"].includes(s)) return "COMPLETADA";
          if (["CANCELADA", "CANCELADO", "CANCELLED"].includes(s)) return "CANCELADA";
          if (["EN_CONSULTA", "ENCONSULTA", "CHECKED_IN", "CHECKEDIN"].includes(s)) return "EN CONSULTA";
          return "DESCONOCIDO";
        }
        const mapped = data.map((apt: any) => {
          const mappedStatus = normalizeStatus(apt.status);
          if (mappedStatus === 'DESCONOCIDO') {
            // eslint-disable-next-line no-console
            console.warn('Estado desconocido recibido:', apt.status, apt);
          }
          return {
            ...apt,
            status: mappedStatus
          };
        });
        setAppointments(mapped);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = useMemo(() => {
    let list = appointments;
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter)
    }
    // Ordenar por fecha descendente
    return list.sort((a, b) => (b.dateTime || '').localeCompare(a.dateTime || ''))
  }, [appointments, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Mis Citas</h1>
        <p className="text-sm text-muted-foreground">Historial completo de sus citas medicas</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="COMPLETADA">Completada</SelectItem>
            <SelectItem value="CANCELADA">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} citas</span>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Cargando citas...</p>
            </CardContent>
          </Card>
        ) : paginated.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No se encontraron citas</p>
            </CardContent>
          </Card>
        ) : (
          paginated.map((apt) => {
            const doctorName = apt.doctor?.nombre || apt.doctorName || "";
            const specialty = apt.doctor?.especialidad || apt.specialty || "";
            const dateObj = apt.dateTime ? new Date(apt.dateTime) : null;
            const canCancel = apt.status === "CONFIRMADA" || apt.status === "PENDIENTE";
            return (
              <Card key={apt.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground">{doctorName}</p>
                    <p className="text-xs text-muted-foreground">{specialty}</p>
                    {apt.notes && <p className="text-xs text-muted-foreground/70 line-clamp-1">{apt.notes}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className="flex items-center gap-1 text-xs text-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {dateObj ? dateObj.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : ""}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {dateObj ? dateObj.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                    <StatusBadge status={apt.status} />
                    {canCancel && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setCancelDialog({ open: true, aptId: apt.id })}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        {/* Dialog de confirmación de cancelación (fuera del map) */}
        <Dialog open={cancelDialog.open} onOpenChange={open => setCancelDialog(v => ({ ...v, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar cita</DialogTitle>
              <DialogDescription>¿Seguro que quieres cancelar esta cita? Esta acción no se puede deshacer.</DialogDescription>
            </DialogHeader>
            {cancelError && (
              <div className="text-sm text-red-500 mb-2">{cancelError}</div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={cancelLoading}>No, volver</Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={cancelLoading}
                onClick={async () => {
                  if (!cancelDialog.aptId) return;
                  setCancelLoading(true);
                  setCancelError(null);
                  try {
                    const res = await fetch(`/api/appointments/${cancelDialog.aptId}/cancel`, {
                      method: "PATCH",
                      headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                        "Content-Type": "application/json"
                      }
                    });
                    if (!res.ok) {
                      let msg = `No se pudo cancelar la cita (Status: ${res.status})`;
                      try {
                        const data = await res.json();
                        if (data && data.message) msg += `: ${data.message}`;
                        else if (typeof data === 'string') msg += `: ${data}`;
                      } catch {
                        try {
                          const text = await res.text();
                          if (text) msg += `: ${text}`;
                        } catch {}
                      }
                      throw new Error(msg);
                    }
                    setAppointments((prev: any[]) => prev.map(a => a.id === cancelDialog.aptId ? { ...a, status: "CANCELADA" } : a));
                    setCancelDialog({ open: false });
                  } catch (err: any) {
                    setCancelError(err.message || "No se pudo cancelar la cita");
                  } finally {
                    setCancelLoading(false);
                  }
                }}
              >
                Sí, cancelar cita
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
