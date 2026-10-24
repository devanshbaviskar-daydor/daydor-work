import * as React from 'react'

import { cn } from '@/lib/utils'
import { Icon } from '@/components/daydor/Icon'

export interface ComposerProps {
  onSend?: (text: string) => void
  value?: string
  defaultValue?: string
  onChange?: (text: string) => void
  placeholder?: string
  scope?: React.ReactNode
  suggestions?: string[]
  busy?: boolean
  footnote?: React.ReactNode
  /** The paperclip is shown only when there is something to attach to. */
  onAttach?: () => void
}

export function Composer({
  onSend,
  value,
  defaultValue,
  onChange,
  placeholder = 'Ask Daydor or tell it what to do…',
  scope,
  suggestions,
  busy,
  footnote,
  onAttach,
}: ComposerProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '')
  const text = isControlled ? value : internalValue
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const setText = (next: string) => {
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  React.useEffect(resize, [text])

  const send = () => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    onSend?.(trimmed)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="mx-auto flex max-w-conversation flex-col gap-3">
      {suggestions && suggestions.length > 0 && !text && (
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 4).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setText(s)
                textareaRef.current?.focus()
              }}
              className="rounded-sm border border-line bg-surface px-3 py-1.5 text-label text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-line-strong bg-surface px-4 py-3 pr-3 shadow-sm transition-[box-shadow,border-color] duration-150 focus-within:border-focus focus-within:shadow-md">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block min-h-6 w-full resize-none border-0 bg-transparent text-reading text-ink outline-none placeholder:text-ink-muted"
        />
        <div className="-mx-2 -mb-1 mt-2 flex items-center gap-1">
          {onAttach && (
            <button
              type="button"
              aria-label="Attach"
              onClick={onAttach}
              className="flex h-control-sm w-control-sm items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              <Icon name="paperclip" size={16} />
            </button>
          )}
          {scope && (
            <span className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-small text-ink-muted">
              {scope}
            </span>
          )}
          <span className="flex-1" />
          <button
            type="button"
            onClick={send}
            disabled={!text.trim() || busy}
            aria-label="Send"
            className={cn(
              'flex h-control-sm w-control-sm items-center justify-center rounded-full bg-ink text-on-ink transition-opacity disabled:opacity-45',
            )}
          >
            <Icon name={busy ? 'loader' : 'arrowUp'} size={16} className={busy ? 'animate-spin' : undefined} />
          </button>
        </div>
      </div>

      {footnote && <p className="m-0 text-center text-[12px] leading-4 text-ink-muted">{footnote}</p>}
    </div>
  )
}
