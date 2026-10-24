"""LangGraph agent backing the offboarding_checklist_builder activity.

Read-only: reads the exit event and the tenant's `TenantComplianceConfig`
(offboarding policy: access/systems to revoke, exit interview and
final-settlement steps) to draft a per-tenant-customized checklist. Runs
entirely inside the owning Temporal activity - never invoked directly by a
workflow, and never performs a write of its own.
"""

from __future__ import annotations

from langgraph.graph import StateGraph


def build_graph() -> StateGraph:
    """Construct the (currently empty) offboarding-checklist LangGraph graph."""
    raise NotImplementedError
