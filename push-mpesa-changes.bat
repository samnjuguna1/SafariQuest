@echo off
REM Quick script to push M-Pesa integration changes to GitHub

echo 🚀 Pushing M-Pesa Restaurant Order Integration to GitHub
echo.

REM Add core implementation files
echo 📦 Adding core implementation files...
git add bookings.html
git add bookings-page.css
git add restaurant-order-checkout.js
git add supabase-orders-table.sql

REM Add documentation files
echo 📚 Adding documentation files...
git add RESTAURANT-ORDER-MPESA-README.md
git add IMPLEMENTATION-SUMMARY.md
git add QUICK-START-GUIDE.md
git add TROUBLESHOOTING-FAILED-TO-FETCH.md
git add VERIFICATION-CHECKLIST.md
git add setup-mpesa-integration.html
git add GIT_PUSH_GUIDE.md

REM Show what will be committed
echo.
echo 📋 Files to be committed:
git status --short

REM Commit
echo.
echo 💾 Committing changes...
git commit -m "feat: Add M-Pesa integration for restaurant orders" -m "Features:" -m "- Dynamic M-Pesa phone field with validation (07XX or 254XX formats)" -m "- STK push integration with loading states" -m "- Supabase orders table with complete schema" -m "- Payment status polling (every 2s, max 60s)" -m "- Toast notifications for all states" -m "- Cancel and clear functionality" -m "- Comprehensive error handling" -m "" -m "Files:" -m "- bookings.html: Added M-Pesa phone input" -m "- bookings-page.css: Added styles and animations" -m "- restaurant-order-checkout.js: Main integration logic" -m "- supabase-orders-table.sql: Database schema" -m "" -m "Documentation:" -m "- Complete setup and troubleshooting guides" -m "- Implementation summary and verification checklist" -m "- Interactive setup wizard"

REM Push
echo.
echo 🌐 Pushing to GitHub...
git push origin main

echo.
echo ✅ Done! Check your GitHub repository.
pause
