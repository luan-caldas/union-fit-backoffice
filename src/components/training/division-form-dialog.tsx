"use client"

import { useState } from "react"
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

export type DivisionFormValues = {
  name: string
  description: string
  duration: number
}

interface DivisionFormDialogProps {
  open: boolean
  onClose: () => void
  title: string
  initialValues: { name: string; description: string; duration: string }
  isPending: boolean
  onSubmit: (values: DivisionFormValues) => void
}

export function DivisionFormDialog(props: DivisionFormDialogProps) {
  // Remonta o formulário a cada abertura para resetar o estado local.
  if (!props.open) return null
  return <DivisionFormDialogContent {...props} />
}

function DivisionFormDialogContent({
  open,
  onClose,
  title,
  initialValues,
  isPending,
  onSubmit,
}: DivisionFormDialogProps) {
  const [name, setName] = useState(initialValues.name)
  const [description, setDescription] = useState(initialValues.description)
  const [duration, setDuration] = useState(initialValues.duration)
  const [errors, setErrors] = useState<{ name?: string; duration?: string }>({})

  function handleSubmit() {
    const next: { name?: string; duration?: string } = {}
    const parsedDuration = Number(duration)
    if (!name.trim()) next.name = "Nome obrigatório"
    if (!duration || !Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      next.duration = "Informe a duração em minutos (número inteiro maior que 0)"
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      duration: parsedDuration,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Treino A" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Peito + Tríceps"
            />
          </div>
          <div className="space-y-1">
            <Label>Duração (min) *</Label>
            <Input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
            />
            {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
