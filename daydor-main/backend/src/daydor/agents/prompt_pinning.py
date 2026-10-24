"""Prompt-pinning convention shared by every agent-tier worker.

Each worker's prompt text lives in a `prompt.md` file next to its
`*_agent.py`, with a sibling `prompt.hash` holding the SHA-256 content hash
of that exact `prompt.md`. `verify_prompt_pin` is what a worker's agent
module calls at import/build time to fail loudly if the two drift apart -
the same hash this module computes is what `scripts/check_prompt_pins.py`
checks against each pinned worker's `golden_eval_set.json` in CI.
"""

from __future__ import annotations

import hashlib
from pathlib import Path


class PromptPinMismatch(Exception):
    """Raised when a prompt.md's content hash no longer matches its pinned
    prompt.hash - the prompt changed without repinning."""


def compute_prompt_hash(prompt_text: str) -> str:
    """SHA-256 hex digest of a prompt's exact text, the pin stored in
    `prompt.hash` alongside it."""
    return hashlib.sha256(prompt_text.encode("utf-8")).hexdigest()


def verify_prompt_pin(prompt_dir: Path) -> str:
    """Verify `prompt_dir/prompt.md` matches `prompt_dir/prompt.hash`.

    Returns the verified hash. Raises `PromptPinMismatch` if the prompt
    text was edited without updating its pin, and `FileNotFoundError` if
    either file is missing.
    """
    prompt_text = (prompt_dir / "prompt.md").read_text(encoding="utf-8")
    pinned_hash = (prompt_dir / "prompt.hash").read_text(encoding="utf-8").strip()
    actual_hash = compute_prompt_hash(prompt_text)
    if actual_hash != pinned_hash:
        raise PromptPinMismatch(
            f"{prompt_dir}/prompt.md content hash {actual_hash} does not match "
            f"pinned {pinned_hash} in {prompt_dir}/prompt.hash - "
            "re-pin after reviewing prompt.golden_eval_set.json against the change."
        )
    return actual_hash
