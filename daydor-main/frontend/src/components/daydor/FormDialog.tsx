import * as React from 'react'

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/daydor/Button'

export interface FormDialogProps {
  open: boolean
  title: React.ReactNode
  description?: React.ReactNode
  submitLabel: string
  onClose: () => void
  /** Called with the form submitted; resolves true to close the dialog, false to keep it open (the person's input stays). */
  onSubmit: () => Promise<boolean> | boolean
  /** Disables Submit with the reason shown under the form. */
  invalid?: string | null
  busy?: boolean
  children: React.ReactNode
}

/** A dialog that stays open while it works and when the action fails, so what was typed is not lost. */
export function FormDialog({ open, title, description, submitLabel, onClose, onSubmit, invalid, busy, children }: FormDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (invalid || busy) return
            if (await onSubmit()) onClose()
          }}
        >
          {children}
          {invalid && <p className="m-0 text-[12px] text-ink-muted">{invalid}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!!invalid} loading={busy}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
