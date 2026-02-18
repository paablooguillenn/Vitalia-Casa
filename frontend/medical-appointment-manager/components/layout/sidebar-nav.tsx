"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/types"
import {
  LayoutDashboard,
  CalendarDays,
  Search,
  CalendarPlus,
  UserCircle,
  CalendarRange,
  Clock,
  History,
  QrCode,
  Paperclip,
  Bell,
  Users,
  BarChart3,
  FileText,
  Stethoscope,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navByRole: Record<UserRole, NavItem[]> = {
  patient: [
    { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
    { label: "Mis Citas", href: "/patient/appointments", icon: CalendarDays },
    { label: "Buscar Medicos", href: "/patient/doctors", icon: Search },
    { label: "Nueva Cita", href: "/patient/new-appointment", icon: CalendarPlus },
    { label: "Mi Perfil", href: "/patient/profile", icon: UserCircle },
  ],
  doctor: [
    { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
    { label: "Agenda", href: "/doctor/agenda", icon: CalendarRange },
    { label: "Disponibilidad", href: "/doctor/availability", icon: Clock },
    { label: "Historial", href: "/doctor/history", icon: History },
    { label: "Mi Perfil", href: "/doctor/profile", icon: UserCircle },
    { label: "Adjuntos", href: "/doctor/attachments", icon: Paperclip },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Usuarios", href: "/admin/users", icon: Users },
    { label: "Estadisticas", href: "/admin/statistics", icon: BarChart3 },
    { label: "Logs", href: "/admin/logs", icon: FileText },
  ],
}

export function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const items = navByRole[role]

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      <div className="flex items-center gap-2 px-3 py-4 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Stethoscope className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground tracking-tight">Vitalia</span>
      </div>
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export { navByRole }
