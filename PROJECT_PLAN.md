# Rocky Worlds Data Challenge — Project Plan

## Mission
Build a reproducible, science-focused analysis pipeline for the Rocky Worlds DDT challenge that ingests photometry data, validates data quality, produces exploratory diagnostics, fits baseline and probabilistic models, and exports interpretable results.

## Current Status (as of 2026-05-25)
- Phase 1 scaffold is implemented:
  - Data directory initialization
  - Optional Kaggle CLI download
  - CSV/FITS loading and preview
  - Basic dependency checks
  - Deterministic raw inventory generation
  - Validation report generation
- Raw challenge files are not present yet; Kaggle download currently requires local authentication.
- Dashboard scaffold lives in `dashboard/` for cloud-friendly UI iteration.

## Roadmap

### Phase 1 — Setup & Ingestion (In Progress)
- [x] Initialize standard data folders (`data/raw`, `data/processed`, `data/figures`)
- [x] Maintain manifest of expected targets/content
- [x] Add flexible CSV/FITS column mapping for `time`, `flux`, `flux_err`
- [x] Add explicit data validation report (nulls, ranges, units, cadence)
- [x] Add deterministic raw data inventory (`inventory.csv`)

### Phase 2 — Data QA & Preprocessing (Planned)
- [ ] Implement preprocessing module:
  - NaN handling
  - outlier detection
  - normalization strategy
  - optional detrending
- [ ] Persist per-target cleaned outputs to `data/processed/`
- [ ] Save preprocessing metadata for reproducibility

### Phase 3 — Exploratory Analysis (Planned)
- [ ] Generate per-target quicklook figures:
  - time vs flux
  - histogram of flux residuals
  - uncertainty distribution
- [ ] Write summary tables:
  - sample counts
  - missing rates
  - flux statistics

### Phase 4 — Baseline Modeling (Planned)
- [ ] Implement simple baseline transit/eclipse model fit
- [ ] Compute residual diagnostics
- [ ] Save model parameters and fit quality metrics

### Phase 5 — Probabilistic Inference (Planned)
- [ ] Integrate MCMC workflow (`emcee`)
- [ ] Generate posterior visualizations (`corner`)
- [ ] Report parameter uncertainties and correlations

### Phase 6 — Reporting & Packaging (Planned)
- [ ] Build reproducible run command(s) for end-to-end execution
- [ ] Generate final figures and concise result summary
- [ ] Add environment lockfile and usage documentation
- [ ] Export dashboard-ready summary JSON from processed pipeline outputs

### Phase 7 — Dashboard Integration (In Progress)
- [x] Keep the React/Tailwind dashboard in the same repository as the pipeline
- [x] Use committed mock JSON so cloud threads can edit the UI without Kaggle credentials
- [ ] Replace mock dashboard data with generated pipeline summary artifacts
- [ ] Add deployment notes once the dashboard target is chosen

## Deliverables
1. Reproducible scripts/notebooks for ingestion-to-results
2. Cleaned and versioned processed datasets
3. Diagnostic and publication-ready figures
4. Parameter estimates with uncertainty summaries
5. Clear runbook for local and GitHub Codespaces execution

## Working Cadence
- Weekly planning checkpoint in `DECISIONS.md`
- Update progress checkboxes at end of each working session
- Record scope changes and rationale before implementation
