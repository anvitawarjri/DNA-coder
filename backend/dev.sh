#!/bin/bash
set -e

# Change directory to script location
cd "$(dirname "$0")"

echo "=== Setting up Python Virtual Environment ==="
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
fi

echo "=== Activating Virtual Environment ==="
source venv/bin/activate

echo "=== Installing Dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Starting FastAPI Application ==="
# We add backend to PYTHONPATH so imports like 'from app.database import ...' work
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python3 app/main.py
