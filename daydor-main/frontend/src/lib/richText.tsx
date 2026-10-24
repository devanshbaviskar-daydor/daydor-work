import * as React from 'react'

/**
 * Minimal **bold** span parser for message/brief copy coming from the data
 * layer as plain strings (API-safe) while still letting Daydor's voice bold
 * the one figure or phrase a reader must not miss.
 */
export function renderEmphasis(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/)
    if (match) return <strong key={i} className="font-medium text-ink">{match[1]}</strong>
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}
