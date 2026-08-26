"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  formatDecimal,
  formatKm,
  formatMinSec,
  parseDecimal,
  parseInteger,
  parseKm,
  parseMinSec,
} from "@/lib/utils/cardio-metrics"
import { updateCardioExerciseMetrics } from "@/actions/cardio.actions"
import type {
  CardioExercise,
  CardioExerciseMetrics,
} from "@/actions/cardio.actions"

const FORMAT_MIN_SEC = "Use o formato mm:ss"
const FORMAT_NUMBER = "Use um número válido"
const NEGATIVE = "Use um valor positivo"
const MAX_WITHOUT_MIN = "Informe o mínimo antes do máximo"
const MIN_GREATER = "O mínimo não pode ser maior que o máximo"
const TOO_HIGH = "Valor muito alto"

// Column limits: speed is numeric(5,2), incline is numeric(4,1)
const MAX_SPEED = 999.99
const MAX_INCLINE = 999.9

type FormState = {
  paceMin: string
  paceMax: string
  speedMin: string
  speedMax: string
  rpmMin: string
  rpmMax: string
  duration: string
  distance: string
  incline: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

type ParsedField = { value: number | null; error?: string }

function toFormState(exercise: CardioExercise): FormState {
  return {
    paceMin: formatMinSec(exercise.pace_min_seconds),
    paceMax: formatMinSec(exercise.pace_max_seconds),
    speedMin: formatDecimal(exercise.speed_min, 2),
    speedMax: formatDecimal(exercise.speed_max, 2),
    rpmMin: exercise.rpm_min === null ? "" : String(exercise.rpm_min),
    rpmMax: exercise.rpm_max === null ? "" : String(exercise.rpm_max),
    duration: formatMinSec(exercise.duration_seconds),
    distance: formatKm(exercise.distance_meters),
    incline: formatDecimal(exercise.incline_degrees, 1),
  }
}

function checkNumber(
  parsed: number | null | undefined,
  formatError: string,
  max?: number
): ParsedField {
  if (parsed === undefined) return { value: null, error: formatError }
  if (parsed !== null && parsed < 0) return { value: null, error: NEGATIVE }
  if (parsed !== null && max !== undefined && parsed > max) {
    return { value: null, error: TOO_HIGH }
  }
  return { value: parsed }
}

// Mirrors DB CHECK constraints: pace_range_valid, speed_range_valid, rpm_range_valid
function checkRange(
  min: ParsedField,
  max: ParsedField
): { minError?: string; maxError?: string } {
  if (min.error || max.error) return {}
  if (max.value !== null && min.value === null) {
    return { maxError: MAX_WITHOUT_MIN }
  }
  if (min.value !== null && max.value !== null && min.value > max.value) {
    return { minError: MIN_GREATER }
  }
  return {}
}

function validate(form: FormState): {
  metrics: CardioExerciseMetrics | null
  errors: FieldErrors
} {
  const paceMin = checkNumber(parseMinSec(form.paceMin), FORMAT_MIN_SEC)
  const paceMax = checkNumber(parseMinSec(form.paceMax), FORMAT_MIN_SEC)
  const speedMin = checkNumber(parseDecimal(form.speedMin, 2), FORMAT_NUMBER, MAX_SPEED)
  const speedMax = checkNumber(parseDecimal(form.speedMax, 2), FORMAT_NUMBER, MAX_SPEED)
  const rpmMin = checkNumber(parseInteger(form.rpmMin), FORMAT_NUMBER)
  const rpmMax = checkNumber(parseInteger(form.rpmMax), FORMAT_NUMBER)
  const duration = checkNumber(parseMinSec(form.duration), FORMAT_MIN_SEC)
  const distance = checkNumber(parseKm(form.distance), FORMAT_NUMBER)
  const incline = checkNumber(parseDecimal(form.incline, 1), FORMAT_NUMBER, MAX_INCLINE)

  const paceRange = checkRange(paceMin, paceMax)
  const speedRange = checkRange(speedMin, speedMax)
  const rpmRange = checkRange(rpmMin, rpmMax)

  const errors: FieldErrors = {}
  const assign = (key: keyof FormState, ...candidates: (string | undefined)[]) => {
    const message = candidates.find(Boolean)
    if (message) errors[key] = message
  }

  assign("paceMin", paceMin.error, paceRange.minError)
  assign("paceMax", paceMax.error, paceRange.maxError)
  assign("speedMin", speedMin.error, speedRange.minError)
  assign("speedMax", speedMax.error, speedRange.maxError)
  assign("rpmMin", rpmMin.error, rpmRange.minError)
  assign("rpmMax", rpmMax.error, rpmRange.maxError)
  assign("duration", duration.error)
  assign("distance", distance.error)
  assign("incline", incline.error)

  if (Object.keys(errors).length > 0) return { metrics: null, errors }

  return {
    errors,
    metrics: {
      pace_min_seconds: paceMin.value,
      pace_max_seconds: paceMax.value,
      speed_min: speedMin.value,
      speed_max: speedMax.value,
      rpm_min: rpmMin.value,
      rpm_max: rpmMax.value,
      duration_seconds: duration.value,
      distance_meters: distance.value,
      incline_degrees: incline.value,
    },
  }
}

const GRID_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
} as const

function MetricBlock({
  title,
  columns = 2,
  children,
}: {
  title: string
  columns?: 1 | 2 | 3
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className={`grid gap-3 ${GRID_CLASS[columns]}`}>{children}</div>
    </div>
  )
}

function MetricField({
  label = "",
  placeholder,
  value,
  error,
  onChange,
}: {
  label?: string
  placeholder: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
      <Input
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function MinSecField({
  label = "",
  placeholder,
  value,
  error,
  onChange,
}: {
  label?: string
  placeholder: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 5)
    if (digits.length === 0) { onChange(""); return }
    const padded = digits.padStart(Math.max(digits.length, 3), "0")
    const mins = padded.slice(0, -2).replace(/^0+/, "") || "0"
    onChange(mins + ":" + padded.slice(-2))
  }

  return (
    <div className="space-y-1">
      {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
      <Input
        value={value}
        placeholder={placeholder}
        inputMode="numeric"
        aria-invalid={Boolean(error)}
        onChange={handleChange}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

interface CardioMetricsDialogProps {
  open: boolean
  onClose: () => void
  exercise: CardioExercise
  userId: string
}

export function CardioMetricsDialog({
  open,
  onClose,
  exercise,
  userId,
}: CardioMetricsDialogProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(exercise))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()

  // Reseed the form each time the dialog opens so stale values never show.
  useEffect(() => {
    if (!open) return
    setForm(toFormState(exercise))
    setErrors({})
  }, [open, exercise])

  function update(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function handleSave() {
    const { metrics, errors: nextErrors } = validate(form)
    setErrors(nextErrors)
    if (!metrics) return

    startTransition(async () => {
      await updateCardioExerciseMetrics(exercise.uuid, metrics, userId)
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {exercise.exercise_details?.name ?? "Exercício"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <MetricBlock title="Pace (min/km)">
            <MinSecField
              label="Mínimo"
              placeholder="5:00"
              value={form.paceMin}
              error={errors.paceMin}
              onChange={(v) => update("paceMin", v)}
            />
            <MinSecField
              label="Máximo"
              placeholder="5:30"
              value={form.paceMax}
              error={errors.paceMax}
              onChange={(v) => update("paceMax", v)}
            />
          </MetricBlock>

          <MetricBlock title="Velocidade (km/h)">
            <MetricField
              label="Mínimo"
              placeholder="10"
              value={form.speedMin}
              error={errors.speedMin}
              onChange={(v) => update("speedMin", v)}
            />
            <MetricField
              label="Máximo"
              placeholder="12,5"
              value={form.speedMax}
              error={errors.speedMax}
              onChange={(v) => update("speedMax", v)}
            />
          </MetricBlock>

          <MetricBlock title="RPM">
            <MetricField
              label="Mínimo"
              placeholder="80"
              value={form.rpmMin}
              error={errors.rpmMin}
              onChange={(v) => update("rpmMin", v)}
            />
            <MetricField
              label="Máximo"
              placeholder="90"
              value={form.rpmMax}
              error={errors.rpmMax}
              onChange={(v) => update("rpmMax", v)}
            />
          </MetricBlock>

          <MetricBlock title="Tempo (mm:ss)" columns={1}>
            <MinSecField
              placeholder="30:00"
              value={form.duration}
              error={errors.duration}
              onChange={(v) => update("duration", v)}
            />
          </MetricBlock>

          <MetricBlock title="Distância (km)" columns={1}>
            <MetricField
              placeholder="2,5"
              value={form.distance}
              error={errors.distance}
              onChange={(v) => update("distance", v)}
            />
          </MetricBlock>

          <MetricBlock title="Inclinação (%)" columns={1}>
            <MetricField
              placeholder="3"
              value={form.incline}
              error={errors.incline}
              onChange={(v) => update("incline", v)}
            />
          </MetricBlock>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
