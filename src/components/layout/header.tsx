"use client"

import { signOut } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import { useSidebar } from "./sidebar-context"

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { toggle } = useSidebar()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>
      <form action={signOut}>
        <Button variant="ghost" size="sm" type="submit" className="gap-1.5 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </form>
    </header>
  )
}
