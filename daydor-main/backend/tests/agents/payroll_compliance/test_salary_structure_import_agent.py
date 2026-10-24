import pytest

from daydor.agents.payroll_compliance.salary_structure_import_agent import build_graph


def test_not_implemented():
    with pytest.raises(NotImplementedError):
        build_graph()
