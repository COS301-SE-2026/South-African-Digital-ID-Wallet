#!/usr/bin/env python3
"""
Regenerates docs/demo3/openapi.yaml from a running instance of the backend.

Usage:
    python export_openapi.py [--url URL] [--output PATH]

Requires: Python 3 with pip, and the backend running locally (Development
environment, so Swagger is enabled).
"""

import argparse
import json
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_URL = "http://localhost:5118/swagger/v1/swagger.json"
DEFAULT_OUTPUT = "docs/demo3/openapi.yaml"


def ensure_pyyaml():
    try:
        import yaml  # noqa: F401
    except ImportError:
        print("PyYAML not found, installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "pyyaml"], check=True)


def find_repo_root() -> Path:
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True, text=True, check=True,
    )
    return Path(result.stdout.strip())


def fetch_spec(url: str) -> dict:
    print(f"Fetching live OpenAPI spec from {url} ...")
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as e:
        print(f"ERROR: could not reach {url}. Is the backend running? ({e})", file=sys.stderr)
        sys.exit(1)


def convert_and_verify(data: dict, output_path: Path) -> None:
    import yaml

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8", newline="\n") as f:
        yaml.safe_dump(data, f, sort_keys=False, default_flow_style=False, allow_unicode=True, width=100)

    with output_path.open(encoding="utf-8") as f:
        reloaded = yaml.safe_load(f)

    if reloaded != data:
        print("ERROR: round-trip mismatch. Conversion may have lost data", file=sys.stderr)
        sys.exit(1)

    print("OK: converted and verified.")


def main():
    parser = argparse.ArgumentParser(description="Export the backend's live OpenAPI spec to a YAML file.")
    parser.add_argument("--url", default=DEFAULT_URL, help=f"Swagger JSON endpoint (default: {DEFAULT_URL})")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help=f"Output path, relative to repo root (default: {DEFAULT_OUTPUT})")
    args = parser.parse_args()

    ensure_pyyaml()
    repo_root = find_repo_root()
    output_path = repo_root / args.output

    data = fetch_spec(args.url)
    convert_and_verify(data, output_path)

    print(f"Done. Updated {output_path.relative_to(repo_root)}")


if __name__ == "__main__":
    main()