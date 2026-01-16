#!/bin/bash

# Fix Board Roles Script

echo "🔧 Fixing Board Member Role Assignment..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "1️⃣ Regenerating Prisma Client with board roles..."
npx prisma generate

echo ""
echo "2️⃣ Clearing Next.js cache..."
rm -rf .next

echo ""
echo "3️⃣ Clearing Node module cache..."
rm -rf node_modules/.cache 2>/dev/null || true

echo ""
echo "✅ Done!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 IMPORTANT: Now do these steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. STOP your dev server (press Ctrl+C)"
echo "  2. Start it again: npm run dev"
echo "  3. Go to http://localhost:3002/admin/users"
echo "  4. Try to assign a user as 'Board Member'"
echo ""
echo "If it STILL doesn't work:"
echo "  • Check your server terminal for error messages"
echo "  • Look for lines starting with 'Update user role error:'"
echo "  • Share that error message"
echo ""
