"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { setUserAutoEvolution } from "@/actions/users.actions"

interface UserAutoEvolutionToggleProps {
  userId: string
  enabled: boolean
}

export function UserAutoEvolutionToggle({
  userId,
  enabled: initialEnabled,
}: UserAutoEvolutionToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: boolean) {
    const previous = enabled
    setEnabled(next)

    startTransition(async () => {
      try {
        await setUserAutoEvolution(userId, next)
        toast.success(next ? "Evolução automática ativada" : "Evolução automática desativada")
      } catch (e) {
        setEnabled(previous)
        toast.error(e instanceof Error ? e.message : "Erro ao atualizar a evolução automática.")
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <span>Evolução automática</span>
        <Switch
          checked={enabled}
          onCheckedChange={handleChange}
          disabled={isPending}
          aria-label="Evolução automática de treino"
        />
      </label>
      <p className="max-w-xs text-right text-xs text-muted-foreground">
        {enabled
          ? "Um novo treino é gerado automaticamente a cada ciclo."
          : "Desativada: nenhum novo treino será gerado automaticamente para este usuário."}
      </p>
    </div>
  )
}
