"use client"

import { useMemo, useState } from "react"
import Fuse from "fuse.js"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import type { MethodRow } from "@/actions/methods.actions"

interface MethodPickerDialogProps {
  open: boolean
  onClose: () => void
  methods: MethodRow[]
  onSelect: (method: MethodRow | null) => void
  currentMethodUuid?: string | null
}

export function MethodPickerDialog({
  open,
  onClose,
  methods,
  onSelect,
  currentMethodUuid,
}: MethodPickerDialogProps) {
  const [search, setSearch] = useState("")

  const fuse = useMemo(
    () =>
      new Fuse(methods, {
        keys: ["name", "description", "uuid"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [methods]
  )

  const filtered = useMemo(
    () => (search ? fuse.search(search).map((r) => r.item) : methods),
    [search, methods, fuse]
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[70vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Selecionar Método</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar método..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-border">
          {currentMethodUuid && (
            <button
              type="button"
              onClick={() => { onSelect(null); onClose() }}
              className="flex w-full items-center gap-2 px-6 py-3 text-sm text-destructive hover:bg-destructive/5 border-b border-border"
            >
              <X className="h-4 w-4" />
              Remover método
            </button>
          )}
          {filtered.map((method) => (
            <button
              key={method.uuid}
              type="button"
              onClick={() => { onSelect(method); onClose() }}
              className="flex w-full flex-col items-start px-6 py-3 text-left hover:bg-surface-low border-b border-border last:border-0"
            >
              <p className="font-medium text-sm">{method.name}</p>
              {method.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {method.description}
                </p>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum método encontrado
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
