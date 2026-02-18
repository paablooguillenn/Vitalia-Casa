// app/patient/layout.tsx

import { ReactNode } from "react"
import { Header } from "../../components/layout/header"
import { SidebarNav } from "../../components/layout/sidebar-nav"
import { BottomNav } from "../../components/layout/bottom-nav"


export default function PatientLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="hidden md:block w-64 border-r bg-card/50">
          <SidebarNav role="patient" />
        </div>
        <main className="flex-1 pt-4 md:pt-6 pb-8">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <BottomNav role="patient" />
    </div>
  )
}
