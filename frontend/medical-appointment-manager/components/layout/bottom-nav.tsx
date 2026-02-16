"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/types"
import { navByRole } from "./sidebar-nav"

export function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const items = navByRole[role].slice(0, 5)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="flex items-center justify-around py-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors min-w-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate max-w-[56px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
