"use client"

import { AppShell } from "@/components/layout/app-shell"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="doctor">{children}</AppShell>
}
