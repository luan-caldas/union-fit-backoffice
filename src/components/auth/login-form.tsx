"use client"

import { useState } from "react"
import { signIn, type SignInError } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dumbbell, WifiOff, ShieldOff, AlertCircle } from "lucide-react"

const ERROR_ICONS = {
  network: WifiOff,
  forbidden: ShieldOff,
  auth: AlertCircle,
} as const

export function LoginForm() {
  const [errorInfo, setErrorInfo] = useState<SignInError | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorInfo(null)
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    const result = await signIn(email, password)
    if (result?.error) {
      setErrorInfo(result)
      setLoading(false)
    }
  }

  const ErrorIcon = errorInfo ? ERROR_ICONS[errorInfo.type] : null

  return (
    <div className="flex min-h-svh items-center justify-center bg-surface-lowest p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm border border-border">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-400">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Union Fit</h1>
          <p className="text-sm text-muted-foreground">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@unionfit.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {errorInfo && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {ErrorIcon && <ErrorIcon className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{errorInfo.error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
