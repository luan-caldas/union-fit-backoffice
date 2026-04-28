"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useUpsertExercise, useLevels } from "@/hooks/use-exercises"
import { useMethods } from "@/hooks/use-methods"
import { MUSCLE_OPTIONS } from "@/lib/constants/muscles"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import type { ExerciseRow } from "@/actions/exercises.actions"
import type { Database } from "@/lib/supabase/database.types"
import { X } from "lucide-react"

type Muscle = Database["public"]["Enums"]["Muscle"]
type RepetitionType = Database["public"]["Enums"]["RepetitionType"]

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  muscle: z.string().min(1, "Músculo obrigatório"),
  repetition_type: z.enum(["PERIODIZATION", "ISOMETRIC"]),
  level_uuid: z.array(z.string()),
  methods_support_uuid: z.array(z.string()),
  video_url: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ExerciseFormDialogProps {
  open: boolean
  onClose: () => void
  exercise?: ExerciseRow | null
}

export function ExerciseFormDialog({
  open,
  onClose,
  exercise,
}: ExerciseFormDialogProps) {
  const { data: levels = [] } = useLevels()
  const { data: methods = [] } = useMethods()
  const { mutateAsync, isPending } = useUpsertExercise()
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      muscle: "",
      repetition_type: "PERIODIZATION",
      level_uuid: [],
      methods_support_uuid: [],
      video_url: "",
    },
  })

  const videoUrl = watch("video_url")
  const selectedLevels = watch("level_uuid")
  const selectedMethods = watch("methods_support_uuid")

  useEffect(() => {
    if (videoUrl) {
      setThumbnailPreview(getYouTubeThumbnail(videoUrl))
    } else {
      setThumbnailPreview(null)
    }
  }, [videoUrl])

  useEffect(() => {
    if (open && exercise) {
      reset({
        name: exercise.name,
        description: exercise.description ?? "",
        muscle: exercise.muscle,
        repetition_type: exercise.repetition_type,
        level_uuid: exercise.level_uuid ?? [],
        methods_support_uuid: exercise.methods_support_uuid ?? [],
        video_url: exercise.video_url ?? "",
      })
    } else if (open && !exercise) {
      reset({
        name: "",
        description: "",
        muscle: "",
        repetition_type: "PERIODIZATION",
        level_uuid: [],
        methods_support_uuid: [],
        video_url: "",
      })
    }
  }, [open, exercise, reset])

  async function onSubmit(values: FormValues) {
    await mutateAsync({
      uuid: exercise?.uuid,
      name: values.name,
      description: values.description || null,
      muscle: values.muscle as Muscle,
      repetition_type: values.repetition_type as RepetitionType,
      level_uuid: values.level_uuid,
      methods_support_uuid: values.methods_support_uuid,
      video_url: values.video_url || null,
    })
    onClose()
  }

  function toggleLevel(uuid: string) {
    const current = selectedLevels
    setValue(
      "level_uuid",
      current.includes(uuid) ? current.filter((id) => id !== uuid) : [...current, uuid]
    )
  }

  function toggleMethod(uuid: string) {
    const current = selectedMethods
    setValue(
      "methods_support_uuid",
      current.includes(uuid) ? current.filter((id) => id !== uuid) : [...current, uuid]
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{exercise ? "Editar Exercício" : "Novo Exercício"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Nome *</Label>
            <Input {...register("name")} placeholder="Ex: Supino reto - Barra" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea {...register("description")} placeholder="Descrição do exercício..." rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Músculo *</Label>
              <Controller
                name="muscle"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSCLE_OPTIONS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.muscle && <p className="text-xs text-destructive">{errors.muscle.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Tipo de repetição</Label>
              <Controller
                name="repetition_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERIODIZATION">Periodização</SelectItem>
                      <SelectItem value="ISOMETRIC">Isométrico</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
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
            <Label>Métodos suportados</Label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {methods.map((method) => (
                <Badge
                  key={method.uuid}
                  variant={selectedMethods.includes(method.uuid) ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => toggleMethod(method.uuid)}
                >
                  {method.name}
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
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <DialogFooter>
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
