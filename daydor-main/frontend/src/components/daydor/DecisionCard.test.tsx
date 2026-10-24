import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DecisionCard } from '@/components/daydor/DecisionCard'

describe('DecisionCard', () => {
  it('leaves the buttons out and says why when the role cannot decide', () => {
    render(<DecisionCard title="Approve leave" canDecide={false} cannotDecideReason="Only a manager can decide this." onApprove={() => {}} onDecline={() => {}} />)
    expect(screen.getByText('Only a manager can decide this.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Decline' })).toBeNull()
  })

  it('shows Approve only when there is something to do on click', () => {
    render(<DecisionCard title="Approve leave" onDecline={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument()
  })

  it('asks for confirmation before declining and passes the note', async () => {
    const onDecline = vi.fn()
    const user = userEvent.setup()
    render(<DecisionCard title="Approve leave" onApprove={() => {}} onDecline={onDecline} />)
    await user.click(screen.getByRole('button', { name: 'Decline' }))
    expect(onDecline).not.toHaveBeenCalled()
    await user.type(screen.getByRole('textbox'), 'Not this week')
    await user.click(screen.getAllByRole('button', { name: 'Decline' }).at(-1)!)
    expect(onDecline).toHaveBeenCalledWith('Not this week')
  })

  it('declines with no note when none is given', async () => {
    const onDecline = vi.fn()
    const user = userEvent.setup()
    render(<DecisionCard title="Approve leave" onDecline={onDecline} />)
    await user.click(screen.getByRole('button', { name: 'Decline' }))
    await user.click(screen.getAllByRole('button', { name: 'Decline' }).at(-1)!)
    expect(onDecline).toHaveBeenCalledWith(undefined)
  })

  it('hides Delegate without a handler and never lets the second button decline', async () => {
    const onReview = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(<DecisionCard title="T" onApprove={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Delegate' })).toBeNull()
    rerender(<DecisionCard title="T" onApprove={() => {}} onDelegate={() => {}} onReview={onReview} reviewLabel="Counter offer" />)
    expect(screen.getByRole('button', { name: 'Delegate' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Counter offer' }))
    expect(onReview).toHaveBeenCalled()
  })

  it('asks again before an irreversible approval', async () => {
    const onApprove = vi.fn()
    const user = userEvent.setup()
    render(<DecisionCard title="Pay everyone" writeClass="irreversible" onApprove={onApprove} />)
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(onApprove).not.toHaveBeenCalled()
    await user.click(screen.getAllByRole('button', { name: 'Approve' }).at(-1)!)
    expect(onApprove).toHaveBeenCalledTimes(1)
  })
})
