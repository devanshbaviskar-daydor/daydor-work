import { cn } from '@/lib/utils'

export interface SimulatedProps {
  /** What is simulated, for the tooltip: "The bank is simulated: no money moved." */
  why?: string
  className?: string
}

/** A small neutral label for a state that comes from a stand-in (bank, tax portal, carrier, ledger, job board) rather than the real thing. */
export function Simulated({ why = 'This step is simulated: nothing was sent to the outside party.', className }: SimulatedProps) {
  return (
    <span
      title={why}
      className={cn('inline-flex items-center rounded-sm border border-line px-1.5 py-px align-middle text-[11px] font-medium uppercase tracking-wide text-ink-muted', className)}
    >
      simulated
    </span>
  )
}
