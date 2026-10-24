export interface ComingSoonProps {
  title: string
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex h-screen flex-1 items-center justify-center bg-canvas text-body text-ink-muted">
      {title} coming soon
    </div>
  )
}
