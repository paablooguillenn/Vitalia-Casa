"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Stethoscope, User, UserCog, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const { login, loginAs } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regPhone, setRegPhone] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (!success) {
      toast.error("Credenciales inválidas o error de conexión.");
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: regName,
          email: regEmail,
          password: regPassword,
          telefono: regPhone,
        }),
      });
      if (res.ok) {
        toast.success("Cuenta creada exitosamente. Ahora inicie sesión.");
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setRegPhone("");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Error al crear la cuenta.");
      }
    } catch (err) {
      toast.error("No se pudo conectar con el servidor.");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="relative hidden flex-1 items-center justify-center bg-primary lg:flex">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-primary-foreground" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center text-primary-foreground">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
            <Stethoscope className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Vitalia</h1>
          <p className="max-w-md text-lg text-primary-foreground/80 leading-relaxed">
            Gestione sus citas medicas de forma rapida, segura y eficiente. Todo desde un solo lugar.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/50" />
              Agende citas en segundos
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/50" />
              Historial medico completo
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/50" />
              Recordatorios automaticos
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Vitalia</span>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="px-0 lg:px-6">
              <CardTitle className="text-2xl text-foreground">Bienvenido</CardTitle>
              <CardDescription>Inicie sesion o cree una cuenta para continuar</CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar Sesion</TabsTrigger>
                  <TabsTrigger value="register">Registrarse</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">Correo electronico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="password">Contrasena</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Iniciar Sesion
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="reg-name">Nombre completo</Label>
                      <Input
                        id="reg-name"
                        placeholder="Juan Perez"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="reg-phone">Número de teléfono</Label>
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="600123456"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="reg-email">Correo electronico</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="reg-password">Contrasena</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Crear Cuenta</Button>
                  </form>
                </TabsContent>
              </Tabs>


            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
