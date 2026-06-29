#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

from tts_benchmark_lib import collect_environment, repo_root_from_script, write_yaml


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Capture TTS benchmark environment metadata.")
    parser.add_argument("--output", default="experiments/environment.yaml")
    parser.add_argument("--json", action="store_true", help="Write JSON instead of the default YAML-like text.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    repo_root = repo_root_from_script(Path(__file__))
    output = repo_root / args.output
    data = collect_environment(repo_root)
    output.parent.mkdir(parents=True, exist_ok=True)
    if args.json:
        output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    else:
        write_yaml(output, data)
    print(f"wrote environment metadata to {output.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
