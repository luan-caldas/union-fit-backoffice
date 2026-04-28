import { Dumbbell } from "lucide-react"

export function UserTrainingEmpty() {
  return (
    <div className="rounded-xl border border-border bg-white p-8 text-center">
      <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
      <p className="font-medium text-foreground">Sem treino gerado</p>
      <p className="text-sm text-muted-foreground mt-1">
        Este usuário ainda não possui um treino
      </p>
    </div>
  )
}
