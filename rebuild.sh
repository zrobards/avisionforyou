#!/bin/bash
cd '/Users/zacharyrobards/Documents/A vision for you recovery full website mockup/avisionforyou'

echo "🔄 Cleaning cache..."
rm -rf .next node_modules/.cache

echo "📦 Reinstalling dependencies with correct versions..."
npm install --legacy-peer-deps

echo "✨ Restarting dev server..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

./node_modules/.bin/next dev
