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

