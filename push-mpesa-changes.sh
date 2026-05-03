#!/bin/bash
# Quick script to push M-Pesa integration changes to GitHub

echo "🚀 Pushing M-Pesa Restaurant Order Integration to GitHub"
echo ""

# Add core implementation files
echo "📦 Adding core implementation files..."
git add bookings.html
git add bookings-page.css
git add restaurant-order-checkout.js
git add supabase-orders-table.sql

# Add documentation files
echo "📚 Adding documentation files..."
git add RESTAURANT-ORDER-MPESA-README.md
git add IMPLEMENTATION-SUMMARY.md
git add QUICK-START-GUIDE.md
git add TROUBLESHOOTING-FAILED-TO-FETCH.md
git add VERIFICATION-CHECKLIST.md
git add setup-mpesa-integration.html
git add GIT_PUSH_GUIDE.md

# Show what will be committed
echo ""
echo "📋 Files to be committed:"
git status --short

# Commit
echo ""
echo "💾 Committing changes..."
git commit -m "feat: Add M-Pesa integration for restaurant orders

Features:
- Dynamic M-Pesa phone field with validation (07XX or 254XX formats)
- STK push integration with loading states
- Supabase orders table with complete schema
- Payment status polling (every 2s, max 60s)
- Toast notifications for all states
- Cancel and clear functionality
- Comprehensive error handling

Files:
- bookings.html: Added M-Pesa phone input
- bookings-page.css: Added styles and animations
- restaurant-order-checkout.js: Main integration logic
- supabase-orders-table.sql: Database schema

Documentation:
- Complete setup and troubleshooting guides
- Implementation summary and verification checklist
- Interactive setup wizard"

# Push
echo ""
echo "🌐 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Check your GitHub repository."
