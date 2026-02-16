"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Smartphone, Save } from "lucide-react"
import { toast } from "sonner"

interface NotifPref {
  label: string
  description: string
  push: boolean
  email: boolean
}

const defaults: NotifPref[] = [
  { label: "Nueva cita", description: "Cuando un paciente agenda una cita", push: true, email: true },
  { label: "Cancelacion", description: "Cuando un paciente cancela una cita", push: true, email: true },
  { label: "Recordatorio", description: "Recordatorio antes de cada cita", push: true, email: false },
  { label: "Modificacion", description: "Cuando se modifica una cita existente", push: false, email: true },
  { label: "Sistema", description: "Actualizaciones del sistema", push: false, email: false },
]

export default function DoctorNotificationsPage() {
  const [prefs, setPrefs] = useState<NotifPref[]>(defaults)

  const togglePref = (idx: number, field: "push" | "email") => {
    setPrefs((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: !p[field] } : p))
    )
  }

  const handleSave = () => {
    toast.success("Preferencias de notificacion actualizadas")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Notificaciones</h1>
        <p className="text-sm text-muted-foreground">Configure como desea recibir notificaciones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-foreground">Preferencias</CardTitle>
          <CardDescription>Active o desactive canales por tipo de notificacion</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          <div className="flex items-center gap-4 pb-3 text-xs text-muted-foreground">
            <span className="flex-1">Tipo</span>
            <span className="flex items-center gap-1 w-16 justify-center">
              <Smartphone className="h-3 w-3" /> Push
            </span>
            <span className="flex items-center gap-1 w-16 justify-center">
              <Mail className="h-3 w-3" /> Email
            </span>
          </div>
          <Separator />
          {prefs.map((pref, idx) => (
            <div key={pref.label}>
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{pref.label}</p>
                  <p className="text-xs text-muted-foreground">{pref.description}</p>
                </div>
                <div className="flex w-16 justify-center">
                  <Switch
                    checked={pref.push}
                    onCheckedChange={() => togglePref(idx, "push")}
                    aria-label={`Push notification for ${pref.label}`}
                  />
                </div>
                <div className="flex w-16 justify-center">
                  <Switch
                    checked={pref.email}
                    onCheckedChange={() => togglePref(idx, "email")}
                    aria-label={`Email notification for ${pref.label}`}
                  />
                </div>
              </div>
              {idx < prefs.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Guardar Preferencias
        </Button>
      </div>
    </div>
  )
}
