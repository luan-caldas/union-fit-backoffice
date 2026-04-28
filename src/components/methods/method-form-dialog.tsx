"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useUpsertMethod, useDeleteMethod } from "@/hooks/use-methods"
import { useLevels, useObjectives } from "@/hooks/use-exercises"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import type { MethodRow } from "@/actions/methods.actions"
import { Trash2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  video_url: z.string().optional(),
  level_uuid: z.array(z.string()),
  objective_uuid: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

interface MethodFormDialogProps {
  open: boolean
  onClose: () => void
  method?: MethodRow | null
}

export function MethodFormDialog({ open, onClose, method }: MethodFormDialogProps) {
  const { data: levels = [] } = useLevels()
  const { data: objectives = [] } = useObjectives()
  const { mutateAsync, isPending } = useUpsertMethod()
  const { mutateAsync: deleteMethod, isPending: isDeleting } = useDeleteMethod()
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      video_url: "",
      level_uuid: [],
      objective_uuid: [],
    },
  })

  const videoUrl = watch("video_url")
  const selectedLevels = watch("level_uuid")
  const selectedObjectives = watch("objective_uuid")

  useEffect(() => {
    setThumbnailPreview(videoUrl ? getYouTubeThumbnail(videoUrl) : null)
  }, [videoUrl])

  useEffect(() => {
    if (open && method) {
      reset({
        name: method.name,
        description: method.description ?? "",
        video_url: method.video_url ?? "",
        level_uuid: method.level_uuid ?? [],
        objective_uuid: method.objective_uuid ?? [],
      })
    } else if (open && !method) {
      reset({ name: "", description: "", video_url: "", level_uuid: [], objective_uuid: [] })
    }
  }, [open, method, reset])

  async function handleDelete() {
    if (!method) return
    await deleteMethod(method.uuid)
    onClose()
  }

  async function onSubmit(values: FormValues) {
    await mutateAsync({
      uuid: method?.uuid,
      name: values.name,
      description: values.description || null,
      video_url: values.video_url || null,
      level_uuid: values.level_uuid,
      objective_uuid: values.objective_uuid,
    })
    onClose()
  }

  function toggleLevel(uuid: string) {
    const curr = selectedLevels
    setValue("level_uuid", curr.includes(uuid) ? curr.filter((id) => id !== uuid) : [...curr, uuid])
  }

  function toggleObjective(uuid: string) {
    const curr = selectedObjectives
    setValue("objective_uuid", curr.includes(uuid) ? curr.filter((id) => id !== uuid) : [...curr, uuid])
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{method ? "Editar Método" : "Novo Método"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Nome *</Label>
            <Input {...register("name")} placeholder="Ex: Drop-set" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea {...register("description")} placeholder="Descrição do método..." rows={2} />
          </div>

          <div className="space-y-1">
            <Label>Níveis</Label>
            <div className="flex flex-wrap gap-1.5">
              {levels.map((level) => (
                <Badge
                  key={level.uuid}
                  variant={selectedLevels.includes(level.uuid) ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => toggleLevel(level.uuid)}
                >
                  {level.title}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Objetivos</Label>
            <div className="flex flex-wrap gap-1.5">
              {objectives.map((obj) => (
                <Badge
                  key={obj.uuid}
                  variant={selectedObjectives.includes(obj.uuid) ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => toggleObjective(obj.uuid)}
                >
                  {obj.title}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>URL do vídeo (YouTube)</Label>
            <Input
              {...register("video_url")}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {thumbnailPreview && (
              <div className="mt-2 h-24 w-40 overflow-hidden rounded-md border border-border">
                <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <DialogFooter className="flex-row items-center">
            {method && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                {isDeleting ? "Excluindo..." : "Excluir"}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
