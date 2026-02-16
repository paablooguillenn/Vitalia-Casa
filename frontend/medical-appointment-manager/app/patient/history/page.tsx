"use client"

import { useMemo, useState, useEffect } from "react"
import QRCode from "react-qr-code"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

const PAGE_SIZE = 8

export default function PatientHistoryPage() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [appointments, setAppointments] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetch(`http://172.20.10.4:8080/api/appointments/patient/${user.id}`, {
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
          'CHECKED_IN': 'EN CONSULTA',
        };
        const mapped = data.map((apt: any) => {
          const [date, time] = apt.dateTime ? apt.dateTime.split('T') : [null, null];
          return {
            ...apt,
            date: date,
            time: time ? time.substring(0,5) : '',
            doctorName: apt.doctor?.nombre || '',
            status: statusMap[apt.status as keyof typeof statusMap] || apt.status,
            notes: apt.notes || '',
          };
        });
        setAppointments(mapped);
      });
  }, [user]);

  const filtered = useMemo(() => {
    let list = appointments;
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (query.trim()) list = list.filter((a) => a.doctorName.toLowerCase().includes(query.toLowerCase()));
    return list.sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  }, [appointments, query, statusFilter]);

  const handleDownloadQR = (qrUrl: string, id: string) => {
    const canvas = document.createElement('canvas');
    const svg = document.getElementById(`qr-${id}`);
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(xml);
    const image64 = 'data:image/svg+xml;base64,' + svg64;
    const img = new window.Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')?.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = png;
      link.download = `qr_cita_${id}.png`;
      link.click();
    };
    img.src = image64;
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    const csv = [
      "Fecha,Hora,Doctor,Estado,Notas",
      ...filtered.map((a) => `${a.date},${a.time},${a.doctorName},${a.status},${a.notes || ""}`),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "historial_citas.csv"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Archivo CSV descargado")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Historial de Citas</h1>
        <p className="text-sm text-muted-foreground">Consulte y exporte su historial completo</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar doctor..."
              className="pl-9 w-full sm:w-56"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="COMPLETADA">Completada</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>QR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="text-xs">
                      {new Date(apt.date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-xs">{apt.time}</TableCell>
                    <TableCell className="text-xs font-medium">{apt.doctorName}</TableCell>
                    <TableCell><StatusBadge status={apt.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{apt.notes || "-"}</TableCell>
                    <TableCell>
                      {apt.qrCodeUrl && (
                        <div className="flex flex-col items-center gap-2">
                          <QRCode id={`qr-${apt.id}`} value={apt.qrCodeUrl} size={64} />
                          <Button size="sm" variant="outline" onClick={() => handleDownloadQR(apt.qrCodeUrl, apt.id)}>
                            Descargar QR
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
