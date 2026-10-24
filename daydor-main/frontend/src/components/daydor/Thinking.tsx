export interface ThinkingProps {
  label?: React.ReactNode
  steps?: React.ReactNode[]
}

export function Thinking({ label, steps }: ThinkingProps) {
  const lastStep = steps && steps.length > 0 ? steps[steps.length - 1] : undefined

  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="mt-[7px] ml-[10px] h-2 w-2 shrink-0 rounded-full bg-brand motion-safe:animate-[dd-pulse_1.6s_ease-out_infinite]" />
      <div className="min-w-0 flex-1 space-y-0.5 pt-[5px]">
        <p className="dd-shimmer-text m-0 text-[15px] font-medium leading-[22px]">{label}</p>
        {lastStep && (
          <p className="m-0 mt-0.5 text-small text-ink-muted">
            {lastStep}
            {steps && steps.length > 1 && (
              <span className="opacity-80"> · step {steps.length}</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
