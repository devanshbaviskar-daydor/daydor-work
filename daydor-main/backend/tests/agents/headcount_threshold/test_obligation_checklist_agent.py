import pytest

from daydor.agents.headcount_threshold.obligation_checklist_agent import build_graph


def test_not_implemented():
    with pytest.raises(NotImplementedError):
        build_graph()
