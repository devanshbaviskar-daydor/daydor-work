"""LangGraph agent backing the salary_structure_import activity.

Read-only: reads an uploaded salary-structure spreadsheet and drafts
structured EmploymentRecord fields. Runs entirely inside the owning
Temporal activity - never invoked directly by a workflow, and never
performs a write of its own.
"""

from __future__ import annotations

from langgraph.graph import StateGraph


def build_graph() -> StateGraph:
    """Construct the (currently empty) salary-structure-import LangGraph graph."""
    raise NotImplementedError
