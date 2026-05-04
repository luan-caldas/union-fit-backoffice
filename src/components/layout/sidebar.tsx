"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell, Users, Zap, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"

const navItems = [
  { href: "/users", label: "Usuários", icon: Users },
  { href: "/exercises", label: "Exercícios", icon: Dumbbell },
  { href: "/methods", label: "Métodos", icon: Zap },
  { href: "/periodization", label: "Periodização", icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { open, close } = useSidebar()

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-56 flex-col border-r border-border bg-white transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "md:static md:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-400">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-foreground">Union Fit</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-50 text-brand-600"
                        : "text-muted-foreground hover:bg-surface-low hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
