"use client"

import type { UserRole } from "@/lib/types"
import { SidebarNav } from "./sidebar-nav"
import { BottomNav } from "./bottom-nav"
import { Header } from "./header"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AppShell({ role, children }: { role: UserRole; children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="hidden w-60 shrink-0 border-r bg-card md:block">
        <ScrollArea className="h-full">
          <SidebarNav role={role} />
        </ScrollArea>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="mx-auto max-w-7xl p-4 md:p-6">{children}</div>
        </main>
      </div>
      <BottomNav role={role} />
    </div>
  )
}
