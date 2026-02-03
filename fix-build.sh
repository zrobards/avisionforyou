#!/bin/bash

echo "🔧 Fixing Tailwind CSS build error..."

# Remove cache
rm -rf .next node_modules/.cache

# Reinstall dependencies
npm install --legacy-peer-deps

# Clear Tailwind cache
rm -rf node_modules/.tailwind-cache 2>/dev/null || true

echo "✅ Dependencies reinstalled"

# Start dev server
npm run dev
