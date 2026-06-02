# Cloud Workflow

This repository is meant to support both local data work and cloud dashboard editing.

## What works well in a cloud thread

- Editing `dashboard/` React components, Tailwind classes, and layout.
- Updating `dashboard/src/data/rockyWorldsChallengeMock.json` with committed mock or derived summary data.
- Running lightweight frontend checks after dependencies are installed.
- Reviewing docs, architecture notes, and planned pipeline outputs.

## What should stay local unless cloud secrets are configured

- Kaggle authentication.
- Downloading raw challenge data.
- Inspecting private or large raw data files.
- Running analysis steps that depend on uncommitted local data.

## Remote setup for dashboard work

From the repository root:

```bash
npm --prefix dashboard install
npm run dashboard:dev
```

If a cloud environment blocks npm registry access with `403`, that is an environment or registry-auth problem, not proof that the project cannot run remotely. The practical options are:

- use a cloud environment with normal npm registry access,
- commit a lockfile from a successful local install so dependency resolution is stable,
- vendor or prebuild the dashboard only if registry access remains permanently blocked,
- keep dashboard edits in cloud and run the final build locally.

## Data handoff pattern

The dashboard should consume committed, small summary files rather than raw Kaggle downloads. A future pipeline step can export a dashboard-ready JSON artifact such as:

```text
data/processed/dashboard_summary.json
```

Then the dashboard can either copy that artifact into `dashboard/src/data/` for static builds or fetch it from a hosted location later.
