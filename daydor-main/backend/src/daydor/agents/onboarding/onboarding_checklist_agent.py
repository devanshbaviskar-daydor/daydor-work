"""LangGraph agent backing the onboarding_checklist_generator activity.

Read-only: reads the new employee record and the tenant's
`TenantComplianceConfig` (onboarding policy: documents collected, benefits
offered, induction steps) to draft a per-tenant-customized checklist. Runs
entirely inside the owning Temporal activity - never invoked directly by a
workflow, and never performs a write of its own.
"""

from __future__ import annotations

from langgraph.graph import StateGraph


def build_graph() -> StateGraph:
    """Construct the (currently empty) onboarding-checklist LangGraph graph."""
    raise NotImplementedError
