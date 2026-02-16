"use client"

import { useState } from "react"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import QRCode from "react-qr-code"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { QrCode, Search, CheckCircle, XCircle } from "lucide-react"
import { appointments } from "@/lib/mock-data"
// Eliminar mock-data, usar backend
export default function DoctorQRPage() {
  const [scanInput, setScanInput] = useState("")
  const [scanResult, setScanResult] = useState<"found" | "notfound" | null>(null)
  const [foundAppointment, setFoundAppointment] = useState<any | null>(null)
  const { user } = useAuth();
  const [qrValue, setQrValue] = useState("");
  useEffect(() => {
    if (user) {
      // Generar QR con info del consultorio
      setQrValue(`doctor:${user.id}`);
    }
  }, [user]);
  const handleVerify = () => {
    if (!scanInput.trim()) return;
    fetch(`http://172.20.10.4:8080/api/appointments/${scanInput.trim()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.id) {
          setScanResult("found");
          setFoundAppointment({
            patientName: data.patient?.nombre || '',
            date: data.dateTime ? data.dateTime.split('T')[0] : '',
            time: data.dateTime ? data.dateTime.split('T')[1]?.substring(0,5) : '',
            status: data.status,
          });
        } else {
          setScanResult("notfound");
          setFoundAppointment(null);
        }
      });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Codigo QR</h1>
        <p className="text-sm text-muted-foreground">Genere y verifique codigos QR de citas</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* QR Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">QR de Consultorio</CardTitle>
            <CardDescription>Los pacientes pueden escanear este código para registrar su llegada</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50">
              {qrValue && <QRCode value={qrValue} size={180} />}
            </div>
            <p className="text-xs text-muted-foreground">Consultorio {user?.nombre || "Doctor"}</p>
          </CardContent>
        </Card>

        {/* QR Validator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">Verificar Cita</CardTitle>
            <CardDescription>Ingrese el ID de la cita para verificar su validez</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="scan">ID de Cita</Label>
              <div className="flex gap-2">
                <Input
                  id="scan"
                  placeholder="Ej: a1, a2, a3..."
                  value={scanInput}
                  onChange={(e) => { setScanInput(e.target.value); setScanResult(null) }}
                />
                <Button onClick={handleVerify} disabled={!scanInput.trim()}>
                  <Search className="mr-2 h-4 w-4" /> Verificar
                </Button>
              </div>
            </div>

            {scanResult === "found" && foundAppointment && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Cita Verificada</span>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-foreground"><span className="text-muted-foreground">Paciente:</span> {foundAppointment.patientName}</p>
                  <p className="text-foreground"><span className="text-muted-foreground">Fecha:</span> {foundAppointment.date}</p>
                  <p className="text-foreground"><span className="text-muted-foreground">Hora:</span> {foundAppointment.time}</p>
                  <p className="text-foreground"><span className="text-muted-foreground">Estado:</span> {foundAppointment.status}</p>
                </div>
              </div>
            )}

            {scanResult === "notfound" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-semibold text-red-800 dark:text-red-300">Cita no encontrada</span>
                </div>
                <p className="mt-1 text-xs text-red-700 dark:text-red-400">El ID proporcionado no corresponde a ninguna cita registrada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
