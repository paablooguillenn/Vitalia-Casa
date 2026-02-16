import type { AppointmentStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; className: string }> = {
  CONFIRMADA: { label: "Confirmada", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  CANCELADA: { label: "Cancelada", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800" },
  COMPLETADA: { label: "Completada", className: "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
  "EN CONSULTA": { label: "En Consulta", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" },
}

export function StatusBadge({ status }: { status: AppointmentStatus | string }) {
  const config = statusConfig[status as AppointmentStatus];
  if (!config) {
    return (
      <Badge variant="outline" className={cn("font-medium text-xs bg-gray-200 text-gray-700 border-gray-300")}>Desconocido</Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", config.className)}>
      {config.label}
    </Badge>
  )
}
