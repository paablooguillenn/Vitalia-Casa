"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { toast } from "sonner"

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]

export default function DoctorAvailabilityPage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !user.id) return;
    // Fetch doctor availability from backend
    fetch(`/api/doctor-availability/doctor/${user.id}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (Array.isArray(data) && data.length === 0) {
          // Si no hay disponibilidad, crear los 7 días por defecto SOLO con los campos que espera el backend
          const defaultAvailability = Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            morningEnabled: false,
            afternoonEnabled: false,
          }));
          setAvailability(defaultAvailability);
          // Guardar en backend
          await fetch(`/api/doctor-availability/doctor/${user.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultAvailability),
          });
        } else {
          setAvailability(data);
        }
      })
      .catch(() => {
        setAvailability([]);
      });
  }, [user]);

  const updateField = (idx: number, field: string, value: boolean) => {
    setAvailability((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
  }

  const handleSave = async () => {
    if (!user || !user.id) return;
    // Solo enviar los campos que espera el backend
    const payload = availability.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      morningEnabled: !!a.morningEnabled,
      afternoonEnabled: !!a.afternoonEnabled,
    }));
    try {
      const res = await fetch(`/api/doctor-availability/doctor/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Disponibilidad actualizada correctamente");
      } else {
        toast.error("Error al guardar la disponibilidad");
      }
    } catch (e) {
      toast.error("Error al guardar la disponibilidad");
    }
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
                  <span className={`text-sm font-medium text-foreground`}>
                    {DAY_LABELS[day.dayOfWeek]}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:gap-6">
                  <div className="flex items-center gap-4">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Mañana:</Label>
                    <Switch
                      checked={!!day.morningEnabled}
                      onCheckedChange={(v) => updateField(idx, "morningEnabled", v)}
                    />
                    <span className="text-xs text-muted-foreground">(08:00 a 12:00)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Tarde:</Label>
                    <Switch
                      checked={!!day.afternoonEnabled}
                      onCheckedChange={(v) => updateField(idx, "afternoonEnabled", v)}
                    />
                    <span className="text-xs text-muted-foreground">(14:00 a 18:00)</span>
                  </div>
                </div>
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
