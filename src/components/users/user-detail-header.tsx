import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Tables } from "@/lib/supabase/database.types"

type User = Tables<"user">

const TRAINING_STATUS_LABELS: Record<string, string> = {
  PENDENT: "Pendente",
  GENERATING: "Gerando",
  COMPLETED: "Concluído",
}

interface UserDetailHeaderProps {
  user: User
  trainingStatus?: string | null
}

export function UserDetailHeader({ user, trainingStatus }: UserDetailHeaderProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-6">
      <Avatar className="h-16 w-16 shrink-0">
        <AvatarImage src={user.image_profile ?? undefined} />
        <AvatarFallback className="bg-brand-100 text-brand-700 text-lg font-bold">
          {(user.name ?? user.email ?? "?")[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-foreground truncate">
            {user.name ?? <span className="text-muted-foreground italic font-normal">Sem nome</span>}
          </h2>
          {trainingStatus && (
            <Badge variant="outline" className="text-xs">
              Treino: {TRAINING_STATUS_LABELS[trainingStatus] ?? trainingStatus}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{user.email ?? "—"}</p>
        {user.phone && (
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        )}
        <p className="mt-1.5 font-mono text-xs text-muted-foreground">{user.id}</p>
      </div>
    </div>
  )
}
