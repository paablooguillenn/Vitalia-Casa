import type {
  User,
  Doctor,
  Appointment,
  DoctorAvailability,
  AuditLog,
  Notification,
  FileAttachment,
  StatsData,
  TimeSlot,
} from "./types"

export const users: User[] = [
  {
    id: "u1",
    name: "Maria Garcia Lopez",
    email: "maria@correo.com",
    role: "patient",
    phone: "+52 55 1234 5678",
    avatar: "",
  },
  {
    id: "u2",
    name: "Dr. Carlos Hernandez",
    email: "carlos@hospital.com",
    role: "doctor",
    phone: "+52 55 8765 4321",
    avatar: "",
  },
  {
    id: "u3",
    name: "Admin Laura Martinez",
    email: "admin@hospital.com",
    role: "admin",
    phone: "+52 55 1111 2222",
    avatar: "",
  },
  {
    id: "u4",
    name: "Pedro Ramirez Torres",
    email: "pedro@correo.com",
    role: "patient",
    phone: "+52 55 3333 4444",
    avatar: "",
  },
  {
    id: "u5",
    name: "Dra. Ana Sofia Ruiz",
    email: "ana@hospital.com",
    role: "doctor",
    phone: "+52 55 5555 6666",
    avatar: "",
  },
]

export const doctors: Doctor[] = [
  {
    id: "d1",
    userId: "u2",
    name: "Dr. Carlos Hernandez",
    email: "carlos@hospital.com",
    specialty: "Cardiologia",
    rating: 4.8,
    reviewCount: 124,
    avatar: "",
    available: true,
    bio: "Especialista en cardiologia con mas de 15 anos de experiencia en diagnostico y tratamiento de enfermedades cardiovasculares.",
  },
  {
    id: "d2",
    userId: "u5",
    name: "Dra. Ana Sofia Ruiz",
    email: "ana@hospital.com",
    specialty: "Dermatologia",
    rating: 4.9,
    reviewCount: 98,
    avatar: "",
    available: true,
    bio: "Dermatologa certificada especializada en tratamientos esteticos y enfermedades de la piel.",
  },
  {
    id: "d3",
    userId: "d3u",
    name: "Dr. Roberto Mendez",
    email: "roberto@hospital.com",
    specialty: "Pediatria",
    rating: 4.7,
    reviewCount: 210,
    avatar: "",
    available: true,
    bio: "Pediatra con enfoque en medicina preventiva y desarrollo infantil.",
  },
  {
    id: "d4",
    userId: "d4u",
    name: "Dra. Elena Vargas",
    email: "elena@hospital.com",
    specialty: "Neurologia",
    rating: 4.6,
    reviewCount: 76,
    avatar: "",
    available: false,
    bio: "Neurologa especializada en trastornos del sueno y cefaleas cronicas.",
  },
  {
    id: "d5",
    userId: "d5u",
    name: "Dr. Miguel Torres",
    email: "miguel@hospital.com",
    specialty: "Traumatologia",
    rating: 4.5,
    reviewCount: 150,
    avatar: "",
    available: true,
    bio: "Traumatologo con experiencia en medicina deportiva y rehabilitacion.",
  },
]

const today = new Date()
const formatDate = (d: Date) => d.toISOString().split("T")[0]
const addDays = (d: Date, n: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export const appointments: Appointment[] = [
  {
    id: "a1",
    patientId: "u1",
    patientName: "Maria Garcia Lopez",
    doctorId: "d1",
    doctorName: "Dr. Carlos Hernandez",
    specialty: "Cardiologia",
    date: formatDate(addDays(today, 1)),
    time: "09:00",
    status: "CONFIRMADA",
    notes: "Revision de presion arterial y electrocardiograma",
  },
  {
    id: "a2",
    patientId: "u1",
    patientName: "Maria Garcia Lopez",
    doctorId: "d2",
    doctorName: "Dra. Ana Sofia Ruiz",
    specialty: "Dermatologia",
    date: formatDate(addDays(today, 3)),
    time: "11:00",
    status: "PENDIENTE",
    notes: "Consulta de seguimiento por dermatitis",
  },
  {
    id: "a3",
    patientId: "u4",
    patientName: "Pedro Ramirez Torres",
    doctorId: "d1",
    doctorName: "Dr. Carlos Hernandez",
    specialty: "Cardiologia",
    date: formatDate(addDays(today, 0)),
    time: "10:00",
    status: "CONFIRMADA",
    notes: "Ecocardiograma programado",
  },
  {
    id: "a4",
    patientId: "u4",
    patientName: "Pedro Ramirez Torres",
    doctorId: "d3",
    doctorName: "Dr. Roberto Mendez",
    specialty: "Pediatria",
    date: formatDate(addDays(today, -2)),
    time: "14:00",
    status: "COMPLETADA",
    notes: "Vacunacion de su hijo",
  },
  {
    id: "a5",
    patientId: "u1",
    patientName: "Maria Garcia Lopez",
    doctorId: "d5",
    doctorName: "Dr. Miguel Torres",
    specialty: "Traumatologia",
    date: formatDate(addDays(today, -5)),
    time: "16:00",
    status: "COMPLETADA",
    notes: "Revision post-operatoria de rodilla",
  },
  {
    id: "a6",
    patientId: "u1",
    patientName: "Maria Garcia Lopez",
    doctorId: "d4",
    doctorName: "Dra. Elena Vargas",
    specialty: "Neurologia",
    date: formatDate(addDays(today, -1)),
    time: "09:30",
    status: "CANCELADA",
    notes: "Cancelada por la paciente",
  },
  {
    id: "a7",
    patientId: "u4",
    patientName: "Pedro Ramirez Torres",
    doctorId: "d2",
    doctorName: "Dra. Ana Sofia Ruiz",
    specialty: "Dermatologia",
    date: formatDate(addDays(today, 0)),
    time: "15:00",
    status: "PENDIENTE",
  },
  {
    id: "a8",
    patientId: "u1",
    patientName: "Maria Garcia Lopez",
    doctorId: "d1",
    doctorName: "Dr. Carlos Hernandez",
    specialty: "Cardiologia",
    date: formatDate(addDays(today, 0)),
    time: "11:30",
    status: "CONFIRMADA",
    notes: "Control mensual de hipertension",
  },
  {
    id: "a9",
    patientId: "u4",
    patientName: "Pedro Ramirez Torres",
    doctorId: "d5",
    doctorName: "Dr. Miguel Torres",
    specialty: "Traumatologia",
    date: formatDate(addDays(today, 2)),
    time: "08:30",
    status: "CONFIRMADA",
  },
  {
    id: "a10",
    patientId: "u1",
    patientName: "Maria Garcia Lopez",
    doctorId: "d3",
    doctorName: "Dr. Roberto Mendez",
    specialty: "Pediatria",
    date: formatDate(addDays(today, 5)),
    time: "10:00",
    status: "PENDIENTE",
    notes: "Consulta general",
  },
  {
    id: "a11",
    patientId: "u4",
    patientName: "Pedro Ramirez Torres",
    doctorId: "d1",
    doctorName: "Dr. Carlos Hernandez",
    specialty: "Cardiologia",
    date: formatDate(addDays(today, -10)),
    time: "09:00",
    status: "COMPLETADA",
  },
  {
    id: "a12",
    patientId: "u1",
    patientName: "Maria Garcia Lopez",
    doctorId: "d2",
    doctorName: "Dra. Ana Sofia Ruiz",
    specialty: "Dermatologia",
    date: formatDate(addDays(today, -15)),
    time: "12:00",
    status: "COMPLETADA",
  },
  {
    id: "a13",
    patientId: "u4",
    patientName: "Pedro Ramirez Torres",
    doctorId: "d4",
    doctorName: "Dra. Elena Vargas",
    specialty: "Neurologia",
    date: formatDate(addDays(today, 7)),
    time: "14:30",
    status: "PENDIENTE",
  },
  {
    id: "a14",
    patientId: "u1",
    patientName: "Maria Garcia Lopez",
    doctorId: "d1",
    doctorName: "Dr. Carlos Hernandez",
    specialty: "Cardiologia",
    date: formatDate(addDays(today, 0)),
    time: "16:30",
    status: "PENDIENTE",
    notes: "Ultima cita del dia",
  },
]

export const doctorAvailability: DoctorAvailability[] = [
  { doctorId: "d1", dayOfWeek: 1, startMorning: "08:00", endMorning: "12:00", startAfternoon: "14:00", endAfternoon: "18:00", enabled: true },
  { doctorId: "d1", dayOfWeek: 2, startMorning: "08:00", endMorning: "12:00", startAfternoon: "14:00", endAfternoon: "18:00", enabled: true },
  { doctorId: "d1", dayOfWeek: 3, startMorning: "08:00", endMorning: "12:00", startAfternoon: "14:00", endAfternoon: "18:00", enabled: true },
  { doctorId: "d1", dayOfWeek: 4, startMorning: "08:00", endMorning: "12:00", startAfternoon: "14:00", endAfternoon: "16:00", enabled: true },
  { doctorId: "d1", dayOfWeek: 5, startMorning: "09:00", endMorning: "13:00", startAfternoon: "", endAfternoon: "", enabled: true },
  { doctorId: "d1", dayOfWeek: 6, startMorning: "", endMorning: "", startAfternoon: "", endAfternoon: "", enabled: false },
  { doctorId: "d1", dayOfWeek: 0, startMorning: "", endMorning: "", startAfternoon: "", endAfternoon: "", enabled: false },
]

export const auditLogs: AuditLog[] = [
  { id: "l1", timestamp: addDays(today, 0).toISOString(), userId: "u1", userName: "Maria Garcia Lopez", action: "LOGIN", details: "Inicio de sesion exitoso" },
  { id: "l2", timestamp: addDays(today, 0).toISOString(), userId: "u2", userName: "Dr. Carlos Hernandez", action: "UPDATE_APPOINTMENT", details: "Confirmo cita a3" },
  { id: "l3", timestamp: addDays(today, -1).toISOString(), userId: "u1", userName: "Maria Garcia Lopez", action: "CANCEL_APPOINTMENT", details: "Cancelo cita a6" },
  { id: "l4", timestamp: addDays(today, -1).toISOString(), userId: "u3", userName: "Admin Laura Martinez", action: "CREATE_USER", details: "Creo usuario nuevo: Pedro Ramirez" },
  { id: "l5", timestamp: addDays(today, -2).toISOString(), userId: "u2", userName: "Dr. Carlos Hernandez", action: "COMPLETE_APPOINTMENT", details: "Completo cita a4" },
  { id: "l6", timestamp: addDays(today, -3).toISOString(), userId: "u3", userName: "Admin Laura Martinez", action: "UPDATE_USER", details: "Actualizo rol de usuario u5" },
  { id: "l7", timestamp: addDays(today, -4).toISOString(), userId: "u1", userName: "Maria Garcia Lopez", action: "CREATE_APPOINTMENT", details: "Reservo cita con Dr. Carlos" },
  { id: "l8", timestamp: addDays(today, -5).toISOString(), userId: "u5", userName: "Dra. Ana Sofia Ruiz", action: "UPDATE_AVAILABILITY", details: "Actualizo horario de disponibilidad" },
]

export const notifications: Notification[] = [
  { id: "n1", type: "appointment", title: "Cita Confirmada", message: "Su cita con Dr. Carlos Hernandez ha sido confirmada para manana a las 09:00.", read: false, timestamp: addDays(today, 0).toISOString() },
  { id: "n2", type: "reminder", title: "Recordatorio", message: "Tiene una cita pendiente con Dra. Ana Sofia Ruiz en 3 dias.", read: false, timestamp: addDays(today, 0).toISOString() },
  { id: "n3", type: "cancellation", title: "Cita Cancelada", message: "La cita con Dra. Elena Vargas ha sido cancelada.", read: true, timestamp: addDays(today, -1).toISOString() },
  { id: "n4", type: "system", title: "Bienvenido", message: "Bienvenido al sistema de gestion de citas medicas.", read: true, timestamp: addDays(today, -5).toISOString() },
]

export const fileAttachments: FileAttachment[] = [
  { id: "f1", name: "radiografia_torax.pdf", type: "application/pdf", size: 2400000, url: "#", appointmentId: "a1", uploadedAt: addDays(today, -1).toISOString() },
  { id: "f2", name: "resultado_laboratorio.pdf", type: "application/pdf", size: 1200000, url: "#", appointmentId: "a3", uploadedAt: addDays(today, -2).toISOString() },
  { id: "f3", name: "electrocardiograma.pdf", type: "application/pdf", size: 890000, url: "#", appointmentId: "a5", uploadedAt: addDays(today, -5).toISOString() },
]

export const statsData: StatsData = {
  totalUsers: 156,
  totalAppointments: 1240,
  activeDoctors: 12,
  revenue: 485000,
  appointmentsPerMonth: [
    { month: "Ene", count: 85 },
    { month: "Feb", count: 92 },
    { month: "Mar", count: 110 },
    { month: "Abr", count: 98 },
    { month: "May", count: 120 },
    { month: "Jun", count: 115 },
    { month: "Jul", count: 130 },
    { month: "Ago", count: 125 },
    { month: "Sep", count: 140 },
    { month: "Oct", count: 138 },
    { month: "Nov", count: 145 },
    { month: "Dic", count: 142 },
  ],
  appointmentsBySpecialty: [
    { specialty: "Cardiologia", count: 320 },
    { specialty: "Dermatologia", count: 280 },
    { specialty: "Pediatria", count: 250 },
    { specialty: "Neurologia", count: 190 },
    { specialty: "Traumatologia", count: 200 },
  ],
  revenuePerMonth: [
    { month: "Ene", revenue: 32000 },
    { month: "Feb", revenue: 35000 },
    { month: "Mar", revenue: 42000 },
    { month: "Abr", revenue: 38000 },
    { month: "May", revenue: 45000 },
    { month: "Jun", revenue: 43000 },
    { month: "Jul", revenue: 48000 },
    { month: "Ago", revenue: 46000 },
    { month: "Sep", revenue: 52000 },
    { month: "Oct", revenue: 50000 },
    { month: "Nov", revenue: 54000 },
    { month: "Dic", revenue: 53000 },
  ],
}

export function getTimeSlotsForDate(doctorId: string, date: string): TimeSlot[] {
  const d = new Date(date)
  const dow = d.getDay()
  const avail = doctorAvailability.find((a) => a.doctorId === doctorId && a.dayOfWeek === dow)
  if (!avail || !avail.enabled) return []

  const slots: TimeSlot[] = []
  const bookedTimes = appointments
    .filter((a) => a.doctorId === doctorId && a.date === date && a.status !== "CANCELADA")
    .map((a) => a.time)

  const addSlots = (start: string, end: string) => {
    if (!start || !end) return
    let [h, m] = start.split(":").map(Number)
    const [eh, em] = end.split(":").map(Number)
    while (h < eh || (h === eh && m < em)) {
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      slots.push({ id: `${doctorId}-${date}-${t}`, time: t, available: !bookedTimes.includes(t) })
      m += 30
      if (m >= 60) { h++; m = 0 }
    }
  }

  addSlots(avail.startMorning, avail.endMorning)
  addSlots(avail.startAfternoon, avail.endAfternoon)
  return slots
}
