"use client"

import { PeriodizationDetailRow, AddPeriodizationDetailRow } from "./periodization-detail-form"
import type { PeriodizationWithLevel } from "@/actions/periodization.actions"

interface PeriodizationCardProps {
  periodization: PeriodizationWithLevel
}

export function PeriodizationCard({ periodization }: PeriodizationCardProps) {
  const nextOrder = periodization.details.length + 1

  return (
    <div className="rounded-xl border border-border bg-white p-4 space-y-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{periodization.level_title}</h3>
        <span className="text-xs text-muted-foreground">
          {periodization.details.length} semana{periodization.details.length !== 1 ? "s" : ""}
        </span>
      </div>

      {periodization.details.map((detail) => (
        <PeriodizationDetailRow
          key={detail.uuid}
          detail={detail}
          periodizationUuid={periodization.uuid}
        />
      ))}

      <AddPeriodizationDetailRow
        periodizationUuid={periodization.uuid}
        nextOrder={nextOrder}
      />
    </div>
  )
}
