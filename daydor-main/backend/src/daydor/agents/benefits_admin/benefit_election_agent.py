"""LangGraph agent backing the benefit_election_drafter activity.

Read-only: reads an ops-mediated enrollment/dependent-addition request and
the employee's eligible `BenefitPlan`(s) to draft a structured
`BenefitElection`. Runs entirely inside the owning Temporal activity - never
invoked directly by a workflow, and never performs a write of its own.
"""

from __future__ import annotations

from langgraph.graph import StateGraph


def build_graph() -> StateGraph:
    """Construct the (currently empty) benefit-election-drafter LangGraph graph."""
    raise NotImplementedError
