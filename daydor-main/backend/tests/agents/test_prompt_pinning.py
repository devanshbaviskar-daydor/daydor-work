from pathlib import Path

import pytest

from daydor.agents.prompt_pinning import PromptPinMismatch, compute_prompt_hash, verify_prompt_pin

AGENT_WORKER_DIRS = [
    "headcount_threshold",
    "offboarding",
    "onboarding",
    "payroll_compliance",
]


@pytest.mark.parametrize("worker_dir", AGENT_WORKER_DIRS)
def test_every_agent_tier_worker_prompt_is_pinned(worker_dir: str):
    prompt_dir = Path(__file__).parent.parent.parent / "src" / "daydor" / "agents" / worker_dir
    assert (prompt_dir / "prompt.md").exists()
    assert (prompt_dir / "prompt.hash").exists()
    assert (prompt_dir / "golden_eval_set.json").exists()
    verify_prompt_pin(prompt_dir)


def test_verify_prompt_pin_raises_on_drift(tmp_path):
    (tmp_path / "prompt.md").write_text("original prompt text\n", encoding="utf-8")
    (tmp_path / "prompt.hash").write_text(compute_prompt_hash("original prompt text\n") + "\n", encoding="utf-8")
    verify_prompt_pin(tmp_path)

    (tmp_path / "prompt.md").write_text("edited prompt text\n", encoding="utf-8")
    with pytest.raises(PromptPinMismatch):
        verify_prompt_pin(tmp_path)


def test_verify_prompt_pin_missing_files_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        verify_prompt_pin(tmp_path)
