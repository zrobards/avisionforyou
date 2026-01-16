#!/bin/bash

# Fix Role Update Error - Run this script

echo "🔧 Fixing Role Update Error..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "1️⃣ Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Done!"
echo ""
echo "Now restart your dev server:"
echo "  1. Press Ctrl+C to stop the current server"
echo "  2. Run: npm run dev"
echo "  3. Try updating a user role again"
echo ""
echo "If it still doesn't work, check the server terminal for error details."
