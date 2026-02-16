"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, LogOut, User } from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  // ✅ Estado unificado para evitar múltiples hydration mismatches
  const [mounted, setMounted] = useState(false)
  const [displayData, setDisplayData] = useState({
    initials: "U",
    name: "",
    email: "",
    roleLabel: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user && mounted) {
      const initials = user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U"

      const roleLabels: Record<string, string> = {
        patient: "Paciente",
        doctor: "Doctor", 
        admin: "Administrador",
      }

      setDisplayData({
        initials,
        name: user.name || "",
        email: user.email || "",
        roleLabel: roleLabels[user.role || ""] || "",
      })
    }
  }, [user, mounted])

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="md:hidden">
          <span className="text-sm font-semibold text-foreground">Vitalia</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled>
            <Sun className="h-4 w-4" />
          </Button>
          <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
      {/* Logo/Marca */}
      <div className="md:hidden">
        <span className="text-sm font-semibold text-foreground tracking-tight">Vitalia</span>
      </div>

      {/* Rol visible en desktop */}
      <div className="hidden md:block">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {displayData.roleLabel}
        </p>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 hover:bg-accent">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground/20 text-primary-foreground text-xs font-bold">
                  {displayData.initials}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 hidden text-sm font-medium md:inline-block truncate max-w-[120px]">
                {displayData.name}
              </span>
              <span className="sr-only">Abrir menú usuario</span>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              <span>{displayData.email}</span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="px-2 py-1.5 text-xs cursor-default select-none">
              <User className="mr-2 h-3 w-3" />
              {displayData.roleLabel}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={logout} 
              className="text-destructive focus:text-destructive px-2 py-1.5"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
