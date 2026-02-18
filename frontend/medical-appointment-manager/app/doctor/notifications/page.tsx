"use client"


import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Bell } from "lucide-react"

export default function DoctorNotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/notifications`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setNotifications(data))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Notificaciones</h1>
      </div>
      {loading ? (
        <Card><CardContent className="py-8 text-center">Cargando notificaciones...</CardContent></Card>
      ) : notifications.length === 0 ? (
        <Card><CardContent className="py-8 text-center">No tienes notificaciones</CardContent></Card>
      ) : (
        notifications.map((n) => (
          <Card key={n.id} className="border-l-4 border-primary">
            <CardContent className="py-3 px-4">
              <div className="font-semibold text-base mb-1">{n.title}</div>
              <div className="text-sm text-muted-foreground mb-1">{n.message}</div>
              <div className="text-xs text-muted-foreground/70">{new Date(n.timestamp || n.createdAt).toLocaleString("es-ES")}</div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
