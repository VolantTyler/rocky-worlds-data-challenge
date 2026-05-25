"""Phase 1 setup and data ingestion scaffold for the Rocky Worlds DDT challenge.

This script:
1) Verifies Python package dependencies.
2) Creates a conventional local data directory layout.
3) Optionally downloads challenge data with Kaggle CLI (if available/configured).
4) Provides loaders for CSV/FITS photometry files containing
   time/flux/flux_err-like columns.

Usage:
  python phase1_setup_and_ingest.py --init
  python phase1_setup_and_ingest.py --download
  python phase1_setup_and_ingest.py --scan
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path
from typing import Iterable


PROJECT_ROOT = Path(__file__).resolve().parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
FIGURES_DIR = DATA_DIR / "figures"

# Slug placeholder. Replace with exact Kaggle competition identifier once confirmed.
KAGGLE_COMPETITION_SLUG = "rocky-worlds-data-challenge"

TARGETS = {
    "GJ 3929 b": "Real JWST MIRI observations",
    "LHS 1140 b": "Simulated JWST MIRI observations",
}


def check_optional_dependencies() -> dict[str, bool]:
    """Check import availability for key analysis dependencies."""
    deps = [
        "numpy",
        "pandas",
        "matplotlib",
        "astropy",
        "emcee",
        "corner",
    ]
    status: dict[str, bool] = {}
    for dep in deps:
        try:
            __import__(dep)
            status[dep] = True
        except Exception:
            status[dep] = False
    return status


def init_directories() -> None:
    """Create standardized data directories."""
    for d in (DATA_DIR, RAW_DIR, PROCESSED_DIR, FIGURES_DIR):
        d.mkdir(parents=True, exist_ok=True)
    manifest = {
        "targets": TARGETS,
        "expected_content": {
            "GJ 3929 b": ["time", "flux", "flux_err"],
            "LHS 1140 b": ["time", "flux", "flux_err"],
        },
    }
    (DATA_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def kaggle_available() -> bool:
    return shutil.which("kaggle") is not None


def run_kaggle_download() -> None:
    """Download challenge files with Kaggle CLI into data/raw.

    Requires:
    - `kaggle` CLI installed
    - ~/.kaggle/kaggle.json configured
    """
    if not kaggle_available():
        raise RuntimeError("Kaggle CLI not found. Install via `pip install kaggle`.")

    cmd = [
        "kaggle",
        "competitions",
        "download",
        "-c",
        KAGGLE_COMPETITION_SLUG,
        "-p",
        str(RAW_DIR),
    ]
    subprocess.run(cmd, check=True)



def _candidate_columns(columns: Iterable[str]) -> dict[str, str | None]:
    lowered = {c.lower(): c for c in columns}

    def pick(options: list[str]) -> str | None:
        for opt in options:
            if opt in lowered:
                return lowered[opt]
        return None

    return {
        "time": pick(["time", "t", "mjd", "bjd", "bjd_tdb"]),
        "flux": pick(["flux", "f", "relative_flux", "normalized_flux"]),
        "flux_err": pick(["flux_err", "flux_error", "ferr", "sigma", "err"]),
    }


def load_csv_photometry(path: Path):
    import pandas as pd

    df = pd.read_csv(path)
    cols = _candidate_columns(df.columns)
    if cols["time"] is None or cols["flux"] is None:
        raise ValueError(f"{path.name}: could not identify required time/flux columns")

    out = df[[cols["time"], cols["flux"]]].copy()
    out.columns = ["time", "flux"]
    if cols["flux_err"] is not None:
        out["flux_err"] = df[cols["flux_err"]]
    return out


def load_fits_photometry(path: Path):
    from astropy.io import fits
    import pandas as pd

    with fits.open(path) as hdul:
        table_hdu = next((h for h in hdul if hasattr(h, "data") and h.data is not None), None)
        if table_hdu is None:
            raise ValueError(f"{path.name}: no table-like data found in FITS file")
        data = table_hdu.data
        names = [n for n in data.names] if hasattr(data, "names") else []
        cols = _candidate_columns(names)
        if cols["time"] is None or cols["flux"] is None:
            raise ValueError(f"{path.name}: time/flux columns not identified in FITS table")

        out = pd.DataFrame({
            "time": data[cols["time"]],
            "flux": data[cols["flux"]],
        })
        if cols["flux_err"] is not None:
            out["flux_err"] = data[cols["flux_err"]]
        return out


def scan_and_preview_raw_data() -> None:
    files = sorted(RAW_DIR.glob("**/*"))
    data_files = [f for f in files if f.is_file() and f.suffix.lower() in {".csv", ".fits", ".fit"}]
    if not data_files:
        print("No CSV/FITS data files found in data/raw yet.")
        return

    print(f"Found {len(data_files)} candidate data files:")
    for f in data_files:
        print(f" - {f.relative_to(PROJECT_ROOT)}")

    for f in data_files[:5]:
        try:
            if f.suffix.lower() == ".csv":
                preview = load_csv_photometry(f).head(3)
            else:
                preview = load_fits_photometry(f).head(3)
            print(f"\nPreview: {f.name}")
            print(preview)
        except Exception as exc:
            print(f"Could not preview {f.name}: {exc}")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Phase 1 setup and ingestion scaffold")
    p.add_argument("--init", action="store_true", help="Create data directories and manifest")
    p.add_argument("--download", action="store_true", help="Download challenge data via Kaggle CLI")
    p.add_argument("--scan", action="store_true", help="Scan and preview raw CSV/FITS files")
    return p.parse_args()


def main() -> None:
    args = parse_args()

    if args.init:
        init_directories()
        print(f"Initialized directories under: {DATA_DIR}")

    status = check_optional_dependencies()
    print("Dependency status:")
    for dep, ok in status.items():
        print(f" - {dep}: {'OK' if ok else 'MISSING'}")

    if args.download:
        run_kaggle_download()
        print("Kaggle download complete.")

    if args.scan:
        scan_and_preview_raw_data()


if __name__ == "__main__":
    main()
