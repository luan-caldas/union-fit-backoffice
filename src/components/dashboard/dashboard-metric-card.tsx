"use client"

import Link from "next/link"
import { type LucideIcon } from "lucide-react"
import { RollingNumber } from "@/components/ui/rolling-number"
import { cn } from "@/lib/utils"

interface DashboardMetricCardProps {
  icon: LucideIcon
  label: string
  value: number
  href?: string
}

export function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  href,
}: DashboardMetricCardProps) {
  const card = (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-white p-6 transition-colors",
        href && "cursor-pointer hover:bg-surface-lowest"
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50">
        <Icon className="h-5 w-5 text-brand-500" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">
          <RollingNumber value={value} />
        </p>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }

  return card
}
