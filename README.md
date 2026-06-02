# Rocky Worlds Data Challenge

Monorepo for the Rocky Worlds DDT Data Challenge proof of concept.

The repository intentionally keeps the local data-science pipeline and the dashboard display together:

- `phase1_setup_and_ingest.py` and `rocky_worlds_data_challenge/` contain the Python pipeline scaffold.
- `dashboard/` contains the Vite, React, and Tailwind dashboard that can be edited from cloud coding threads.
- `data/` contains local runtime outputs, validation reports, and placeholder folders. Raw challenge data and secrets are not committed.

## Recommended workflow

Use this repository as the single source of truth. The older empty `rocky-worlds-ddt` repo can be retired or archived after this repo is pushed.

Cloud threads are a good fit for dashboard work because the UI uses committed mock JSON data and does not require Kaggle credentials. Local laptop sessions remain the best fit for authenticated Kaggle downloads, raw data inspection, and pipeline runs.

## Python pipeline

Create a virtual environment and install dependencies:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Initialize the data folders and manifest:

```bash
.venv/bin/python phase1_setup_and_ingest.py --init
```

Authenticate with Kaggle before downloading data:

```bash
mkdir -p .kaggle
KAGGLE_CONFIG_DIR="$PWD/.kaggle" .venv/bin/kaggle auth login
```

Download, inventory, validate, and scan raw files:

```bash
.venv/bin/python phase1_setup_and_ingest.py --download
.venv/bin/python phase1_setup_and_ingest.py --inventory --validate --scan
```

Generated artifacts include:

- `data/raw/inventory.csv`
- `data/reports/validation_report.json`

## Dashboard

The dashboard is isolated under `dashboard/` so cloud threads can make UI changes without touching local-only data credentials.

Install and run it from the repository root:

```bash
npm --prefix dashboard install
npm --prefix dashboard run dev
```

Or use the root convenience scripts:

```bash
npm run dashboard:dev
npm run dashboard:build
```

The dashboard currently reads mock challenge data from `dashboard/src/data/rockyWorldsChallengeMock.json`. Replace or extend that file with exported pipeline summaries when the analysis outputs are ready.

## Cloud thread guidance

See `docs/cloud-workflow.md` for the intended split between cloud-safe dashboard work and local-only data work.
