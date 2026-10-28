#!/bin/bash
# ResearchMate AI - Start Script

echo "========================================================"
echo "🚀 Starting ResearchMate AI Platform"
echo "Academic Citation Auditor & Literature Review Generator"
echo "========================================================"

# Get the script directory
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. Start FastAPI Backend
echo "Starting FastAPI Backend on http://127.0.0.1:8000..."
cd "$ROOT_DIR/backend"
./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Trap signals to terminate background processes on exit
trap "echo 'Stopping ResearchMate AI...'; kill $BACKEND_PID; exit" INT TERM EXIT

# 2. Start Next.js Frontend
echo "Starting Next.js Frontend on http://localhost:3000..."
cd "$ROOT_DIR/frontend"
npm run dev
