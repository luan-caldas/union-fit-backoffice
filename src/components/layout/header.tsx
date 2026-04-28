"use client"

import { signOut } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <form action={signOut}>
        <Button variant="ghost" size="sm" type="submit" className="gap-1.5 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </form>
    </header>
  )
}
