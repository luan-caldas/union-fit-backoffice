"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { PeriodizationCard } from "./periodization-card"
import { usePeriodizations } from "@/hooks/use-periodization"

export function PeriodizationList() {
  const { data: periodizations = [], isLoading } = usePeriodizations()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    )
  }

  if (periodizations.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Nenhuma periodização encontrada
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {periodizations.map((p) => (
        <PeriodizationCard key={p.uuid} periodization={p} />
      ))}
    </div>
  )
}
