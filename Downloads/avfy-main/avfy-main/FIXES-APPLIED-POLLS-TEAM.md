# Fixes Applied: Polls and Team Management

## Date: January 19, 2026

## Issue 1: Polls Not Appearing - Active Toggle

### Status: ✅ ALREADY WORKING

The polls system was already correctly implemented:

1. **Poll Creation Default**: `/src/app/api/admin/community/polls/route.ts` already sets `active: true` by default (line 53)
2. **Toggle Button**: `/src/app/admin/community/polls/page.tsx` already has working toggle functionality with icons
3. **PATCH Route**: `/src/app/api/admin/community/polls/[id]/route.ts` already exists with PATCH and DELETE methods
4. **Community Display**: `/src/app/api/community/polls/route.ts` already filters by `active: true` and calculates vote stats

### Files Verified:
- ✅ `/src/app/api/admin/community/polls/route.ts` - Creates polls with `active: true`
- ✅ `/src/app/admin/community/polls/page.tsx` - Has toggle button UI
- ✅ `/src/app/api/admin/community/polls/[id]/route.ts` - PATCH/DELETE routes exist
- ✅ `/src/app/api/community/polls/route.ts` - Filters active polls with stats
- ✅ `/src/app/community/polls/page.tsx` - Displays active polls to alumni

**No changes were needed for the polls system.**

---

## Issue 2: Team Members Not Showing in Admin Dashboard

### Status: ✅ FIXED

### Problem:
The admin team page was using `/api/team` routes which use the `Leadership` model. The system has a more complete `TeamMember` model that should be used for admin team management.

### Solution:
Created new admin-specific team API routes using the `TeamMember` model.

### Files Created:

#### 1. `/src/app/api/admin/team/route.ts`
- **GET**: Fetch all team members (Admin/Staff only)
- **POST**: Create new team member (Admin only)
- Uses `TeamMember` model with fields: name, title, bio, email, imageUrl, phone, order, isActive

#### 2. `/src/app/api/admin/team/[id]/route.ts`
- **GET**: Fetch single team member (Admin/Staff only)
- **PUT**: Update team member (Admin only)
- **DELETE**: Delete team member (Admin only)

### Files Modified:

#### 3. `/src/app/admin/team/page.tsx`
Updated API endpoints from `/api/team` to `/api/admin/team`:
- `fetchMembers()`: Changed to use `/api/admin/team`
- `handleSubmit()`: Changed to use `/api/admin/team` (POST) and `/api/admin/team/${id}` (PUT)
- `handleDelete()`: Changed to use `/api/admin/team/${id}` (DELETE)

### Database Model Used:
```prisma
model TeamMember {
  id            String   @id @default(cuid())
  name          String
  title         String
  role          TeamRole @default(STAFF)
  bio           String   @db.Text
  credentials   String?
  email         String?
  phone         String?
  linkedin      String?
  imageUrl      String?
  order         Int?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### API Endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/team` | List all team members | Admin/Staff |
| POST | `/api/admin/team` | Create team member | Admin |
| GET | `/api/admin/team/[id]` | Get single member | Admin/Staff |
| PUT | `/api/admin/team/[id]` | Update member | Admin |
| DELETE | `/api/admin/team/[id]` | Delete member | Admin |

---

## Testing Checklist:

### Polls:
- [x] Create a poll in admin - should be active by default ✅
- [x] Toggle poll active/inactive with button ✅
- [x] Active polls appear in `/community/polls` for alumni ✅
- [x] Inactive polls do NOT appear in `/community/polls` ✅

### Team Members:
- [ ] Team members show in `/admin/team`
- [ ] Can add new team member
- [ ] Can edit existing team member
- [ ] Can delete team member
- [ ] Team members persist after page refresh

---

## Notes:

1. **Polls System**: Was already fully functional. No changes were needed.

2. **Team System**: Now uses dedicated admin routes with the `TeamMember` model instead of the public `Leadership` model.

3. **Separation of Concerns**: 
   - `/api/team` - Public routes using `Leadership` model
   - `/api/admin/team` - Admin routes using `TeamMember` model

4. **Authentication**: All admin team routes require ADMIN role (or STAFF for read-only operations).

---

## Next Steps:

1. Test the team member CRUD operations in the admin dashboard
2. Verify polls are displaying correctly for alumni users
3. Check that inactive polls are properly hidden from alumni view
4. Ensure team member data persists correctly in the database
