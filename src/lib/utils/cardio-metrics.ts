import type { CardioExerciseMetrics } from "@/actions/cardio.actions"

export type CardioMetricColumns = CardioExerciseMetrics

export type MetricBadge = {
  key: string
  label: string
  value: string
}

const MIN_SEC_PATTERN = /^(\d{1,3}):([0-5]\d)$/
const INTEGER_PATTERN = /^-?\d+$/
const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/

/** "5:30" -> 330 | "" -> null | "abc" -> undefined */
export function parseMinSec(input: string): number | null | undefined {
  const trimmed = input.trim()
  if (trimmed === "") return null
  const match = MIN_SEC_PATTERN.exec(trimmed)
  if (!match) return undefined
  return Number(match[1]) * 60 + Number(match[2])
}

/** 330 -> "5:30" | null -> "" */
export function formatMinSec(totalSeconds: number | null): string {
  if (totalSeconds === null) return ""
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

/** "80" -> 80 | "" -> null | "8a" -> undefined */
export function parseInteger(input: string): number | null | undefined {
  const trimmed = input.trim()
  if (trimmed === "") return null
  if (!INTEGER_PATTERN.test(trimmed)) return undefined
  return Number(trimmed)
}

/** Accepts comma or period as decimal separator. "10,55" with decimals=2 -> 10.55 | "" -> null | "x" -> undefined */
export function parseDecimal(
  input: string,
  decimals: number
): number | null | undefined {
  const trimmed = input.trim()
  if (trimmed === "") return null
  const normalized = trimmed.replace(",", ".")
  if (!DECIMAL_PATTERN.test(normalized)) return undefined
  const factor = 10 ** decimals
  return Math.round(Number(normalized) * factor) / factor
}

/** 10.5 with decimals=2 -> "10,5" | 10 -> "10" | null -> "" */
export function formatDecimal(value: number | null, decimals: number): string {
  if (value === null) return ""
  const fixed = value.toFixed(decimals)
  const trimmed = fixed.includes(".")
    ? fixed.replace(/0+$/, "").replace(/\.$/, "")
    : fixed
  return trimmed.replace(".", ",")
}

/** "2,5" -> 2500 meters | "" -> null | "x" -> undefined */
export function parseKm(input: string): number | null | undefined {
  const km = parseDecimal(input, 3)
  if (km === null || km === undefined) return km
  return Math.round(km * 1000)
}

/** 2500 -> "2,5" | null -> "" */
export function formatKm(meters: number | null): string {
  if (meters === null) return ""
  return formatDecimal(meters / 1000, 3)
}

/**
 * Duration badge label. Deliberately differs from formatMinSec:
 * a "Tempo 5:30" badge would be misread as pace.
 * 330 -> "5 min 30 s" | 300 -> "5 min" | 45 -> "45 s"
 */
export function formatDurationLabel(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds} s`
  if (seconds === 0) return `${minutes} min`
  return `${minutes} min ${seconds} s`
}

function range(min: string, max: string): string {
  return max === "" ? min : `${min}–${max}`
}

/** Returns only filled metrics, already formatted with name and unit. */
export function buildMetricBadges(metrics: CardioMetricColumns): MetricBadge[] {
  const badges: MetricBadge[] = []

  if (metrics.pace_min_seconds !== null) {
    badges.push({
      key: "pace",
      label: "Pace",
      value: `${range(
        formatMinSec(metrics.pace_min_seconds),
        formatMinSec(metrics.pace_max_seconds)
      )} min/km`,
    })
  }

  if (metrics.speed_min !== null) {
    badges.push({
      key: "speed",
      label: "Velocidade",
      value: `${range(
        formatDecimal(metrics.speed_min, 2),
        formatDecimal(metrics.speed_max, 2)
      )} km/h`,
    })
  }

  if (metrics.rpm_min !== null) {
    badges.push({
      key: "rpm",
      label: "RPM",
      value: range(
        String(metrics.rpm_min),
        metrics.rpm_max === null ? "" : String(metrics.rpm_max)
      ),
    })
  }

  if (metrics.duration_seconds !== null) {
    badges.push({
      key: "duration",
      label: "Tempo",
      value: formatDurationLabel(metrics.duration_seconds),
    })
  }

  if (metrics.distance_meters !== null) {
    badges.push({
      key: "distance",
      label: "Distância",
      value: `${formatKm(metrics.distance_meters)} km`,
    })
  }

  if (metrics.incline_degrees !== null) {
    badges.push({
      key: "incline",
      label: "Inclinação",
      value: `${formatDecimal(metrics.incline_degrees, 1)}%`,
    })
  }

  return badges
}
