
"use client"
import React from "react";

// import { statsData } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

const PIE_COLORS = [
  "hsl(152, 69%, 41%)",
  "hsl(199, 60%, 49%)",
  "hsl(43, 74%, 66%)",
  "hsl(280, 65%, 60%)",
  "hsl(12, 76%, 61%)",
]


function StatisticsPage() {
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

  // Datos reales del backend
  const appointmentsPerMonth = stats.appointmentsPerMonth ?? []
  const revenuePerMonth = appointmentsPerMonth.map((m: any) => ({ month: m.month, revenue: m.count * 100 }))
  // Si el backend provee citas por especialidad, usarlo; si no, mostrar vacío
  // El backend devuelve "citasPorEspecialidad", pero el frontend espera "appointmentsBySpecialty"
  const appointmentsBySpecialty = ((stats.citasPorEspecialidad || stats.appointmentsBySpecialty) ?? []).map(
    (item: any) => ({ ...item, count: Number(item.count) })
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Estadisticas</h1>
        <p className="text-sm text-muted-foreground">Analisis detallado del sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar chart - appointments per month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">Citas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" name="Citas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart - by specialty (real si existe) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">Citas por Especialidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentsBySpecialty}
                    dataKey="count"
                    nameKey="especialidad"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ especialidad, percent }) => `${especialidad} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {appointmentsBySpecialty.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Line chart - revenue (real) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Ingresos Mensuales (MXN)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenuePerMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Ingresos"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Ingresos"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StatisticsPage;
