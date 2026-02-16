export type UserRole = "patient" | "doctor" | "admin"

export type AppointmentStatus = "CONFIRMADA" | "PENDIENTE" | "CANCELADA" | "COMPLETADA"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  avatar?: string
}

export interface Doctor {
  id: string
  userId: string
  name: string
  email: string
  specialty: string
  rating: number
  reviewCount: number
  avatar: string
  available: boolean
  bio: string
}

export interface TimeSlot {
  id: string
  time: string
  available: boolean
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  status: AppointmentStatus
  notes?: string
  qrCode?: string
}

export interface DoctorAvailability {
  doctorId: string
  dayOfWeek: number
  startMorning: string
  endMorning: string
  startAfternoon: string
  endAfternoon: string
  enabled: boolean
}

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  details: string
}

export interface Notification {
  id: string
  type: "appointment" | "cancellation" | "reminder" | "system"
  title: string
  message: string
  read: boolean
  timestamp: string
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  appointmentId: string
  uploadedAt: string
}

export interface StatsData {
  totalUsers: number
  totalAppointments: number
  activeDoctors: number
  revenue: number
  appointmentsPerMonth: { month: string; count: number }[]
  appointmentsBySpecialty: { specialty: string; count: number }[]
  revenuePerMonth: { month: string; revenue: number }[]
}
