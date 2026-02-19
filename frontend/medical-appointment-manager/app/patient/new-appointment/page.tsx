"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"
import {
  Check,
  CalendarDays,
  Clock,
  ArrowLeft,
  ArrowRight,
  Star,
} from "lucide-react"

import { toast } from "sonner"

type Step = 1 | 2 | 3 | 4

interface Doctor {
  id: number
  nombre: string
  especialidad: string
  rating?: number
  available?: boolean
}

interface TimeSlot {
  id: string
  time: string
  available: boolean
}

export default function NewAppointmentPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const preselectedDoctor = searchParams.get("doctor") || ""

  const [step, setStep] = useState<Step>(preselectedDoctor ? 2 : 1)
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [doctorError, setDoctorError] = useState<string | null>(null)

  const doctor = doctors.find(
    (d) => String(d.id) === String(selectedDoctor)
  )

  // ==========================
  // FETCH DOCTORS
  // ==========================
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true)
        console.log("[Nueva Cita] Solicitando médicos...")
        const res = await fetch("/api/doctors", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        console.log("[Nueva Cita] Respuesta status:", res.status)
        if (!res.ok) throw new Error()

        const data = await res.json()
        console.log("[Nueva Cita] Médicos recibidos:", data)
        setDoctors(data)
      } catch (e) {
        setDoctorError("Error al cargar médicos")
        toast.error("Error al cargar médicos")
        console.error("[Nueva Cita] Error al cargar médicos:", e)
      } finally {
        setLoadingDoctors(false)
      }
    }

    fetchDoctors()
  }, [])

  // ==========================
  // FETCH HORARIOS
  // ==========================
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setTimeSlots([])
      return
    }

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true)

        const start = new Date(selectedDate)
        start.setHours(0, 0, 0, 0)

        const end = new Date(selectedDate)
        end.setHours(23, 59, 59, 999)

        const res = await fetch(
          `/api/appointments/doctor/${selectedDoctor}/range?start=${start.toISOString()}&end=${end.toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )

        if (!res.ok) throw new Error()

        const appointments = await res.json()

        const slots: TimeSlot[] = []
        const HOURS = [
          { start: 9, end: 14 },
          { start: 16, end: 18 },
        ]

        HOURS.forEach(({ start, end }) => {
          for (let h = start; h < end; h++) {
            for (let m = 0; m < 60; m += 30) {
              const date = new Date(selectedDate)
              date.setHours(h, m, 0, 0)

              if (date < new Date()) continue

              const time = date.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })

              slots.push({
                id: `${h}:${m}`,
                time,
                available: true,
              })
            }
          }
        })

        const busyTimes = appointments.map((apt: any) =>
          new Date(apt.dateTime).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        )

        setTimeSlots(
          slots.map((slot) => ({
            ...slot,
            available: !busyTimes.includes(slot.time),
          }))
        )
      } catch {
        toast.error("Error al cargar horarios")
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [selectedDoctor, selectedDate])

  // ==========================
  // CONFIRMAR CITA
  // ==========================
  const handleConfirm = async () => {
    if (!doctor || !user || !selectedDate || !selectedTime || !notes.trim()) {
      toast.error("Complete todos los campos")
      return
    }

    const [hour, minute] = selectedTime.split(":")
    const dateTime = new Date(selectedDate)
    dateTime.setHours(Number(hour), Number(minute), 0, 0)

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientId: user.id,
          dateTime: dateTime.toISOString(),
          especialidad: doctor.especialidad,
          notes,
        }),
      })

      if (!res.ok) throw new Error()

      toast.success("Cita agendada exitosamente")
      setStep(4)
    } catch {
      toast.error("Error al agendar cita")
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedDoctor("")
    setSelectedDate(undefined)
    setSelectedTime("")
    setNotes("")
  }

  const steps = [
    { num: 1, label: "Médico" },
    { num: 2, label: "Fecha" },
    { num: 3, label: "Confirmar" },
  ]

  // ==========================
  // UI
  // ==========================
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Nueva Cita
        </h1>
        <p className="text-sm text-muted-foreground">
          Agende una cita en unos sencillos pasos
        </p>
      </div>

      {/* Steps */}
      {step < 4 && (
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                  step >= s.num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s.num ? (
                  <Check className="h-4 w-4" />
                ) : (
                  s.num
                )}
              </div>
              <span className="hidden sm:inline text-xs">
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <Separator className="w-8" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccione un Médico</CardTitle>
            <CardDescription>
              Elija el especialista para su cita
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">

            {loadingDoctors ? (
              <div>Cargando médicos...</div>
            ) : doctorError ? (
              <div className="text-red-500">
                {doctorError}
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-muted-foreground">
                No hay médicos disponibles.
              </div>
            ) : (
              doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() =>
                    setSelectedDoctor(String(doc.id))
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition",
                    selectedDoctor === String(doc.id)
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  )}
                >
                  <Avatar>
                    <AvatarFallback>
                      {doc.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-left">
                    <p className="font-medium">
                      {doc.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.especialidad}
                    </p>
                  </div>

                  {doc.rating && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {doc.rating}
                    </Badge>
                  )}
                </button>
              ))
            )}

            <div className="flex justify-end">
              <Button
                disabled={!selectedDoctor}
                onClick={() => setStep(2)}
              >
                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Seleccione Fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d)
                  setSelectedTime("")
                }}
                disabled={(date) =>
                  date < new Date() ||
                  date.getDay() === 0
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seleccione Horario</CardTitle>
            </CardHeader>

            <CardContent>
              {loadingSlots ? (
                <div>Cargando horarios...</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      size="sm"
                      variant={
                        selectedTime === slot.time
                          ? "default"
                          : "outline"
                      }
                      disabled={!slot.available}
                      onClick={() =>
                        setSelectedTime(slot.time)
                      }
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="col-span-full flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <Button
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && doctor && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Cita</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {doctor.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold">
                  {doctor.nombre}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doctor.especialidad}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {selectedDate?.toLocaleDateString("es-MX")}
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {selectedTime} hrs
              </div>
            </div>

            <textarea
              className="border rounded-md p-2"
              placeholder="Motivo de la cita"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
              >
                Anterior
              </Button>

              <Button onClick={handleConfirm}>
                <Check className="mr-2 h-4 w-4" />
                Confirmar Cita
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <Check className="h-12 w-12 text-emerald-500" />
            <h2 className="text-lg font-semibold">
              Cita Agendada
            </h2>
            <Button variant="outline" onClick={resetForm}>
              Agendar Otra Cita
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
