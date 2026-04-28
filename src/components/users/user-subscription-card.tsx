import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"
import type { Tables } from "@/lib/supabase/database.types"

type Subscription = Tables<"user_subscriptions">

interface UserSubscriptionCardProps {
  subscription: Subscription | null
}

function isActive(sub: Subscription | null): boolean {
  if (!sub) return false
  if (!sub.is_active) return false
  if (sub.expiration_at && new Date(sub.expiration_at) < new Date()) return false
  return true
}

export function UserSubscriptionCard({ subscription }: UserSubscriptionCardProps) {
  const active = isActive(subscription)

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Assinatura</h3>
        <Badge
          variant={active ? "default" : "secondary"}
          className={active ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
        >
          {active ? "Ativa" : "Inativa"}
        </Badge>
      </div>

      {subscription ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Produto</dt>
          <dd className="font-medium">{subscription.entitlement_id ?? "—"}</dd>

          <dt className="text-muted-foreground">Validade</dt>
          <dd className="font-medium">{formatDate(subscription.expiration_at)}</dd>

          <dt className="text-muted-foreground">Último evento</dt>
          <dd className="font-medium">{subscription.last_event_type ?? "—"}</dd>

          <dt className="text-muted-foreground">Data do evento</dt>
          <dd className="font-medium">{formatDate(subscription.last_event_at)}</dd>
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">Sem assinatura registrada</p>
      )}
    </div>
  )
}
