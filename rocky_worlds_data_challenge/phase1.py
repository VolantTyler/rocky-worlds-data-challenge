"""Phase 1 setup and data ingestion utilities.

The module keeps Phase 1 implementation in an importable package so the
repository-root ``phase1_setup_and_ingest.py`` file can stay as a small,
stable command-line wrapper. If a merge conflict occurs in that wrapper, keep
its current three-line delegation to :func:`main` and resolve behavioral changes
in this module instead.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
FIGURES_DIR = DATA_DIR / "figures"
REPORTS_DIR = DATA_DIR / "reports"
RUNTIME_DIR = DATA_DIR / ".runtime"
MANIFEST_PATH = DATA_DIR / "manifest.json"
INVENTORY_PATH = RAW_DIR / "inventory.csv"
VALIDATION_REPORT_PATH = REPORTS_DIR / "validation_report.json"

# Replace this if the official Kaggle competition slug differs.
KAGGLE_COMPETITION_SLUG = "rocky-worlds-data-challenge"

TARGETS = {
    "GJ 3929 b": "Real JWST MIRI observations",
    "LHS 1140 b": "Simulated JWST MIRI observations",
}

EXPECTED_COLUMNS = {
    "GJ 3929 b": ["time", "flux", "flux_err"],
    "LHS 1140 b": ["time", "flux", "flux_err"],
}

OPTIONAL_DEPENDENCIES = (
    "numpy",
    "pandas",
    "matplotlib",
    "astropy",
    "emcee",
    "corner",
)

SUPPORTED_DATA_SUFFIXES = {".csv", ".fits", ".fit"}


def configure_local_runtime_dirs() -> None:
    """Keep tool caches and auth lookup paths inside the project workspace."""
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("MPLCONFIGDIR", str(RUNTIME_DIR / "matplotlib"))
    os.environ.setdefault("KAGGLE_CONFIG_DIR", str(PROJECT_ROOT / ".kaggle"))


def check_optional_dependencies() -> dict[str, bool]:
    """Return availability for key analysis dependencies without importing them."""
    return {dep: importlib.util.find_spec(dep) is not None for dep in OPTIONAL_DEPENDENCIES}


def build_manifest() -> dict[str, object]:
    """Build a serializable manifest for Phase 1 target metadata."""
    return {
        "targets": TARGETS,
        "expected_content": EXPECTED_COLUMNS,
        "directories": {
            "raw": str(RAW_DIR.relative_to(PROJECT_ROOT)),
            "processed": str(PROCESSED_DIR.relative_to(PROJECT_ROOT)),
            "figures": str(FIGURES_DIR.relative_to(PROJECT_ROOT)),
            "reports": str(REPORTS_DIR.relative_to(PROJECT_ROOT)),
        },
    }


def init_directories() -> None:
    """Create standardized data directories and write the Phase 1 manifest."""
    for directory in (DATA_DIR, RAW_DIR, PROCESSED_DIR, FIGURES_DIR, REPORTS_DIR, RUNTIME_DIR):
        directory.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(build_manifest(), indent=2) + "\n", encoding="utf-8")


def kaggle_available() -> bool:
    """Return whether the Kaggle CLI is available on PATH."""
    return kaggle_command() is not None


def kaggle_command() -> str | None:
    """Prefer the project virtualenv Kaggle executable when present."""
    local_kaggle = PROJECT_ROOT / ".venv" / "bin" / "kaggle"
    if local_kaggle.exists():
        return str(local_kaggle)
    return shutil.which("kaggle")


def run_kaggle_download(competition_slug: str = KAGGLE_COMPETITION_SLUG) -> None:
    """Download challenge files with the Kaggle CLI into ``data/raw``.

    Requires the ``kaggle`` CLI package and a configured Kaggle API token.
    """
    kaggle = kaggle_command()
    if kaggle is None:
        raise RuntimeError("Kaggle CLI not found. Install it with `pip install kaggle`.")

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    cmd = [
        kaggle,
        "competitions",
        "download",
        "-c",
        competition_slug,
        "-p",
        str(RAW_DIR),
    ]
    try:
        subprocess.run(cmd, check=True, env=os.environ.copy())
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(
            "Kaggle download failed. Confirm Kaggle authentication and the "
            f"competition slug `{competition_slug}` before retrying."
        ) from exc


def _normalize_column_name(name: str) -> str:
    return name.strip().lower().replace("-", "_").replace(" ", "_")


def _candidate_columns(columns: Iterable[str]) -> dict[str, str | None]:
    normalized = {_normalize_column_name(column): column for column in columns}

    def pick(options: tuple[str, ...]) -> str | None:
        for option in options:
            if option in normalized:
                return normalized[option]
        return None

    return {
        "time": pick(("time", "t", "mjd", "bjd", "bjd_tdb")),
        "flux": pick(("flux", "f", "relative_flux", "normalized_flux", "norm_flux")),
        "flux_err": pick(("flux_err", "flux_error", "ferr", "sigma", "err", "error")),
    }


def load_csv_photometry(path: Path):
    """Load a CSV photometry table into canonical columns."""
    import pandas as pd

    df = pd.read_csv(path)
    cols = _candidate_columns(df.columns)
    if cols["time"] is None or cols["flux"] is None:
        raise ValueError(f"{path.name}: could not identify required time/flux columns")

    output_columns = [cols["time"], cols["flux"]]
    canonical_names = ["time", "flux"]
    if cols["flux_err"] is not None:
        output_columns.append(cols["flux_err"])
        canonical_names.append("flux_err")

    out = df[output_columns].copy()
    out.columns = canonical_names
    return out


def load_fits_photometry(path: Path):
    """Load a FITS table into canonical photometry columns."""
    import pandas as pd
    from astropy.io import fits

    with fits.open(path) as hdul:
        table_hdu = next(
            (
                hdu
                for hdu in hdul
                if getattr(hdu, "data", None) is not None and getattr(hdu.data, "names", None)
            ),
            None,
        )
        if table_hdu is None:
            raise ValueError(f"{path.name}: no table-like data found in FITS file")

        data = table_hdu.data
        cols = _candidate_columns(data.names)
        if cols["time"] is None or cols["flux"] is None:
            raise ValueError(f"{path.name}: time/flux columns not identified in FITS table")

        values = {
            "time": data[cols["time"]],
            "flux": data[cols["flux"]],
        }
        if cols["flux_err"] is not None:
            values["flux_err"] = data[cols["flux_err"]]
        return pd.DataFrame(values)


def load_photometry(path: Path):
    """Dispatch to the appropriate photometry loader by file suffix."""
    suffix = path.suffix.lower()
    if suffix == ".csv":
        return load_csv_photometry(path)
    if suffix in {".fits", ".fit"}:
        return load_fits_photometry(path)
    raise ValueError(f"Unsupported photometry file suffix: {path.suffix}")


def find_raw_data_files() -> list[Path]:
    """Return supported raw photometry files below ``data/raw``."""
    if not RAW_DIR.exists():
        return []
    return sorted(
        path
        for path in RAW_DIR.rglob("*")
        if path.is_file()
        and path.suffix.lower() in SUPPORTED_DATA_SUFFIXES
        and path != INVENTORY_PATH
    )


def sha256_file(path: Path) -> str:
    """Return the SHA-256 hash for a file."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def write_raw_inventory() -> Path:
    """Write a deterministic inventory of raw CSV/FITS files."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    rows = []
    for path in find_raw_data_files():
        stat = path.stat()
        rows.append(
            {
                "relative_path": path.relative_to(PROJECT_ROOT).as_posix(),
                "suffix": path.suffix.lower(),
                "size_bytes": stat.st_size,
                "mtime_utc": datetime.fromtimestamp(stat.st_mtime, UTC).isoformat(),
                "sha256": sha256_file(path),
            }
        )

    with INVENTORY_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["relative_path", "suffix", "size_bytes", "mtime_utc", "sha256"],
        )
        writer.writeheader()
        writer.writerows(rows)
    return INVENTORY_PATH


def validation_summary(path: Path) -> dict[str, object]:
    """Build validation metrics for one raw photometry file."""
    import numpy as np
    import pandas as pd

    df = load_photometry(path)

    summary: dict[str, object] = {
        "relative_path": path.relative_to(PROJECT_ROOT).as_posix(),
        "rows": int(len(df)),
        "columns": list(df.columns),
        "dtypes": {col: str(df[col].dtype) for col in df.columns},
        "null_counts": {col: int(df[col].isna().sum()) for col in df.columns},
        "finite_counts": {},
        "ranges": {},
        "cadence": None,
        "units": {
            "time": "unknown",
            "flux": "unknown",
            "flux_err": "unknown" if "flux_err" in df.columns else None,
        },
        "issues": [],
    }

    for col in df.columns:
        numeric = pd.to_numeric(df[col], errors="coerce")
        finite_mask = np.isfinite(numeric)
        finite_values = numeric[finite_mask]
        summary["finite_counts"][col] = int(finite_mask.sum())
        if len(finite_values):
            summary["ranges"][col] = {
                "min": float(finite_values.min()),
                "max": float(finite_values.max()),
            }
        else:
            summary["ranges"][col] = None
            summary["issues"].append(f"{col}: no finite values")

    if len(df) == 0:
        summary["issues"].append("file contains no rows")

    if "flux_err" not in df.columns:
        summary["issues"].append("flux_err column not identified")
    elif (df["flux_err"] <= 0).any():
        summary["issues"].append("flux_err contains non-positive values")

    if len(df) > 1:
        time_values = pd.to_numeric(df["time"], errors="coerce").dropna().sort_values()
        deltas = time_values.diff().dropna()
        if len(deltas):
            summary["cadence"] = {
                "median_delta": float(deltas.median()),
                "min_delta": float(deltas.min()),
                "max_delta": float(deltas.max()),
            }
            if (deltas <= 0).any():
                summary["issues"].append("time column contains repeated or decreasing values")
        else:
            summary["issues"].append("cadence unavailable: fewer than two finite time values")

    return summary


def write_validation_report() -> Path:
    """Validate raw photometry files and persist a JSON report."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    files = find_raw_data_files()
    report: dict[str, object] = {
        "generated_at_utc": datetime.now(UTC).isoformat(),
        "raw_dir": RAW_DIR.relative_to(PROJECT_ROOT).as_posix(),
        "file_count": len(files),
        "files": [],
        "notes": [],
    }
    if not files:
        report["notes"].append("No CSV/FITS files found under data/raw.")

    for path in files:
        try:
            report["files"].append(validation_summary(path))
        except Exception as exc:
            report["files"].append(
                {
                    "relative_path": path.relative_to(PROJECT_ROOT).as_posix(),
                    "error": str(exc),
                    "issues": ["validation failed"],
                }
            )

    VALIDATION_REPORT_PATH.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return VALIDATION_REPORT_PATH


def scan_and_preview_raw_data(limit: int = 5) -> None:
    """Print candidate raw files and preview the first few parseable tables."""
    data_files = find_raw_data_files()
    if not data_files:
        print("No CSV/FITS data files found in data/raw yet.")
        return

    print(f"Found {len(data_files)} candidate data files:")
    for path in data_files:
        print(f" - {path.relative_to(PROJECT_ROOT)}")

    for path in data_files[:limit]:
        try:
            preview = load_photometry(path).head(3)
        except (ImportError, ValueError, OSError) as exc:
            print(f"Could not preview {path.name}: {exc}")
            continue
        print(f"\nPreview: {path.name}")
        print(preview)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Phase 1 setup and ingestion scaffold")
    parser.add_argument("--init", action="store_true", help="Create data directories and manifest")
    parser.add_argument("--download", action="store_true", help="Download challenge data via Kaggle CLI")
    parser.add_argument("--scan", action="store_true", help="Scan and preview raw CSV/FITS files")
    parser.add_argument("--inventory", action="store_true", help="Write deterministic data/raw/inventory.csv")
    parser.add_argument("--validate", action="store_true", help="Write data quality validation report")
    parser.add_argument(
        "--competition-slug",
        default=KAGGLE_COMPETITION_SLUG,
        help="Kaggle competition slug to use with --download",
    )
    return parser.parse_args()


def main() -> None:
    configure_local_runtime_dirs()
    args = parse_args()

    if args.init:
        init_directories()
        print(f"Initialized directories under: {DATA_DIR}")

    status = check_optional_dependencies()
    print("Dependency status:")
    for dep, ok in status.items():
        print(f" - {dep}: {'OK' if ok else 'MISSING'}")

    if args.download:
        try:
            run_kaggle_download(args.competition_slug)
            print("Kaggle download complete.")
        except RuntimeError as exc:
            print(f"Download skipped: {exc}", file=sys.stderr)
            sys.exit(1)

    if args.inventory:
        path = write_raw_inventory()
        print(f"Wrote raw inventory: {path.relative_to(PROJECT_ROOT)}")

    if args.validate:
        path = write_validation_report()
        print(f"Wrote validation report: {path.relative_to(PROJECT_ROOT)}")

    if args.scan:
        scan_and_preview_raw_data()
