"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Check, CalendarDays, Clock, ArrowLeft, ArrowRight, Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Step = 1 | 2 | 3 | 4

export default function NewAppointmentPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const preselectedDoctor = searchParams.get("doctor") || ""

  const [step, setStep] = useState<Step>(preselectedDoctor ? 2 : 1)
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState("")
  const [doctors, setDoctors] = useState<any[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [notes, setNotes] = useState("")

  // Fetch doctors
  useEffect(() => {
    setLoadingDoctors(true)
    fetch("/api/doctors", {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('HTTP status ' + res.status)
        return res.json()
      })
      .then(data => setDoctors(data))
      .catch(err => {
        console.error('Fetch error /api/doctors:', err)
        toast.error("Error al cargar médicos")
      })
      .finally(() => setLoadingDoctors(false))
  }, [])

  const doctor = doctors.find((d) => String(d.id) === String(selectedDoctor))

  // Fetch time slots
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setTimeSlots([])
      return
    }
    setLoadingSlots(true)
    
    // Definir rango de horas y duración
    const WORKING_HOURS = [
      { start: 9, end: 14 },   // 09:00-14:00
      { start: 16, end: 18 }   // 16:00-18:00
    ]
    const SLOT_MINUTES = 30
    
    // Generar todos los slots posibles para ese día
    const slots: { time: string, available: boolean, id: string }[] = []
    const date = new Date(selectedDate)
    WORKING_HOURS.forEach(({ start, end }) => {
      for (let hour = start; hour < end; hour++) {
        for (let min = 0; min < 60; min += SLOT_MINUTES) {
          const slotDate = new Date(date)
          slotDate.setHours(hour, min, 0, 0)
          // No mostrar slots en el pasado
          if (slotDate < new Date()) continue
          const time = slotDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
          slots.push({
            time,
            available: true,
            id: `${hour}:${min}`
          })
        }
      }
    })

    // Consultar citas ocupadas para ese doctor y día
    const startISO = new Date(date); startISO.setHours(0,0,0,0)
    const endISO = new Date(date); endISO.setHours(23,59,59,999)
    
    fetch(`/api/appointments/doctor/${selectedDoctor}/range?start=${startISO.toISOString()}&end=${endISO.toISOString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error fetching appointments')
        return res.json()
      })
      .then((appointments) => {
        // Marcar como no disponibles los slots ocupados
        const busyTimes = appointments.map((apt: any) => {
          const d = new Date(apt.dateTime)
          return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
        })
        setTimeSlots(slots.map(slot => ({ ...slot, available: !busyTimes.includes(slot.time) })))
      })
      .catch(err => {
        console.error('Error fetching slots:', err)
        toast.error("Error al cargar horarios")
        setTimeSlots(slots)
      })
      .finally(() => setLoadingSlots(false))
  }, [selectedDoctor, selectedDate])

  const handleConfirm = async () => {
    if (!doctor || !user || !user.id || !selectedDate || !selectedTime || notes.trim() === "") {
      toast.error("Falta login, datos o notas")
      return
    }
    // Construir fecha y hora completa
    const [hour, minute] = selectedTime.split(":")
    const dateTime = new Date(selectedDate)
    dateTime.setHours(Number(hour), Number(minute), 0, 0)
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientId: Number(user.id),
          dateTime: dateTime.toISOString(),
          especialidad: doctor.especialidad,
          notes: notes.trim()
        })
      })
      if (!res.ok) throw new Error('Error al crear cita: ' + res.status)
      toast.success("Cita agendada exitosamente", {
        description: `${doctor.nombre} - ${selectedDate.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })} a las ${selectedTime}`,
      })
      setStep(4)
    } catch (err) {
      toast.error("Error al agendar cita", { description: String(err) })
    }
  }

  const steps = [
    { num: 1, label: "Medico" },
    { num: 2, label: "Fecha" },
    { num: 3, label: "Confirmar" },
  ]

  const resetForm = () => {
    setStep(1)
    setSelectedDoctor("")
    setSelectedDate(undefined)
    setSelectedTime("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Nueva Cita</h1>
        <p className="text-sm text-muted-foreground">Agende una cita en unos sencillos pasos</p>
      </div>

      {step < 4 && (
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step >= s.num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={cn("hidden text-xs sm:inline", step >= s.num ? "text-foreground font-medium" : "text-muted-foreground")}>
                {s.label}
              </span>
              {i < steps.length - 1 && <Separator className="w-8" />}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground">Seleccione un Medico</CardTitle>
              <CardDescription>Elija el especialista para su cita</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {loadingDoctors ? (
                <div className="flex items-center justify-center p-8 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Cargando médicos...</span>
                </div>
              ) : (
                doctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                      selectedDoctor === doc.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {doc.nombre
                          ? doc.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
                          : "DR"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{doc.nombre}</p>
                      <p className="text-xs text-muted-foreground">{doc.especialidad}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-foreground">{doc.rating || "4.5"}</span>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!selectedDoctor || loadingDoctors}>
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-foreground">Seleccione Fecha</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => { setSelectedDate(d); setSelectedTime("") }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0}
                  className="rounded-md"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-foreground">Seleccione Horario</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `${selectedDate.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}`
                    : "Primero seleccione una fecha"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Seleccione una fecha para ver horarios disponibles</p>
                ) : loadingSlots ? (
                  <div className="flex items-center justify-center p-8 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Cargando horarios...</span>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No hay horarios disponibles para esta fecha</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className="text-xs"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime || loadingSlots}>
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && doctor && selectedDate && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-foreground">Confirmar Cita</CardTitle>
              <CardDescription>Revise los detalles antes de confirmar</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {doctor.nombre ? doctor.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "DR"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{doctor.nombre}</p>
                  <p className="text-xs text-muted-foreground">{doctor.especialidad}</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {selectedDate.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedTime} hrs</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Paciente:</span>
                <span className="text-foreground font-medium">{user?.name}</span>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <label htmlFor="notes" className="text-sm font-medium text-foreground">Notas <span className="text-red-500">*</span></label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-md border border-border p-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Escriba aquí las notas para la cita"
                />
                {notes.trim() === "" && <span className="text-xs text-red-500">Las notas son obligatorias</span>}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button onClick={handleConfirm} disabled={isConfirming || notes.trim() === ""}>
              <Check className="mr-2 h-4 w-4" /> Confirmar Cita
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Cita Agendada</h2>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Su cita ha sido registrada exitosamente. Recibirá una confirmación pronto.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
              }}
            >
              Agendar Otra Cita
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
