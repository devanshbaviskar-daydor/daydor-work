"""LangGraph agent backing the filing_preparation activity.

Read-only: reads computed period contributions and drafts a filing payload.
Runs entirely inside the owning Temporal activity - never invoked directly
by a workflow, and never performs a write of its own.
"""

from __future__ import annotations

from langgraph.graph import StateGraph


def build_graph() -> StateGraph:
    """Construct the (currently empty) filing-preparation LangGraph graph."""
    raise NotImplementedError
