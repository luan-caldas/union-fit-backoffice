"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Fuse from "fuse.js"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { UsersFilters } from "./users-filters"
import { useUsers } from "@/hooks/use-users"
import { truncateUuid } from "@/lib/utils/format"
import type { UserWithSubscription } from "@/actions/users.actions"

function isSubscriptionActive(
  sub: UserWithSubscription["user_subscriptions"]
): boolean {
  if (!sub) return false
  if (!sub.is_active) return false
  if (sub.expiration_at && new Date(sub.expiration_at) < new Date()) return false
  return true
}

export function UsersTable() {
  const router = useRouter()
  const { data: users = [], isLoading } = useUsers()
  const [search, setSearch] = useState("")
  const [subscriptionFilter, setSubscriptionFilter] = useState("all")

  const fuse = useMemo(
    () =>
      new Fuse(users, {
        keys: ["name", "email", "id"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [users]
  )

  const filtered = useMemo(() => {
    let result: UserWithSubscription[] = search
      ? fuse.search(search).map((r) => r.item)
      : users

    if (subscriptionFilter === "active") {
      result = result.filter((u) => isSubscriptionActive(u.user_subscriptions))
    } else if (subscriptionFilter === "inactive") {
      result = result.filter((u) => !isSubscriptionActive(u.user_subscriptions))
    }

    return result
  }, [search, subscriptionFilter, users, fuse])

  return (
    <div className="space-y-4">
      <UsersFilters
        search={search}
        onSearchChange={setSearch}
        subscriptionFilter={subscriptionFilter}
        onSubscriptionFilterChange={setSubscriptionFilter}
      />

      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Assinatura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => {
                const active = isSubscriptionActive(user.user_subscriptions)
                return (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-surface-lowest"
                    onClick={() => router.push(`/users/${user.id}`)}
                  >
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image_profile ?? undefined} />
                        <AvatarFallback className="text-xs bg-brand-100 text-brand-700">
                          {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.name ?? <span className="text-muted-foreground italic">Sem nome</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {truncateUuid(user.id)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={active ? "default" : "secondary"}
                        className={active ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                      >
                        {active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} usuário{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
