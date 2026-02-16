"use client"

import { useState } from "react"
import { fileAttachments } from "@/lib/mock-data"
import type { FileAttachment } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default function DoctorAttachmentsPage() {
  const [files, setFiles] = useState<FileAttachment[]>(fileAttachments)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files
    if (dropped.length > 0) {
      const newFile: FileAttachment = {
        id: `f-${Date.now()}`,
        name: dropped[0].name,
        type: dropped[0].type,
        size: dropped[0].size,
        url: "#",
        appointmentId: "a1",
        uploadedAt: new Date().toISOString(),
      }
      setFiles((prev) => [newFile, ...prev])
      toast.success(`Archivo "${dropped[0].name}" subido correctamente`)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (selected && selected.length > 0) {
      const newFile: FileAttachment = {
        id: `f-${Date.now()}`,
        name: selected[0].name,
        type: selected[0].type,
        size: selected[0].size,
        url: "#",
        appointmentId: "a1",
        uploadedAt: new Date().toISOString(),
      }
      setFiles((prev) => [newFile, ...prev])
      toast.success(`Archivo "${selected[0].name}" subido correctamente`)
    }
  }

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    toast.info("Archivo eliminado")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Adjuntos</h1>
        <p className="text-sm text-muted-foreground">Gestione documentos y archivos de citas</p>
      </div>

      {/* Upload area */}
      <Card>
        <CardContent className="p-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30"
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Arrastre archivos aqui o</p>
            <label>
              <input type="file" className="sr-only" onChange={handleFileInput} />
              <Button variant="outline" size="sm" asChild>
                <span>Seleccionar Archivo</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* File list */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Archivos ({files.length})</h2>
        {files.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No hay archivos adjuntos</p>
            </CardContent>
          </Card>
        ) : (
          files.map((file) => (
            <Card key={file.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)} - {new Date(file.uploadedAt).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info("Vista previa no disponible en demo")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(file.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
