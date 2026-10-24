import pytest

from daydor.agents.offboarding.offboarding_checklist_agent import build_graph


def test_not_implemented():
    with pytest.raises(NotImplementedError):
        build_graph()
