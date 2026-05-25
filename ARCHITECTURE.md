# Rocky Worlds Data Challenge — Architecture

## Overview
The project architecture follows a staged data-science pipeline:

1. **Ingest** raw challenge data (CSV/FITS)
2. **Validate** schema and content quality
3. **Preprocess** into standardized analysis-ready tables
4. **Analyze/Model** with baseline + probabilistic methods
5. **Report** metrics, visualizations, and artifacts

## Directory Structure

- `phase1_setup_and_ingest.py`
  - Bootstrap and ingestion entrypoint
- `data/`
  - `raw/` — source files from Kaggle challenge
  - `processed/` — cleaned standardized tables
  - `figures/` — generated plots and diagnostics
  - `manifest.json` — target metadata and expected columns

## Component Responsibilities

### 1) Setup & Dependency Layer
- Validates optional analysis dependencies (`numpy`, `pandas`, `matplotlib`, `astropy`, `emcee`, `corner`)
- Creates canonical data directories

### 2) Data Access Layer
- CSV loader with flexible column-name matching
- FITS loader with table extraction and column-name matching
- Common standardized output fields:
  - required: `time`, `flux`
  - optional: `flux_err`

### 3) Validation Layer (planned)
- Schema checks (required columns, dtypes)
- Quality checks (null rates, finite values, uncertainty sanity)
- Integrity report persisted to disk

### 4) Preprocessing Layer (planned)
- Data cleaning
- Optional detrending and normalization
- Export of processed target-level datasets

### 5) Modeling Layer (planned)
- Deterministic baseline fit
- Bayesian/MCMC extension for parameter posteriors

### 6) Reporting Layer (planned)
- Diagnostic plots
- Parameter tables
- Reproducible run summaries

## Execution Model
Current script entrypoints:
- `--init`: initialize directories/manifest
- `--download`: download challenge files (Kaggle CLI)
- `--scan`: discover and preview raw data files

Planned evolution:
- Modular Python package structure (e.g., `src/`)
- Explicit pipeline commands for `validate`, `preprocess`, `fit`, `report`

## Reproducibility Principles
- Deterministic file naming for processed outputs
- Metadata logging for each transformation step
- Version-controlled planning and decision records

