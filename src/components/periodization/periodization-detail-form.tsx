"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useUpsertPeriodizationDetail,
  useDeletePeriodizationDetail,
} from "@/hooks/use-periodization"
import type { PeriodizationDetail } from "@/actions/periodization.actions"
import { Pencil, Trash2, Check, X, Plus } from "lucide-react"
import { ConfirmButton } from "@/components/ui/confirm-button"

const schema = z.object({
  min_repetitions: z.number().int().min(1),
  max_repetitions: z.number().int().min(1),
})

type FormValues = z.infer<typeof schema>

interface DetailRowProps {
  detail: PeriodizationDetail
  periodizationUuid: string
}

export function PeriodizationDetailRow({ detail, periodizationUuid }: DetailRowProps) {
  const [editing, setEditing] = useState(false)
  const { mutateAsync: upsert, isPending: saving } = useUpsertPeriodizationDetail()
  const { mutateAsync: remove, isPending: deleting } = useDeletePeriodizationDetail()

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      min_repetitions: detail.min_repetitions,
      max_repetitions: detail.max_repetitions,
    },
  })

  async function onSubmit(values: FormValues) {
    await upsert({
      uuid: detail.uuid,
      periodization_uuid: periodizationUuid,
      order: detail.order,
      min_repetitions: values.min_repetitions,
      max_repetitions: values.max_repetitions,
    })
    setEditing(false)
  }

  function handleCancel() {
    reset({ min_repetitions: detail.min_repetitions, max_repetitions: detail.max_repetitions })
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span className="w-6 text-xs text-muted-foreground text-center shrink-0">{detail.order}</span>

      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Input
              {...register("min_repetitions", { valueAsNumber: true })}
              type="number"
              className="h-7 w-16 text-center text-sm"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <Input
              {...register("max_repetitions", { valueAsNumber: true })}
              type="number"
              className="h-7 w-16 text-center text-sm"
            />
            <span className="text-xs text-muted-foreground">reps</span>
          </div>
          <Button type="submit" size="icon" variant="ghost" className="h-7 w-7" disabled={saving}>
            <Check className="h-3.5 w-3.5 text-green-600" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      ) : (
        <>
          <span className="flex-1 text-sm">
            {detail.min_repetitions}–{detail.max_repetitions} reps
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <ConfirmButton
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onConfirm={() => remove(detail.uuid)}
            disabled={deleting}
            confirmLabel="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </ConfirmButton>
        </>
      )}
    </div>
  )
}

interface AddDetailRowProps {
  periodizationUuid: string
  nextOrder: number
}

export function AddPeriodizationDetailRow({ periodizationUuid, nextOrder }: AddDetailRowProps) {
  const [open, setOpen] = useState(false)
  const { mutateAsync: upsert, isPending } = useUpsertPeriodizationDetail()

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { min_repetitions: 8, max_repetitions: 12 },
  })

  async function onSubmit(values: FormValues) {
    await upsert({
      periodization_uuid: periodizationUuid,
      order: nextOrder,
      min_repetitions: values.min_repetitions,
      max_repetitions: values.max_repetitions,
    })
    reset({ min_repetitions: 8, max_repetitions: 12 })
    setOpen(false)
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground w-full justify-start mt-1"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar semana
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 py-2">
      <span className="w-6 text-xs text-muted-foreground text-center shrink-0">{nextOrder}</span>
      <div className="flex items-center gap-1.5">
        <Input
          {...register("min_repetitions")}
          type="number"
          className="h-7 w-16 text-center text-sm"
        />
        <span className="text-muted-foreground text-xs">–</span>
        <Input
          {...register("max_repetitions")}
          type="number"
          className="h-7 w-16 text-center text-sm"
        />
        <span className="text-xs text-muted-foreground">reps</span>
      </div>
      <Button type="submit" size="icon" variant="ghost" className="h-7 w-7" disabled={isPending}>
        <Check className="h-3.5 w-3.5 text-green-600" />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </form>
  )
}
