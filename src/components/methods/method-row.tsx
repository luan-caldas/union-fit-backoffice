"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import type { MethodRow } from "@/actions/methods.actions"
import { Pencil, PlayCircle } from "lucide-react"

interface MethodRowProps {
  method: MethodRow
  levelTitles: string[]
  objectiveTitles: string[]
  onEdit: (method: MethodRow) => void
}

export function MethodListRow({ method, levelTitles, objectiveTitles, onEdit }: MethodRowProps) {
  const thumbnail = getYouTubeThumbnail(method.video_url)

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-3 hover:shadow-sm transition-shadow">
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-highest">
        {thumbnail ? (
          <img src={thumbnail} alt={method.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PlayCircle className="h-5 w-5 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{method.name}</p>
        {method.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{method.description}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {levelTitles.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs h-4 px-1.5">
              {t}
            </Badge>
          ))}
          {objectiveTitles.map((t) => (
            <Badge key={t} variant="outline" className="text-xs h-4 px-1.5">
              {t}
            </Badge>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onEdit(method)}
        title="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
