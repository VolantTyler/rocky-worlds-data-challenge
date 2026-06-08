# Rocky Worlds Data Challenge

Utilities for setting up and ingesting the Kaggle Rocky Worlds Data Challenge files.

## macOS setup when `python`/`pip` are missing

Recent macOS shells often do not provide `python` or `pip` commands by default. Use `python3` and `python3 -m pip` instead, or install Python 3 first.

### 1. Check for Python 3

```bash
python3 --version
python3 -m pip --version
```

If both commands work, skip to the Kaggle setup below.

### 2. Install Python 3 if needed

Using Homebrew:

```bash
brew install python
```

If Homebrew is not installed, install Python 3 from <https://www.python.org/downloads/macos/> and open a new terminal window after installation.

### 3. Install project dependencies

From the project root:

```bash
python3 -m pip install -r requirements.txt
```

If your Python is externally managed and pip refuses to install globally, create a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

## Kaggle credentials

The Kaggle CLI needs an API token before it can download competition files.

1. Go to your Kaggle account settings.
2. Create a new API token; this downloads `kaggle.json`.
3. Move it into `~/.kaggle/kaggle.json`.
4. Restrict permissions so the Kaggle CLI accepts it.

```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json
```

Do not type shell comment lines that start with `#` into zsh; they are explanatory comments in documentation, not commands.

## Download the challenge data

After Python, dependencies, and Kaggle credentials are configured:

```bash
python3 phase1_setup_and_ingest.py --init --download --scan
```

The raw Kaggle files download into `data/raw/`. The scanner previews supported CSV/FITS photometry files when present.
