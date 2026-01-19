# Board System Testing Guide

## Quick Start

### 1. Restart Development Server
```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

This ensures the Prisma client is regenerated with the new BoardUpdate and BoardDocument models.

### 2. Create a Board Member Test Account

**Option A: Via Database (if you have direct access)**
```sql
-- Find an existing user or create one
UPDATE users SET role = 'BOARD' WHERE email = 'boardmember@test.com';
```

**Option B: Via Admin Panel**
1. Log in as admin
2. Go to `/admin/users`
3. Create new user or update existing user
4. Set role to "BOARD"

### 3. Test Board Member Access

**Login as Board Member:**
- Email: boardmember@test.com
- Navigate to: `http://localhost:3000/board`

**Expected Results:**
✅ Should see Board Dashboard with:
- Welcome message with user's name
- 4 metric cards (donations, meetings, subscribers, inquiries)
- Recent updates section (empty initially)
- Quick links to Updates and Documents

**Test Navigation:**
1. Click "Updates" - should see empty state
2. Click "Documents" - should see empty state
3. Click "Back to Main Site" - should go to homepage
4. Try to access `/admin` - should be redirected to `/unauthorized`

### 4. Test Admin Board Management

**Login as Admin:**
- Navigate to: `http://localhost:3000/admin`

**Test Board Updates:**
1. Click "Board Management" in sidebar (should expand)
2. Click "Board Updates"
3. Click "Create Update" button
4. Fill in form:
   - Title: "Q1 2026 Financial Update"
   - Category: "Financial Summary"
   - Content: "Our Q1 donations exceeded expectations..."
   - Check "Mark as high priority"
5. Click "Create"
6. Verify update appears in table with priority badge
7. Click Edit icon, modify content, save
8. Click Delete icon, confirm deletion

**Test Board Documents:**
1. Click "Board Documents" in sidebar
2. Click "Upload Document" button
3. Fill in form:
   - Title: "2026 Budget Proposal"
   - Description: "Annual budget for review"
   - Category: "Financial Summary"
   - File: Upload a test PDF
4. Click "Upload"
5. Verify document appears in table
6. Click Download icon - should download file
7. Click Delete icon, confirm deletion

### 5. Verify Board Member Can See Content

**Login as Board Member again:**
1. Go to `/board`
2. Should see the high-priority update in the yellow highlight box
3. Click "Updates" - should see the update you created
4. Click "Documents" - should see the document you uploaded
5. Try to edit/delete - should NOT see any edit/delete buttons

### 6. Test Filters and Search

**Board Updates Page:**
1. Create multiple updates with different categories
2. Use category dropdown to filter
3. Verify only matching updates show

**Board Documents Page:**
1. Upload multiple documents with different categories
2. Click category filter buttons
3. Use search box to search by title
4. Verify filtering works correctly

## Test Scenarios

### Scenario 1: Executive Directive (High Priority)
1. Admin creates update with category "Executive Directive"
2. Check "Mark as high priority"
3. Verify warning message appears: "Must be posted within 24 hours"
4. Board member should see this at top of dashboard in yellow box

### Scenario 2: Multiple Categories
1. Create updates in all 4 categories:
   - Executive Directive
   - Board Update
   - Financial Summary
   - Governance
2. Verify category badges display correctly
3. Test filtering by each category

### Scenario 3: Document Upload
1. Test uploading different file types:
   - PDF ✅
   - DOC/DOCX ✅
   - XLS/XLSX ✅
   - JPG ❌ (should reject)
2. Verify file size displays correctly
3. Verify download works

### Scenario 4: Unauthorized Access
1. Logout
2. Try to access `/board` - should redirect to `/login`
3. Login as regular USER role
4. Try to access `/board` - should redirect to `/unauthorized`
5. Try to access `/admin/board` - should redirect to `/unauthorized`

## API Testing (Optional)

### Test with curl or Postman:

**Get Board Metrics:**
```bash
curl http://localhost:3000/api/board/metrics \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Get Board Updates:**
```bash
curl http://localhost:3000/api/board/updates \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Create Board Update (Admin):**
```bash
curl -X POST http://localhost:3000/api/admin/board/updates \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_ADMIN_SESSION_TOKEN" \
  -d '{
    "title": "Test Update",
    "content": "Test content",
    "category": "BOARD_UPDATE",
    "priority": false
  }'
```

## Common Issues & Solutions

### Issue: "Prisma Client not found"
**Solution:** Restart dev server after schema changes
```bash
npm run dev
```

### Issue: "Unauthorized" when accessing board routes
**Solution:** Verify user role is set to "BOARD" or "ADMIN"
```sql
SELECT id, email, role FROM users WHERE email = 'your@email.com';
```

### Issue: Files not downloading
**Solution:** Files are stored as base64 data URLs. Check browser console for errors.

### Issue: Upload fails with large files
**Solution:** Base64 storage has limits. For files >10MB, consider implementing Vercel Blob or S3.

### Issue: Sidebar not showing Board Management
**Solution:** 
1. Clear browser cache
2. Restart dev server
3. Verify you're logged in as ADMIN

## Browser Console Checks

Open browser console (F12) and check for:
- ❌ 401 Unauthorized errors - Check authentication
- ❌ 404 Not Found errors - Check route paths
- ❌ 500 Server errors - Check server logs
- ✅ Successful API responses

## Database Verification

Check that data is being created:
```sql
-- Check board updates
SELECT id, title, category, priority, "createdAt" FROM board_updates ORDER BY "createdAt" DESC;

-- Check board documents
SELECT id, title, category, "uploadedAt" FROM board_documents ORDER BY "uploadedAt" DESC;

-- Check user roles
SELECT id, email, role FROM users WHERE role IN ('BOARD', 'ADMIN');
```

## Performance Testing

1. Create 50+ updates
2. Create 20+ documents
3. Test page load times
4. Test filter performance
5. Test search performance

## Accessibility Testing

1. Test keyboard navigation (Tab, Enter, Escape)
2. Test screen reader compatibility
3. Verify ARIA labels are present
4. Check color contrast for priority badges

## Mobile Testing

1. Test on mobile viewport (Chrome DevTools)
2. Verify sidebar is responsive
3. Check table scrolling on small screens
4. Test touch interactions

## Success Criteria

✅ Board members can view dashboard with metrics
✅ Board members can view and filter updates
✅ Board members can view, filter, and search documents
✅ Board members can download documents
✅ Board members CANNOT edit or delete anything
✅ Admins can create, edit, and delete updates
✅ Admins can upload and delete documents
✅ Priority updates are highlighted
✅ Category filters work correctly
✅ Search functionality works
✅ Unauthorized users are redirected
✅ No console errors
✅ No linter errors

## Next Steps After Testing

1. ✅ Verify all features work as expected
2. ✅ Fix any bugs found during testing
3. ✅ Add sample data for demo purposes
4. ✅ Document any configuration needed for production
5. ✅ Consider adding email notifications
6. ✅ Consider adding audit logging
7. ✅ Plan for file storage migration if needed (Vercel Blob/S3)
