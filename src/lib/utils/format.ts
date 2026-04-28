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
