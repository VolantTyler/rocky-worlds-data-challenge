# Rocky Worlds Data Challenge — Decisions Log

This file captures architectural and process decisions to preserve project continuity.

---

## 2026-05-25 — Establish project continuity docs
**Decision:** Add `PROJECT_PLAN.md`, `ARCHITECTURE.md`, and `DECISIONS.md` at repository root.

**Why:** The repository currently contains a Phase 1 scaffold and minimal context; continuity documents provide persistent memory across sessions and collaborators.

**Impact:**
- Clear roadmap and milestones
- Explicit architecture boundaries
- Traceable decision history

---

## 2026-05-25 — Keep ingestion script as Phase 1 entrypoint
**Decision:** Continue using `phase1_setup_and_ingest.py` as the canonical bootstrap command until modular refactor is justified.

**Why:** Current codebase is small; premature restructuring would add overhead with limited immediate value.

**Impact:**
- Faster iteration in near term
- Lower maintenance overhead during early phases

**Revisit Trigger:**
- Introduce module/package structure once preprocessing + modeling layers are implemented.

---

## 2026-05-25 — Prefer reproducibility over one-off analysis
**Decision:** Future steps must prioritize deterministic outputs and logged preprocessing/model settings.

**Why:** Scientific workflows require transparent, repeatable results.

**Impact:**
- Additional metadata and artifact management work
- Increased confidence in comparison between targets and model runs

---

## 2026-05-25 — Keep runtime config and generated reports local
**Decision:** Configure Matplotlib and Kaggle runtime paths inside the project workspace and ignore generated cache/auth directories.

**Why:** The Codex workspace can read and write the project directory reliably, while user-home cache/auth paths may be unavailable in sandboxed runs.

**Impact:**
- Cleaner local verification runs
- Kaggle auth can be supplied via project-local `.kaggle/` without committing secrets
- Generated Phase 1 reports remain reproducible artifacts

**Revisit Trigger:**
- Move to a shared CI or Codespaces environment with managed secrets.

---

## 2026-06-02 — Keep pipeline and dashboard in one repository
**Decision:** Use `rocky-worlds-data-challenge` as the single repository for both the Python data pipeline and the dashboard display.

**Why:** The dashboard and pipeline describe the same scientific project. Keeping them together avoids drift between mock display fields and future processed outputs, and it gives cloud coding threads one canonical repository to edit.

**Alternatives considered:**
- Keep `rocky-worlds-ddt` as a separate dashboard-only repo.
- Move all code to the empty `rocky-worlds-ddt` repo.

**Impact:**
- Dashboard files live under `dashboard/`.
- Local-only Kaggle data and credentials stay ignored.
- Remote/cloud threads can safely work on UI and committed summary data without the laptop being online.

**Revisit Trigger:**
- Split the dashboard into a separate app only if deployment, permissions, or package management require independent release cycles.

---

## Decision Template (for future entries)

### YYYY-MM-DD — <Short decision title>
**Decision:** <What was decided>

**Why:** <Rationale>

**Alternatives considered:**
- <Option A>
- <Option B>

**Impact:**
- <Consequence 1>
- <Consequence 2>

**Revisit Trigger:**
- <Condition that should trigger reevaluation>
