import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/daydor/Button'
import { Icon } from '@/components/daydor/Icon'

export interface DialogProps {
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  onClose?: () => void
  onConfirm?: () => void
  confirmLabel?: string
  /** One sentence on what cannot be undone; renders the lock strip and role="alertdialog". */
  irreversible?: React.ReactNode
}

export function Dialog({
  title,
  description,
  children,
  open,
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  irreversible,
}: DialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        {children}
        {irreversible && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-irreversible-soft px-3 py-2.5 text-small text-irreversible">
            <Icon name="lock" size={14} className="mt-0.5" />
            <span>{irreversible}</span>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button variant="ghost">Not yet</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="primary" icon={irreversible ? 'lock' : undefined} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
