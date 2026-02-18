"use client"


import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarDays, Stethoscope, DollarSign, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"


export default function AdminDashboard() {
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/admin/statistics", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando estadísticas...</div>
  }
  if (!stats) {
    return <div className="p-8 text-center text-destructive">No se pudieron cargar las estadísticas.</div>
  }

  // Separar los datos para las tarjetas
  const totalUsers = stats.totalUsers ?? 0
  const totalAppointments = stats.totalAppointments ?? 0
  const activeDoctors = stats.activeDoctors ?? 0
  const revenue = stats.revenue ?? 0
  const appointmentsPerMonth = stats.appointmentsPerMonth ?? []

  const cards = [
    { label: "Total Usuarios", value: totalUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Citas Totales", value: totalAppointments.toLocaleString(), icon: CalendarDays, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { label: "Doctores Activos", value: activeDoctors, icon: Stethoscope, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { label: "Ingresos", value: `$${(revenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Panel de Administracion</h1>
        <p className="text-sm text-muted-foreground">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Citas por Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
