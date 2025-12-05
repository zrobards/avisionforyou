#!/bin/bash
set -e

PROJECT_DIR="/Users/zacharyrobards/Documents/A vision for you recovery full website mockup/avisionforyou"
cd "$PROJECT_DIR"

echo "🛑 Stopping any running dev servers..."
pkill -f "next dev" 2>/dev/null || true
sleep 1

echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

echo "📦 Reinstalling npm dependencies..."
npm install --legacy-peer-deps 2>&1 | tail -5

echo ""
echo "🚀 Starting dev server..."
npm run dev
