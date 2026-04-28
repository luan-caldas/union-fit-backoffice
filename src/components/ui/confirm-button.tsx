"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConfirmButtonProps extends Omit<ButtonProps, "onClick"> {
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export function ConfirmButton({
  onConfirm,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  children,
  className,
  disabled,
  ...props
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="h-7 px-2 text-xs"
          onClick={() => { setConfirming(false); onConfirm() }}
        >
          {confirmLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={() => setConfirming(false)}
        >
          {cancelLabel}
        </Button>
      </span>
    )
  }

  return (
    <Button
      type="button"
      className={cn(className)}
      disabled={disabled}
      onClick={() => setConfirming(true)}
      {...props}
    >
      {children}
    </Button>
  )
}
