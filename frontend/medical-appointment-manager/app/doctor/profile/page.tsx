"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Save } from "lucide-react"
import { toast } from "sonner"

export default function DoctorProfilePage() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [phone, setPhone] = useState("")
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageTimestamp, setImageTimestamp] = useState(Date.now())

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setName(data.nombre || "");
        setEmail(data.email || "");
        setPhone(data.telefono || "");
        setProfilePictureUrl(data.profilePictureUrl || null);
      });
  }, [user?.id]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const [saving, setSaving] = useState(false)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nombre: name,
          telefono: phone
        })
      });
      if (!res.ok) throw new Error("Error al actualizar el perfil");
      toast.success("Perfil actualizado correctamente");
    } catch (err) {
      toast.error("No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Gestione su informacion personal</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                {profilePictureUrl ? (
                  <AvatarImage src={profilePictureUrl + `?t=${imageTimestamp}`} alt="Foto de perfil" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <form style={{ position: "absolute", bottom: 0, right: 0 }}>
                <label htmlFor="profile-picture-upload" className="cursor-pointer bg-primary text-white rounded-full px-2 py-1 text-xs">
                  {uploading ? "Subiendo..." : "Cambiar"}
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={async (e) => {
                      if (!user?.id || !e.target.files?.[0]) return;
                      setUploading(true);
                      const formData = new FormData();
                      formData.append("file", e.target.files[0]);
                      try {
                        const res = await fetch(`/api/users/${user.id}/profile-picture`, {
                          method: "POST",
                          headers: {
                            "Authorization": `Bearer ${localStorage.getItem('token')}`
                          },
                          body: formData
                        });
                        if (!res.ok) throw new Error("Error al subir la foto");
                        toast.success("Foto de perfil actualizada");
                        // Refrescar la foto
                        fetch(`/api/users/${user.id}`, {
                          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
                        })
                          .then(res => res.json())
                          .then(data => {
                            setProfilePictureUrl(data.profilePictureUrl || null);
                            setImageTimestamp(Date.now());
                            setUser({
                              ...user,
                              profilePictureUrl: data.profilePictureUrl || null
                            });
                          });
                      } catch (err) {
                        toast.error("No se pudo subir la foto");
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </label>
              </form>
            </div>
            <div>
              <CardTitle className="text-foreground">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
