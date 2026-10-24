"""LangGraph agent backing the obligation_checklist_generator activity.

Read-only: reads the crossed-threshold fact and drafts a checklist. Runs
entirely inside the owning Temporal activity - never invoked directly by a
workflow, and never performs a write of its own.
"""

from __future__ import annotations

from langgraph.graph import StateGraph


def build_graph() -> StateGraph:
    """Construct the (currently empty) obligation-checklist LangGraph graph."""
    raise NotImplementedError
