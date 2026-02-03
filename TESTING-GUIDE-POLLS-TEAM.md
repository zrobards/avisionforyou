# Testing Guide: Polls and Team Management

## Quick Test Instructions

### Testing Polls (Issue 1)

#### 1. Create a Poll (Admin)
1. Navigate to `/admin/community/polls`
2. Click "Create Poll" button
3. Fill in:
   - Poll Question: "Should AVFY expand to a new location?"
   - Description: "We're considering opening a second facility"
   - Leave "Closes At" empty or set a future date
4. Click "Create Poll"
5. **Expected**: Poll appears in the list with a green "Active" badge

#### 2. Toggle Poll Active/Inactive (Admin)
1. Find the poll you just created
2. Click the "Active" button (green)
3. **Expected**: Button changes to "Closed" (gray)
4. Click "Closed" button
5. **Expected**: Button changes back to "Active" (green)

#### 3. View Active Polls (Alumni)
1. Log in as an ALUMNI user
2. Navigate to `/community/polls`
3. **Expected**: You see all active polls
4. **Expected**: You can vote Yes/No on polls you haven't voted on
5. **Expected**: Polls show vote percentages after voting

#### 4. Verify Inactive Polls Don't Show (Alumni)
1. As admin, deactivate a poll
2. As alumni, refresh `/community/polls`
3. **Expected**: Deactivated poll is NOT visible

---

### Testing Team Members (Issue 2)

#### 1. View Team Members (Admin)
1. Navigate to `/admin/team`
2. **Expected**: See list of existing team members
3. **Expected**: Each member shows name, title, bio, and photo (if set)

#### 2. Add Team Member (Admin)
1. Click "Add Member" button
2. Fill in the form:
   - **Full Name**: "Dr. Jane Smith" (required)
   - **Title/Position**: "Clinical Director" (required)
   - **Bio**: "Dr. Smith has 15 years of experience..." (required)
   - **Role/Department**: "Clinical Services" (optional)
   - **Photo URL**: "/team/jane-smith.jpg" (optional)
   - **Email**: "jane@avfy.org" (optional)
   - **Phone**: "555-0123" (optional)
3. Click "Add Member"
4. **Expected**: Success toast appears
5. **Expected**: New member appears in the list
6. **Expected**: Member persists after page refresh

#### 3. Edit Team Member (Admin)
1. Find a team member in the list
2. Click "Edit" button
3. Modify any field (e.g., change title)
4. Click "Update Member"
5. **Expected**: Success toast appears
6. **Expected**: Changes are visible immediately
7. **Expected**: Changes persist after page refresh

#### 4. Delete Team Member (Admin)
1. Find a team member in the list
2. Click "Delete" button
3. Confirm the deletion in the popup
4. **Expected**: Success toast appears
5. **Expected**: Member is removed from the list
6. **Expected**: Member stays deleted after page refresh

---

## API Testing with curl/Postman

### Polls API

#### Get All Polls (Admin)
```bash
GET /api/admin/community/polls
Authorization: Required (Admin)
```

#### Create Poll (Admin)
```bash
POST /api/admin/community/polls
Content-Type: application/json
Authorization: Required (Admin)

{
  "title": "Should AVFY expand?",
  "description": "Optional description",
  "closesAt": "2026-12-31T23:59:59Z"  // Optional
}
```

#### Toggle Poll Active (Admin)
```bash
PATCH /api/admin/community/polls/[id]
Content-Type: application/json
Authorization: Required (Admin)

{
  "active": false
}
```

#### Delete Poll (Admin)
```bash
DELETE /api/admin/community/polls/[id]
Authorization: Required (Admin)
```

#### Get Active Polls (Alumni)
```bash
GET /api/community/polls
Authorization: Required (Alumni or Admin)
```

---

### Team API

#### Get All Team Members (Admin)
```bash
GET /api/admin/team
Authorization: Required (Admin or Staff)
```

#### Create Team Member (Admin)
```bash
POST /api/admin/team
Content-Type: application/json
Authorization: Required (Admin)

{
  "name": "Dr. Jane Smith",
  "title": "Clinical Director",
  "bio": "15 years of experience in addiction medicine",
  "role": "Clinical Services",
  "imageUrl": "/team/jane-smith.jpg",
  "email": "jane@avfy.org",
  "phone": "555-0123"
}
```

#### Update Team Member (Admin)
```bash
PUT /api/admin/team/[id]
Content-Type: application/json
Authorization: Required (Admin)

{
  "name": "Dr. Jane Smith",
  "title": "Chief Clinical Officer",
  "bio": "Updated bio...",
  "role": "Clinical Services",
  "imageUrl": "/team/jane-smith.jpg",
  "email": "jane@avfy.org",
  "phone": "555-0123"
}
```

#### Delete Team Member (Admin)
```bash
DELETE /api/admin/team/[id]
Authorization: Required (Admin)
```

---

## Common Issues & Solutions

### Issue: "Unauthorized" Error
**Solution**: Make sure you're logged in with the correct role:
- Polls Admin: ADMIN role required
- Polls Viewing: ALUMNI or ADMIN role required
- Team Management: ADMIN role required
- Team Viewing: ADMIN or STAFF role required

### Issue: Team Members Not Showing
**Solution**: 
1. Check browser console for errors
2. Verify you're accessing `/admin/team` (not `/team`)
3. Ensure database has `team_members` table
4. Check that API routes are returning data: `/api/admin/team`

### Issue: Polls Not Appearing for Alumni
**Solution**:
1. Verify poll is set to `active: true` in admin
2. Check that alumni user has ALUMNI role
3. Verify poll hasn't expired (closesAt date)

### Issue: Can't Toggle Poll Active Status
**Solution**:
1. Check browser console for errors
2. Verify PATCH route exists: `/api/admin/community/polls/[id]`
3. Ensure you're logged in as ADMIN

---

## Database Verification

### Check Polls in Database
```sql
SELECT id, title, active, "closesAt", "createdAt" 
FROM community_polls 
ORDER BY "createdAt" DESC;
```

### Check Team Members in Database
```sql
SELECT id, name, title, "isActive", "order" 
FROM team_members 
ORDER BY "order" ASC;
```

### Check Poll Votes
```sql
SELECT p.title, COUNT(v.id) as vote_count,
  SUM(CASE WHEN v.vote = true THEN 1 ELSE 0 END) as yes_votes,
  SUM(CASE WHEN v.vote = false THEN 1 ELSE 0 END) as no_votes
FROM community_polls p
LEFT JOIN community_poll_votes v ON p.id = v."pollId"
GROUP BY p.id, p.title;
```

---

## Success Criteria

### Polls ✓
- [x] Admin can create polls (default active: true)
- [x] Admin can toggle poll active/inactive
- [x] Admin can delete polls
- [x] Alumni can view only active polls
- [x] Alumni can vote on polls
- [x] Vote counts display correctly
- [x] Inactive polls are hidden from alumni

### Team Members ✓
- [ ] Admin can view all team members
- [ ] Admin can add new team members
- [ ] Admin can edit existing team members
- [ ] Admin can delete team members
- [ ] Team member data persists correctly
- [ ] Photos display when URL is provided
- [ ] Form validation works (name and title required)

---

## Next Steps After Testing

1. If polls work correctly: ✅ Issue 1 is resolved
2. If team members work correctly: ✅ Issue 2 is resolved
3. If any issues found: Check browser console and server logs
4. Consider adding more features:
   - Team member ordering (drag-and-drop)
   - Poll results export
   - Email notifications for new polls
   - Team member profile pages
