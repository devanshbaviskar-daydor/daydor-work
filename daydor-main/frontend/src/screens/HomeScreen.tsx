import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { HomeSource } from '@/data/homeSource'
import type { ConversationTurn, Decision, TurnAction } from '@/types/home'
import { renderEmphasis } from '@/lib/richText'
import { useNotify } from '@/lib/notify'
import { useAction } from '@/lib/useAction'
import { useLoad } from '@/lib/useLoad'
import { useSession } from '@/session/SessionContext'
import { AppSidebar } from '@/components/daydor/AppSidebar'
import { Brief } from '@/components/daydor/Brief'
import { Button } from '@/components/daydor/Button'
import { Composer } from '@/components/daydor/Composer'
import { DecisionCard } from '@/components/daydor/DecisionCard'
import { Message } from '@/components/daydor/Message'
import { RunRow } from '@/components/daydor/RunRow'
import { ScreenState } from '@/components/daydor/ScreenState'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Thinking } from '@/components/daydor/Thinking'

export interface HomeScreenProps {
  source: HomeSource
}

function TurnActionView({ action, onOpen, onConfirm, onDismiss, busy }: {
  action: TurnAction
  onOpen: (path: string) => void
  onConfirm: () => void
  onDismiss: () => void
  busy: boolean
}) {
  if (action.kind === 'open') {
    return (
      <div>
        <Button variant="secondary" size="sm" iconRight="chevronRight" onClick={() => onOpen(action.path)}>
          {action.label}
        </Button>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3">
      <p className="m-0 text-small text-ink">{action.command.summary}</p>
      <p className="m-0 text-[12px] text-ink-muted">Daydor has not done this. It happens only if you confirm.</p>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" loading={busy} onClick={onConfirm}>
          Confirm
        </Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={onDismiss}>
          Not now
        </Button>
      </div>
    </div>
  )
}

export function HomeScreen({ source }: HomeScreenProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, canDecide } = useSession()
  const load = useLoad(() => source.getHome(), [source])
  const { run, isBusy } = useAction(load.reload)
  const [turns, setTurns] = React.useState<ConversationTurn[] | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set())
  const [sending, setSending] = React.useState(false)
  const { fail } = useNotify()

  const home = load.data
  const send = React.useCallback(
    async (text: string, aboutEmployeeId?: string) => {
      setSending(true)
      try {
        setTurns(await source.sendMessage(text, aboutEmployeeId))
      } catch (e) {
        fail(e)
      } finally {
        setSending(false)
      }
    },
    [source, fail],
  )

  // "Ask about <person>" on a person's page lands here with the question already asked.
  const ask = (location.state as { ask?: { id: string; name: string } } | null)?.ask
  const asked = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (!ask || !home || asked.current === ask.id) return
    asked.current = ask.id
    navigate('.', { replace: true, state: null })
    void send(`Tell me about ${ask.name}`, ask.id)
  }, [ask, home, navigate, send])

  if (!home) return <ScreenState error={load.error} onRetry={load.reload} />

  const decisions: Decision[] = home.needsYou
  const selected = decisions.find((d) => d.id === selectedId) ?? decisions[0]
  const mayDecide = (d: Decision) => (d.canDecide !== undefined ? d.canDecide : canDecide(d.gate))
  const reasonFor = (d: Decision) => d.cannotDecideReason ?? 'Your role cannot decide this.'

  return (
    <div className="grid h-screen grid-cols-[232px_1fr] bg-canvas">
      <AppSidebar needsYouCount={decisions.length} />

      <div className="grid min-h-0 grid-cols-[1fr_var(--rail-width)]">
        <main className="flex min-h-0 flex-col">
          <ScrollArea className="flex-1 [mask-image:linear-gradient(to_bottom,#000_calc(100%-32px),transparent)]">
            <div className="mx-auto flex max-w-conversation flex-col gap-6 px-8 py-6">
              <Brief
                date={home.brief.date}
                greeting={home.brief.greeting}
                summary={renderEmphasis(home.brief.summary)}
                stats={home.brief.stats}
              />

              {selected && (
                <DecisionCard
                  key={selected.id}
                  {...selected}
                  canDecide={mayDecide(selected)}
                  cannotDecideReason={reasonFor(selected)}
                  busy={isBusy(`decide:${selected.id}`)}
                  onApprove={() => void run(`decide:${selected.id}`, () => source.resolveApproval(selected.id, 'approved'), { success: 'Approved' })}
                  onDecline={(note) => void run(`decide:${selected.id}`, () => source.resolveApproval(selected.id, 'rejected', note), { success: 'Declined' })}
                />
              )}

              <div className="flex items-center gap-3 text-[12px] text-ink-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
                Today
              </div>

              {(turns ?? home.conversation).map((turn) =>
                turn.kind === 'message' ? (
                  <Message key={turn.id} from={turn.from} domain={turn.domain} time={turn.time}>
                    {renderEmphasis(turn.text)}
                    {turn.action && !dismissed.has(turn.id) && (
                      <TurnActionView
                        action={turn.action}
                        onOpen={(path) => navigate(path)}
                        busy={turn.action.kind === 'command' && isBusy(`cmd:${turn.id}`)}
                        onDismiss={() => setDismissed((s) => new Set(s).add(turn.id))}
                        onConfirm={() => {
                          const a = turn.action
                          if (a?.kind !== 'command') return
                          void run(`cmd:${turn.id}`, () => source.runCommand(a.command), { success: 'Done' }).then((ok) => {
                            if (ok) setDismissed((s) => new Set(s).add(turn.id))
                          })
                        }}
                      />
                    )}
                  </Message>
                ) : (
                  <Thinking key={turn.id} label={turn.label} steps={turn.steps} />
                ),
              )}
              {(turns ?? home.conversation).length === 0 && (
                <p className="m-0 text-small text-ink-muted">
                  Nothing yet today. Ask about a colleague, what is waiting for you, or where to do something.
                </p>
              )}
            </div>
          </ScrollArea>

          <div className="bg-canvas px-8 pb-5 pt-4">
            <Composer
              scope={`Answers from your screens · ${session.role_label}`}
              busy={sending}
              onSend={(t) => void send(t)}
              footnote="Daydor asks before anything irreversible — money, filings or access."
            />
          </div>
        </main>

        <aside
          aria-label="Decisions and activity"
          className="flex flex-col gap-6 overflow-hidden border-l border-line bg-surface px-3 py-5"
        >
          <section>
            <h2 className="mb-1.5 flex items-center justify-between px-3 text-eyebrow text-ink-muted">
              <span>Needs you</span>
              <span className="tabular-nums">{decisions.length}</span>
            </h2>
            <div className="flex flex-col gap-1">
              {decisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  compact
                  selected={decision.id === selected?.id}
                  domain={decision.domain}
                  title={decision.title}
                  writeClass={decision.writeClass}
                  deadline={decision.deadline}
                  onOpen={() => setSelectedId(decision.id)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-1.5 flex items-center justify-between px-3 text-eyebrow text-ink-muted">
              <span>Running now</span>
              <span className="tabular-nums">{home.runningNow.length}</span>
            </h2>
            <div className="flex flex-col pl-0.5">
              {home.runningNow.map((r) => (
                <RunRow key={r.id} state={r.state} title={r.title} domain={r.domain} meta={r.meta} progress={r.progress} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-1.5 flex items-center justify-between px-3 text-eyebrow text-ink-muted">
              <span>Done today</span>
              <span className="tabular-nums">{home.doneToday.length + (home.doneTodayMoreCount ?? 0)}</span>
            </h2>
            <div className="flex flex-col pl-0.5">
              {home.doneToday.map((r) => (
                <RunRow key={r.id} state={r.state} title={r.title} domain={r.domain} meta={r.meta} />
              ))}
              {home.doneTodayMoreCount ? (
                <div className="px-3 py-1.5 text-small text-ink-muted">{home.doneTodayMoreCount} more</div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
