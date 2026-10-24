import pytest

from daydor.agents.payroll_compliance.filing_preparation_agent import build_graph


def test_not_implemented():
    with pytest.raises(NotImplementedError):
        build_graph()
