export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function truncateUuid(uuid: string | null | undefined): string {
  if (!uuid) return "—"
  return uuid.slice(0, 8) + "..."
}

export function calcAge(yearBirth: number | null | undefined): string {
  if (!yearBirth) return "—"
  return String(new Date().getFullYear() - yearBirth)
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDuration(startStr: string, endStr: string): string {
  const total = Math.max(
    Math.round((new Date(endStr).getTime() - new Date(startStr).getTime()) / 1000),
    0
  )
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":")
}
