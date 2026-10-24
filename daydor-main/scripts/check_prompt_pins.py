#!/usr/bin/env python3
"""CI staleness tripwire for agent-tier worker prompts.

Every agent-tier worker pins its prompt text (`prompt.md` + `prompt.hash`,
see `daydor.agents.prompt_pinning`) alongside a `golden_eval_set.json`. This
script fails the build on two kinds of drift, checked against the diff
between this branch and its merge base with the default branch:

1. A changed `prompt.md` whose `prompt.hash` was not re-pinned to match -
   the pin itself is stale.
2. A changed `prompt.md` whose sibling `golden_eval_set.json` was not
   touched in the same diff - the prompt changed without the golden eval
   set being revisited, the exact staleness this check exists to catch.

Usage: python scripts/check_prompt_pins.py [--base-ref origin/main]
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend" / "src"))

from daydor.agents.prompt_pinning import PromptPinMismatch, verify_prompt_pin  # noqa: E402


def changed_files(base_ref: str) -> set[str]:
    result = subprocess.run(
        ["git", "diff", "--name-only", f"{base_ref}...HEAD"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return {line.strip() for line in result.stdout.splitlines() if line.strip()}


def discover_prompt_dirs() -> list[Path]:
    return sorted({p.parent for p in REPO_ROOT.glob("backend/src/daydor/agents/**/prompt.md")})


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-ref", default="origin/main")
    args = parser.parse_args()

    diff = changed_files(args.base_ref)
    errors: list[str] = []

    for prompt_dir in discover_prompt_dirs():
        rel_dir = prompt_dir.relative_to(REPO_ROOT)
        prompt_path = str(rel_dir / "prompt.md")
        hash_path = str(rel_dir / "prompt.hash")
        eval_path = str(rel_dir / "golden_eval_set.json")

        try:
            verify_prompt_pin(prompt_dir)
        except PromptPinMismatch as e:
            errors.append(str(e))
            continue
        except FileNotFoundError as e:
            errors.append(f"{rel_dir}: {e}")
            continue

        prompt_changed = prompt_path in diff
        hash_changed = hash_path in diff
        eval_changed = eval_path in diff

        if prompt_changed and not hash_changed:
            errors.append(
                f"{prompt_path} changed but {hash_path} was not re-pinned in this diff."
            )
        if prompt_changed and not eval_changed:
            errors.append(
                f"{prompt_path} changed but {eval_path} was not revisited in this diff - "
                "staleness tripwire: review the golden eval set against the prompt change."
            )

    if errors:
        print("Prompt-pinning staleness check failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(f"Prompt-pinning staleness check passed for {len(discover_prompt_dirs())} worker(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
