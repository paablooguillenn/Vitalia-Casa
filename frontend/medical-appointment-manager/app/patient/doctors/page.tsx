"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Star, CalendarPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function PatientDoctorsPage() {
  const [query, setQuery] = useState("")
  const [specialty, setSpecialty] = useState("all")
  const [doctors, setDoctors] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSpecialties, setLoadingSpecialties] = useState(false)

  // ✅ VALIDACIÓN TOKEN + ERROR HANDLING
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error("Inicia sesión primero")
      return
    }

    setLoading(true)
    fetch("http://192.168.68.58:8080/api/doctors", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error fetching doctors:', err)
        toast.error("Error al cargar médicos")
      })
      .finally(() => setLoading(false))
  }, [])

  // ✅ VALIDACIÓN TOKEN + ERROR HANDLING
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error("Inicia sesión primero")
      return
    }

    setLoadingSpecialties(true)
    fetch("http://192.168.68.58:8080/api/doctors/specialties", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setSpecialties(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error fetching specialties:', err)
        toast.error("Error al cargar especialidades")
        setSpecialties(["all"]) // Fallback
      })
      .finally(() => setLoadingSpecialties(false))
  }, [])

  // ✅ FILTRO CORREGIDO (faltaba definirlo)
  const filtered = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesName = doc.nombre?.toLowerCase().includes(query.toLowerCase())
      const matchesSpecialty = specialty === "all" || doc.especialidad === specialty
      return matchesName && matchesSpecialty
    })
  }, [doctors, query, specialty])

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Buscar Médicos</h1>
        <p className="text-sm text-muted-foreground">Encuentre al especialista que necesita</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-9 h-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-full sm:w-48 h-11">
            <SelectValue placeholder="Especialidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especialidades</SelectItem>
            {loadingSpecialties ? (
              <SelectItem value="loading" disabled className="text-muted-foreground">
                Cargando...
              </SelectItem>
            ) : (
              specialties.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <div className="col-span-full flex flex-col items-center gap-2 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Cargando médicos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="text-lg font-medium text-muted-foreground">No se encontraron médicos</p>
              <p className="text-sm text-muted-foreground/70">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          </div>
        ) : (
          filtered.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-all border hover:border-primary/50 overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                      {(doc.nombre || "Dr").split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-lg font-bold text-foreground line-clamp-1">{doc.nombre}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {doc.especialidad}
                      </Badge>
                      {doc.rating && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{doc.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full group">
                  <Link 
                    href={`/patient/new-appointment?doctor=${doc.id}`}
                    className="flex items-center gap-2 group-hover:scale-[1.02] transition-transform"
                  >
                    <CalendarPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Reservar Cita
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <div className="text-center pt-8">
          <p className="text-sm text-muted-foreground">
            Mostrando {filtered.length} de {doctors.length} médicos
          </p>
        </div>
      )}
    </div>
  )
}
