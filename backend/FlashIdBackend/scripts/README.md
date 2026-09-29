# Regenerating the OpenAPI Service Contract

This guide explains how to regenerate `docs/demo/openapi.yaml`, the machine-readable API contract.

## Goal

`docs/demo3/openapi.yaml` should always reflect the *current* state of the API. It is a static export, not something that updates itself everytime the API changes. You need to re-run `export-openapi.ps1` and commit the result.

## Prerequisites

- Python 3, with `pip` available
- Git
- The backend running locally

Works the same way on Windows, macOS and Linux. It is a plain Python script with no shell-specific code, so any terminal that can run `python` works.

## Steps

1. Start the backend and leave it running
2. In a **separate** terminal, from anywhere in the repo, RUN:
    - Windows: `python backend/FlashIdBackend/scripts/export-openapi.py`
    - macOS/Linux: `python3 backend/FlashIdBackend/scripts/export-openapi.py`
3. Confirm it printed **Done. Updated docs/demo3/openapi.yaml**
4. Review the diff before comitting. Check that only the endpoints you actually meant to change show up as different.