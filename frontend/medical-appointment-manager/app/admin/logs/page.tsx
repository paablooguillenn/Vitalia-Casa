
"use client"
import React from "react";

import { useMemo, useState } from "react"
// import { auditLogs } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

const actionLabels: Record<string, { label: string; className: string }> = {
  LOGIN: { label: "Inicio Sesion", className: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800" },
  CREATE_USER: { label: "Crear Usuario", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800" },
  UPDATE_USER: { label: "Editar Usuario", className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800" },
  UPDATE_APPOINTMENT: { label: "Editar Cita", className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800" },
  CANCEL_APPOINTMENT: { label: "Cancelar Cita", className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800" },
  COMPLETE_APPOINTMENT: { label: "Completar Cita", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800" },
  CREATE_APPOINTMENT: { label: "Crear Cita", className: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800" },
  UPDATE_AVAILABILITY: { label: "Disponibilidad", className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800" },
  DELETE_USER: { label: "Eliminar Usuario", className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800" },
  DELETE_DOCTOR: { label: "Eliminar Doctor", className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800" },
  DELETE_APPOINTMENT: { label: "Eliminar Cita", className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800" },
  REGISTER: { label: "Registro", className: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800" },
  UPDATE_APPOINTMENT_DETAIL: { label: "Editar Detalles Cita", className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800" },
  CREATE_DOCTOR: { label: "Crear Doctor", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800" },
  CREATE_APPOINTMENT_DETAIL: { label: "Crear Detalles Cita", className: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800" },
}


function LogsPage() {
  const [query, setQuery] = useState("")
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch logs from API
  React.useEffect(() => {
    setLoading(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/admin/logs", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return logs
    const q = query.toLowerCase()
    return logs.filter(
      (l) =>
        (l.userName || "").toLowerCase().includes(q) ||
        (l.action || "").toLowerCase().includes(q) ||
        (l.details || "").toLowerCase().includes(q)
    )
  }, [logs, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Registro de Actividad</h1>
        <p className="text-sm text-muted-foreground">Historial de acciones realizadas en el sistema</p>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar en logs..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Accion</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Cargando...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No se encontraron registros</TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => {
                  const actionConfig = actionLabels[log.action] || { label: log.action, className: "bg-muted text-muted-foreground" }
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{log.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${actionConfig.className}`}>
                          {actionConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{log.details}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default LogsPage;
