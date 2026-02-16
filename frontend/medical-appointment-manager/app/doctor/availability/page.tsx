"use client"

import { useState } from "react"
import { doctorAvailability } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { toast } from "sonner"

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]

export default function DoctorAvailabilityPage() {
  const [availability, setAvailability] = useState(
    doctorAvailability.map((a) => ({ ...a }))
  )

  const updateField = (idx: number, field: string, value: string | boolean) => {
    setAvailability((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    )
  }

  const handleSave = () => {
    toast.success("Disponibilidad actualizada correctamente")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Disponibilidad</h1>
        <p className="text-sm text-muted-foreground">Configure sus horarios de atencion por dia</p>
      </div>

      <div className="flex flex-col gap-4">
        {availability.map((day, idx) => (
          <Card key={day.dayOfWeek}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-3 sm:w-32">
                  <Switch
                    checked={day.enabled}
                    onCheckedChange={(v) => updateField(idx, "enabled", v)}
                  />
                  <span className={`text-sm font-medium ${day.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                    {DAY_LABELS[day.dayOfWeek]}
                  </span>
                </div>
                {day.enabled && (
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:gap-6">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Manana:</Label>
                      <Input
                        type="time"
                        value={day.startMorning}
                        onChange={(e) => updateField(idx, "startMorning", e.target.value)}
                        className="w-28 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">a</span>
                      <Input
                        type="time"
                        value={day.endMorning}
                        onChange={(e) => updateField(idx, "endMorning", e.target.value)}
                        className="w-28 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Tarde:</Label>
                      <Input
                        type="time"
                        value={day.startAfternoon}
                        onChange={(e) => updateField(idx, "startAfternoon", e.target.value)}
                        className="w-28 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">a</span>
                      <Input
                        type="time"
                        value={day.endAfternoon}
                        onChange={(e) => updateField(idx, "endAfternoon", e.target.value)}
                        className="w-28 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Guardar Disponibilidad
        </Button>
      </div>
    </div>
  )
}
